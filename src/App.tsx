import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Player, Team, SoldPlayer, LogEntry, LobbyPlayer, GameScreen, Difficulty, Speed, GameMode, ConnectionStatus, GameStateBroadcast, NetworkMessage } from './types';
import { AuctionNetwork } from './network';
import { ALL_PLAYERS, IPL_TEAMS, INITIAL_BUDGET, getNextBid, getBidIncrement, getRoleEmoji, getRoleColor, formatPrice } from './data';

const TIMER_DUR: Record<Speed, number> = { fast: 6, normal: 10, slow: 15 };
const MAX_SQ = 25;
const MAX_OS = 8;

function playSound(t: string) {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const c = new AC(); const o = c.createOscillator(); const g = c.createGain();
    o.connect(g); g.connect(c.destination); g.gain.value = 0.08;
    const n = c.currentTime;
    if (t === 'bid') { o.frequency.setValueAtTime(800, n); o.start(n); o.stop(n + 0.08); }
    else if (t === 'sold') { g.gain.value = 0.12; o.frequency.setValueAtTime(523, n); o.frequency.setValueAtTime(659, n + 0.15); o.frequency.setValueAtTime(784, n + 0.3); o.start(n); o.stop(n + 0.5); }
    else if (t === 'unsold') { o.frequency.setValueAtTime(300, n); o.frequency.setValueAtTime(200, n + 0.15); o.start(n); o.stop(n + 0.3); }
    else if (t === 'tick') { o.frequency.setValueAtTime(1000, n); g.gain.value = 0.03; o.start(n); o.stop(n + 0.02); }
    else if (t === 'start') { g.gain.value = 0.1; o.frequency.setValueAtTime(440, n); o.frequency.setValueAtTime(554, n + 0.15); o.start(n); o.stop(n + 0.3); }
    else if (t === 'complete') { g.gain.value = 0.1; o.frequency.setValueAtTime(440, n); o.frequency.setValueAtTime(554, n + 0.2); o.frequency.setValueAtTime(659, n + 0.4); o.frequency.setValueAtTime(880, n + 0.6); o.start(n); o.stop(n + 0.8); }
  } catch {}
}

function aiBid(team: Team, player: Player, amt: number, diff: Difficulty): boolean {
  if (team.players.length >= MAX_SQ || amt > team.budget) return false;
  if (player.nationality === 'Overseas' && team.players.filter(p => p.nationality === 'Overseas').length >= MAX_OS) return false;
  const mr: Record<string, number> = { Batter: 7, Bowler: 7, 'All-Rounder': 6, 'Wicket-Keeper': 3 };
  if (team.players.filter(p => p.role === player.role).length >= (mr[player.role] || 5)) return false;
  const av = team.budget - Math.max(MAX_SQ - team.players.length, 1) * 0.3;
  if (amt > av) return false;
  const rm = { easy: 1.0, medium: 1.3, hard: 1.6 }[diff];
  const pm = { aggressive: 1.3, balanced: 1.0, conservative: 0.8 }[team.personality];
  if (amt > Math.min((player.rating / 15) * rm * pm, av, team.budget * 0.4)) return false;
  return Math.random() < { easy: 0.35, medium: 0.55, hard: 0.72 }[diff] * (player.rating / 100);
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('landing');
  const [mode, setMode] = useState<GameMode | null>(null);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('disconnected');
  const [myName, setMyName] = useState('');
  const [myTeamId, setMyTeamId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [speed, setSpeed] = useState<Speed>('normal');
  const [darkMode] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerQueue, setPlayerQueue] = useState<Player[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [curPlayer, setCurPlayer] = useState<Player | null>(null);
  const [curBid, setCurBid] = useState<{ teamId: string; amount: number } | null>(null);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'active' | 'resolving'>('idle');
  const [resolveRes, setResolveRes] = useState<'sold' | 'unsold'>('unsold');
  const [soldPlayers, setSoldPlayers] = useState<SoldPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bidRound, setBidRound] = useState(0);
  const [done, setDone] = useState(false);
  const [winTeam, setWinTeam] = useState('');
  const [showSq, setShowSq] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [autoBid, setAutoBid] = useState(false);
  const [autoMax, setAutoMax] = useState(10);
  const [sqFilter, setSqFilter] = useState('all');
  const [notif, setNotif] = useState('');

  // Refs
  const netRef = useRef<AuctionNetwork | null>(null);
  const refs = useRef({ phase, curBid, teams, curPlayer, soundOn, queueIndex, playerQueue, mode, speed, difficulty, lobbyPlayers, myTeamId });
  useEffect(() => { refs.current = { phase, curBid, teams, curPlayer, soundOn, queueIndex, playerQueue, mode, speed, difficulty, lobbyPlayers, myTeamId }; });

  const aiT = useRef<number[]>([]);
  const resT = useRef<number | null>(null);
  const logId = useRef(0);
  const isHost = mode === 'host' || mode === 'solo';
  const myTeam = useMemo(() => teams.find(t => t.ownerPeerId === 'self' || t.id === refs.current.myTeamId), [teams, myTeamId]);
  const tdur = () => TIMER_DUR[speed];
  const snd = (t: string) => { if (refs.current.soundOn) playSound(t); };
  const notify = (m: string) => { setNotif(m); setTimeout(() => setNotif(''), 3500); };
  const addLog = useCallback((m: string, t: LogEntry['type'], tid?: string) => {
    setLogs(p => [{ id: logId.current++, message: m, type: t, teamId: tid, timestamp: Date.now() }, ...p].slice(0, 200));
  }, []);

  // Broadcast
  const bcast = useCallback((extra?: Partial<GameStateBroadcast>) => {
    const n = netRef.current;
    if (!n || refs.current.mode !== 'host') return;
    const d: GameStateBroadcast = {
      teams, currentPlayer: curPlayer, currentBid: curBid, timer, phase,
      resolveResult: resolveRes, soldPlayers, unsoldPlayers, activityLog: logs,
      queueIndex, playerQueueLength: refs.current.playerQueue.length,
      auctionComplete: done, winningTeamId: winTeam, ...extra,
    };
    n.broadcast({ type: 'game_state', data: JSON.parse(JSON.stringify(d)) });
  }, [teams, curPlayer, curBid, timer, phase, resolveRes, soldPlayers, unsoldPlayers, logs, queueIndex, done, winTeam]);

  const bcastLobby = useCallback((players: LobbyPlayer[]) => {
    const n = netRef.current;
    if (!n || refs.current.mode !== 'host') return;
    const taken = players.map(p => p.teamId).filter(Boolean);
    const avail = IPL_TEAMS.filter(t => !taken.includes(t.id)).map(t => t.id);
    n.broadcast({ type: 'lobby_state', data: { players, availableTeamIds: avail, roomCode } });
  }, [roomCode]);

  // Network handlers
  const onHostMsg = useCallback((pid: string, msg: NetworkMessage) => {
    if (msg.type === 'join') {
      const name = msg.data.name || 'Player';
      setLobbyPlayers(prev => {
        if (prev.some(p => p.peerId === pid)) return prev;
        const up = [...prev, { peerId: pid, name, teamId: '', isHost: false, isReady: false }];
        bcastLobby(up);
        addLog('👋 ' + name + ' joined', 'system');
        return up;
      });
    } else if (msg.type === 'select_team') {
      setLobbyPlayers(prev => {
        const tid = msg.data.teamId;
        if (prev.some(p => p.teamId === tid && p.peerId !== pid)) {
          netRef.current?.sendTo(pid, { type: 'error', data: { message: 'Team taken!' } });
          return prev;
        }
        const up = prev.map(p => p.peerId === pid ? { ...p, teamId: tid } : p);
        bcastLobby(up);
        const pl = up.find(p => p.peerId === pid);
        if (pl) addLog('🎽 ' + pl.name + ' picked ' + (IPL_TEAMS.find(t => t.id === tid)?.shortName || tid), 'info');
        return up;
      });
    } else if (msg.type === 'bid') {
      const { teamId, amount } = msg.data;
      if (refs.current.phase !== 'active' || !refs.current.curPlayer) return;
      const lp = refs.current.lobbyPlayers.find(p => p.peerId === pid && p.teamId === teamId);
      if (!lp) return;
      const team = refs.current.teams.find(t => t.id === teamId);
      if (!team || amount > team.budget || team.players.length >= MAX_SQ) return;
      doBid(teamId, amount);
    }
  }, [bcastLobby, addLog]);

  const onClientMsg = useCallback((_pid: string, msg: NetworkMessage) => {
    if (msg.type === 'lobby_state') {
      setLobbyPlayers(msg.data.players);

      const me = msg.data.players.find(
        (p: any) => p.name === myName
      );

      if (me?.teamId) {
        setMyTeamId(me.teamId);
      }
    }
    else if (msg.type === 'game_state') {
      const d = msg.data as GameStateBroadcast;
      setTeams(d.teams); setCurPlayer(d.currentPlayer); setCurBid(d.currentBid);
      setTimer(d.timer); setPhase(d.phase); setResolveRes(d.resolveResult);
      setSoldPlayers(d.soldPlayers); setUnsoldPlayers(d.unsoldPlayers);
      setLogs(d.activityLog); setQueueIndex(d.queueIndex);
      setDone(d.auctionComplete); setWinTeam(d.winningTeamId);
      setScreen('auction');
    } else if (msg.type === 'error') notify(msg.data.message || 'Error');
  }, [notify, myName]);

  const cleanup = useCallback(() => {
    aiT.current.forEach(clearTimeout); aiT.current = [];
    if (resT.current) clearTimeout(resT.current);
    netRef.current?.destroy(); netRef.current = null;
    setMode(null); setConnStatus('disconnected');
  }, []);

  const doBid = useCallback((tid: string, amt: number) => {
    if (refs.current.phase !== 'active') return;
    const t = refs.current.teams.find(t => t.id === tid);
    if (!t || amt > t.budget) return;
    setCurBid({ teamId: tid, amount: amt });
    setWinTeam(tid);
    const d = TIMER_DUR[refs.current.speed];
    setTimer(d);
    setBidRound(r => r + 1);
    addLog(t.shortName + ' bids ' + formatPrice(amt), 'bid', tid);
    snd('bid');
    if (refs.current.mode === 'host') {
      bcast({ currentBid: { teamId: tid, amount: amt }, timer: d, winningTeamId: tid });
    }
  }, [addLog, bcast]);

  const presentPlayer = useCallback((idx: number, q?: Player[]) => {
    const queue = q || refs.current.playerQueue;
    if (idx >= queue.length) {
      setDone(true); setPhase('idle'); setCurPlayer(null);
      addLog('🏁 Auction Complete!', 'system'); snd('complete');
      if (refs.current.mode === 'host') bcast({ auctionComplete: true, phase: 'idle', currentPlayer: null });
      return;
    }
    const p = queue[idx];
    setCurPlayer(p); setQueueIndex(idx); setCurBid(null); setBidRound(0); setWinTeam('');
    const d = TIMER_DUR[refs.current.speed];
    setPhase('active'); setTimer(d);
    addLog('📋 Next: ' + p.name + ' (' + p.role + ') — ' + formatPrice(p.basePrice), 'info');
    snd('start');
    if (refs.current.mode === 'host') {
      bcast({ currentPlayer: p, currentBid: null, timer: d, phase: 'active', winningTeamId: '', queueIndex: idx, auctionComplete: false });
    }
  }, [addLog, bcast]);

  const onTimerExpire = useCallback(() => {
    if (refs.current.phase !== 'active' || !refs.current.curPlayer) return;
    setPhase('resolving');
    aiT.current.forEach(clearTimeout); aiT.current = [];
    const player = refs.current.curPlayer;
    const bid = refs.current.curBid;
    if (bid) {
      setResolveRes('sold');
      setTeams(prev => prev.map(t => t.id === bid.teamId ? { ...t, budget: Math.round((t.budget - bid.amount) * 100) / 100, players: [...t.players, player] } : t));
      const sp = { player, teamId: bid.teamId, amount: bid.amount };
      setSoldPlayers(prev => [...prev, sp]);
      const team = refs.current.teams.find(t => t.id === bid.teamId);
      addLog('🎉 SOLD! ' + player.name + ' → ' + (team?.shortName || '?') + ' for ' + formatPrice(bid.amount), 'sold', bid.teamId);
      snd('sold');
      if (refs.current.mode === 'host') {
        bcast({ phase: 'resolving', resolveResult: 'sold', winningTeamId: bid.teamId });
      }
    } else {
      setResolveRes('unsold');
      setUnsoldPlayers(prev => [...prev, player]);
      addLog('❌ UNSOLD! ' + player.name, 'unsold'); snd('unsold');
      if (refs.current.mode === 'host') {
        bcast({ phase: 'resolving', resolveResult: 'unsold' });
      }
    }
    resT.current = window.setTimeout(() => {
      setPhase('idle'); setCurPlayer(null);
      const ni = refs.current.queueIndex + 1;
      setQueueIndex(ni);
      setTimeout(() => presentPlayer(ni), 600);
    }, 2500);
  }, [addLog, bcast, presentPlayer]);

  const startGame = useCallback(() => {
    const sh = [...ALL_PLAYERS].sort(() => Math.random() - 0.5);
    const mq = sh.filter(p => p.isMarquee).sort(() => Math.random() - 0.5);
    const rest = sh.filter(p => !p.isMarquee).sort(() => Math.random() - 0.5);
    const fq = [...mq, ...rest];
    const taken = refs.current.lobbyPlayers.filter(p => p.teamId).map(p => p.teamId);
    const unclaimed = IPL_TEAMS.filter(t => !taken.includes(t.id));
    const pers: Team['personality'][] = ['aggressive', 'balanced', 'conservative'];
    const gt: Team[] = [];
    for (const lp of refs.current.lobbyPlayers.filter(p => p.teamId)) {
      const ipl = IPL_TEAMS.find(t => t.id === lp.teamId)!;
      gt.push({ ...ipl, budget: INITIAL_BUDGET, initialBudget: INITIAL_BUDGET, players: [], isAI: false, personality: 'balanced', ownerName: lp.name, ownerPeerId: lp.isHost ? 'self' : lp.peerId });
    }
    for (const ipl of unclaimed) {
      gt.push({ ...ipl, budget: INITIAL_BUDGET, initialBudget: INITIAL_BUDGET, players: [], isAI: true, personality: pers[Math.floor(Math.random() * 3)] });
    }
    setTeams(gt); setPlayerQueue(fq); setQueueIndex(0); setSoldPlayers([]); setUnsoldPlayers([]);
    setLogs([]); setBidRound(0); setDone(false); setPhase('idle'); setCurPlayer(null);
    setShowSq(false); setShowBoard(false);
    addLog('🏟️ IPL Mega Auction begins!', 'system');
    addLog('💰 ' + gt.length + ' teams, ₹' + INITIAL_BUDGET + ' Cr each', 'info');
    setScreen('auction');
    if (refs.current.mode === 'host') {
      for (const lp of refs.current.lobbyPlayers.filter(p => !p.isHost && p.teamId)) {
        netRef.current?.sendTo(lp.peerId, { type: 'game_state', data: { teams: gt, currentPlayer: null, currentBid: null, timer: 0, phase: 'idle', resolveResult: 'unsold' as const, soldPlayers: [], unsoldPlayers: [], activityLog: [], queueIndex: 0, playerQueueLength: fq.length, auctionComplete: false, winningTeamId: '' } });
      }
    }
    setTimeout(() => presentPlayer(0, fq), 1500);
  }, [addLog, presentPlayer]);

  // Create Room
  const createRoom = async () => {
    if (!myName.trim()) { notify('Enter your name'); return; }
    if (!myTeamId) { notify('Pick a team'); return; }
    setConnStatus('connecting');
    try {
      const n = new AuctionNetwork();

      n.onMessage = onHostMsg;

      n.onConnect = (pid) => {
        const taken = lobbyPlayers
          .map(p => p.teamId)
          .filter(Boolean);

        const avail = IPL_TEAMS
          .filter(t => !taken.includes(t.id))
          .map(t => t.id);

        n.sendTo(pid, {
          type: 'lobby_state',
          data: {
            players: lobbyPlayers,
            availableTeamIds: avail,
            roomCode: code
          }
        });
      };

      n.onDisconnect = (pid) => {
        setLobbyPlayers(prev => { const up = prev.filter(p => p.peerId !== pid); bcastLobby(up); addLog('👋 Player disconnected', 'system'); return up; });
      };
      const code = await n.createRoom();
      netRef.current = n; setMode('host'); setRoomCode(code); setConnStatus('connected');
      setLobbyPlayers([{ peerId: 'host', name: myName, teamId: myTeamId, isHost: true, isReady: true }]);
      setScreen('lobby');
    } catch (e: any) { notify('Failed: ' + (e.message || 'Error')); setConnStatus('error'); }
  };

  // Join Room
  const joinRoom = async () => {
    if (!myName.trim()) { notify('Enter your name'); return; }
    if (!joinCode.trim()) { notify('Enter room code'); return; }
    setConnStatus('connecting');
    try {
      const n = new AuctionNetwork();
      n.onMessage = onClientMsg;
      n.onDisconnect = () => { notify('⚠️ Lost connection'); setTimeout(() => { cleanup(); setScreen('landing'); }, 2000); };
      await n.joinRoom(joinCode);
      netRef.current = n; setMode('client'); setRoomCode(joinCode.toUpperCase()); setConnStatus('connected');
      setTimeout(() => {
        n.sendToHost({
          type: 'join',
          data: { name: myName }
        });
      }, 500);
      setScreen('lobby');
    } catch (e: any) { notify('Failed: ' + (e.message || 'Not found')); setConnStatus('error'); cleanup(); }
  };

  const pickTeam = (tid: string) => {
    const taken = lobbyPlayers.some(p => p.teamId === tid && !(mode === 'host' && p.peerId === 'host'));
    if (taken) { notify('Team taken!'); return; }
    setMyTeamId(tid);
    if (mode === 'host') {
      setLobbyPlayers(prev => { const up = prev.map(p => p.isHost ? { ...p, teamId: tid } : p); bcastLobby(up); return up; });
    } else {
      netRef.current?.sendToHost({ type: 'select_team', data: { teamId: tid } });
    }
  };

  // Timer effect (host/solo)
  useEffect(() => {
    if (!isHost || phase !== 'active') return;
    const iv = setInterval(() => {
      setTimer(p => { if (p <= 1) { clearInterval(iv); onTimerExpire(); return 0; } if (p <= 3) snd('tick'); return p - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, isHost, onTimerExpire]);

  // Client timer
  useEffect(() => {
    if (mode !== 'client' || phase !== 'active') return;
    const iv = setInterval(() => setTimer(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [mode, phase]);

  // AI bidding
  useEffect(() => {
    if (!isHost || phase !== 'active' || !curPlayer) return;
    aiT.current.forEach(clearTimeout); aiT.current = [];
    const diff = refs.current.difficulty;
    teams.filter(t => t.isAI).forEach(team => {
      const delay = 800 + Math.random() * 2500;
      const tid = window.setTimeout(() => {
        if (refs.current.phase !== 'active') return;
        const ba = refs.current.curBid?.amount || 0;
        const na = ba > 0 ? getNextBid(ba, curPlayer.basePrice) : curPlayer.basePrice;
        const t2 = refs.current.teams.find(tt => tt.id === team.id);
        if (t2 && aiBid(t2, curPlayer, na, diff)) doBid(team.id, na);
      }, delay);
      aiT.current.push(tid);
    });
    return () => { aiT.current.forEach(clearTimeout); aiT.current = []; };
  }, [bidRound, phase, curPlayer, teams, isHost, doBid]);

  // Auto-bid
  useEffect(() => {
    if (!autoBid || phase !== 'active' || !curPlayer || !myTeam || !myTeamId) return;
    if (curBid?.teamId === myTeamId) return;
    const ba = curBid?.amount || 0;
    const na = ba > 0 ? getNextBid(ba, curPlayer.basePrice) : curPlayer.basePrice;
    if (na <= autoMax && na <= myTeam.budget) {
      const tid = setTimeout(() => {
        if (refs.current.phase === 'active') {
          if (isHost) doBid(myTeamId, na);
          else netRef.current?.sendToHost({ type: 'bid', data: { teamId: myTeamId, amount: na } });
        }
      }, 1500);
      return () => clearTimeout(tid);
    }
  }, [autoBid, autoMax, bidRound, phase, curPlayer, myTeam, myTeamId, curBid, isHost, doBid]);

  // Keyboard
  useEffect(() => {
    if (screen !== 'auction' || phase !== 'active' || !curPlayer || !myTeamId) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') {
        const ba = refs.current.curBid?.amount || 0;
        const na = ba > 0 ? getNextBid(ba, curPlayer.basePrice) : curPlayer.basePrice;
        const t = refs.current.teams.find(tt => tt.id === refs.current.myTeamId);
        if (t && na <= t.budget) {
          if (isHost) doBid(refs.current.myTeamId, na);
          else netRef.current?.sendToHost({ type: 'bid', data: { teamId: refs.current.myTeamId, amount: na } });
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [screen, phase, curPlayer, myTeamId, isHost, doBid]);

  useEffect(() => () => { aiT.current.forEach(clearTimeout); if (resT.current) clearTimeout(resT.current); netRef.current?.destroy(); }, []);

  // Results data
  const rankings = useMemo(() => [...teams].sort((a, b) => b.players.reduce((s, p) => s + p.rating, 0) - a.players.reduce((s, p) => s + p.rating, 0)), [teams]);
  const awards = useMemo(() => {
    if (!soldPlayers.length) return [];
    const me = [...soldPlayers].sort((a, b) => b.amount - a.amount)[0];
    const bv = [...soldPlayers].sort((a, b) => (b.player.rating / b.amount) - (a.player.rating / a.amount))[0];
    const st = rankings[0];
    return [
      { title: 'Most Expensive', emoji: '💰', winner: teams.find(t => t.id === me.teamId)?.shortName || '?', detail: me.player.name + ' — ' + formatPrice(me.amount) },
      { title: 'Best Value', emoji: '💎', winner: teams.find(t => t.id === bv.teamId)?.shortName || '?', detail: bv.player.name + ' — ' + formatPrice(bv.amount) },
      { title: 'Strongest', emoji: '🏆', winner: st?.shortName || '?', detail: 'Rating: ' + (st?.players.reduce((s, p) => s + p.rating, 0) || 0) },
    ];
  }, [soldPlayers, teams, rankings]);

  const getNextBids = (): number[] => {
    if (!curPlayer) return [];
    const ba = curBid?.amount || 0;
    const f = ba > 0 ? getNextBid(ba, curPlayer.basePrice) : curPlayer.basePrice;
    const inc = getBidIncrement(f);
    return [f, Math.round((f + inc) * 100) / 100, Math.round((f + inc * 2) * 100) / 100];
  };

  const getT = (id: string) => teams.find(t => t.id === id);
  const progress = playerQueue.length > 0 ? (queueIndex / playerQueue.length) * 100 : 0;

  // ═══════════════════════════════════════════
  // LANDING
  // ═══════════════════════════════════════════
  const renderLanding = () => (
    <div className="min-h-screen gradient-hero text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="animate-float mb-4"><span className="text-6xl md:text-8xl">🏏</span></div>
        <h1 className="text-4xl md:text-7xl font-black text-gradient-gold mb-3 tracking-tight">IPL AUCTION ARENA</h1>
        <p className="text-lg md:text-xl text-slate-300 mb-1">Real-Time Multiplayer - No Login Required</p>
        <p className="text-sm text-slate-400 mb-8">Create a room, share the code, bid with friends!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-8">
          {/* Create Room */}
          <div className="glass-effect rounded-2xl p-5 player-card-hover">
            <div className="text-3xl mb-2">🏟️</div>
            <h3 className="text-lg font-bold text-gradient-gold mb-1">Create Room</h3>
            <p className="text-xs text-slate-400 mb-3">Host an auction</p>
            <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm mb-2 focus:outline-none focus:border-amber-500" />
            <select value={myTeamId} onChange={e => setMyTeamId(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none">
              <option value="">Pick team</option>
              {IPL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.shortName}</option>)}
            </select>
            <div className="flex gap-2 mb-2">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="flex-1 bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-white text-xs">
                <option value="easy">🟢 Easy</option><option value="medium">🟡 Medium</option><option value="hard">🔴 Hard</option>
              </select>
              <select value={speed} onChange={e => setSpeed(e.target.value as Speed)} className="flex-1 bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-white text-xs">
                <option value="fast">⚡ Fast</option><option value="normal">🕐 Normal</option><option value="slow">🐢 Slow</option>
              </select>
            </div>
            <button onClick={createRoom} disabled={connStatus === 'connecting'} className="w-full gradient-gold text-black font-bold py-2 rounded-xl bid-button text-sm">
              {connStatus === 'connecting' ? '⏳ Creating...' : '🚀 Create Room'}
            </button>
          </div>

          {/* Join Room */}
          <div className="glass-effect rounded-2xl p-5 player-card-hover">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="text-lg font-bold text-gradient-gold mb-1">Join Room</h3>
            <p className="text-xs text-slate-400 mb-3">Enter a room code</p>
            <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm mb-2 focus:outline-none focus:border-amber-500" />
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Room code"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm font-mono text-center tracking-widest mb-3 focus:outline-none focus:border-amber-500" maxLength={6} />
            <button onClick={joinRoom} disabled={connStatus === 'connecting'} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl bid-button text-sm">
              {connStatus === 'connecting' ? '⏳ Joining...' : '🔗 Join Room'}
            </button>
          </div>

          {/* Solo */}
          <div className="glass-effect rounded-2xl p-5 player-card-hover">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="text-lg font-bold text-gradient-gold mb-1">Solo Play</h3>
            <p className="text-xs text-slate-400 mb-3">Play against AI</p>
            <input type="text" value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name"
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm mb-2 focus:outline-none focus:border-amber-500" />
            <select value={myTeamId} onChange={e => setMyTeamId(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none">
              <option value="">Pick team</option>
              {IPL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.shortName}</option>)}
            </select>
            <div className="flex gap-2 mb-2">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="flex-1 bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-white text-xs">
                <option value="easy">🟢 Easy</option><option value="medium">🟡 Medium</option><option value="hard">🔴 Hard</option>
              </select>
              <select value={speed} onChange={e => setSpeed(e.target.value as Speed)} className="flex-1 bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-white text-xs">
                <option value="fast">⚡ Fast</option><option value="normal">🕐 Normal</option><option value="slow">🐢 Slow</option>
              </select>
            </div>
            <button onClick={() => {
              if (!myName.trim()) { notify('Enter name'); return; }
              if (!myTeamId) { notify('Pick team'); return; }
              setLobbyPlayers([{ peerId: 'host', name: myName, teamId: myTeamId, isHost: true, isReady: true }]);
              setMode('solo'); setConnStatus('connected');
              startGame();
            }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl bid-button text-sm">
              🎮 Play Solo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full">
          {[{ e: '👥', t: 'Multiplayer', d: 'No login needed' }, { e: '🤖', t: 'AI Teams', d: 'Fills empty slots' }, { e: '💰', t: '₹120 Cr Budget', d: 'Manage wisely' }, { e: '🔊', t: 'Sound FX', d: 'Immersive audio' }].map((f, i) => (
            <div key={i} className="glass-effect rounded-xl p-3 text-center animate-slide-up" style={{ animationDelay: i * 50 + 'ms' }}>
              <div className="text-xl mb-1">{f.e}</div>
              <div className="font-semibold text-xs">{f.t}</div>
              <div className="text-xs text-slate-500">{f.d}</div>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center py-4 text-slate-600 text-xs">Made with ❤️ for Cricket Fans</footer>
    </div>
  );

  // ═══════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════
  const renderLobby = () => {
    const canStart = mode === 'host' && lobbyPlayers.some(p => p.teamId);
    return (
      <div className="min-h-screen gradient-hero text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => { cleanup(); setScreen('landing'); }} className="text-slate-400 hover:text-white mb-4 text-sm">← Back</button>
          <h2 className="text-3xl font-black text-gradient-gold mb-6 text-center">🏟️ Auction Lobby</h2>

          <div className="glass-effect rounded-2xl p-6 text-center mb-6">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Room Code</div>
            <div className="text-5xl font-black font-mono tracking-[0.3em] text-gradient-gold mb-3">{roomCode}</div>
            {mode === 'host' && (
              <button onClick={() => { navigator.clipboard.writeText(roomCode); notify('✅ Copied!'); }}
                className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg text-sm font-semibold">📋 Copy Code</button>
            )}
            <div className="text-xs text-slate-400 mt-3">
              {mode === 'host' ? 'Share this code with friends' : 'Connected as ' + myName}
              <span className={'ml-2 inline-block w-2 h-2 rounded-full ' + (connStatus === 'connected' ? 'bg-green-500' : 'bg-red-500')} />
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-sm mb-3 text-slate-300">👥 Players ({lobbyPlayers.length}/10)</h3>
            <div className="space-y-2">
              {lobbyPlayers.map(p => {
                const tm = IPL_TEAMS.find(t => t.id === p.teamId);
                return (
                  <div key={p.peerId} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: tm?.color || '#475569', color: tm?.textColor || '#fff' }}>{tm?.shortName?.substring(0, 2) || '?'}</div>
                    <div className="flex-1"><div className="font-semibold text-sm">{p.name} {p.isHost && '(Host) 👑'}</div><div className="text-xs text-slate-400">{tm?.name || 'No team'}</div></div>
                  </div>
                );
              })}
              {lobbyPlayers.length === 0 && <div className="text-slate-500 text-sm text-center py-4">Waiting...</div>}
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-sm mb-3 text-slate-300">🎽 Select Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {IPL_TEAMS.map(team => {
                const owner = lobbyPlayers.find(p => p.teamId === team.id);
                const isMe = myTeamId === team.id;
                return (
                  <button key={team.id} onClick={() => (!owner || isMe) && pickTeam(team.id)}
                    className={'rounded-xl p-3 text-center transition-all border-2 ' + (isMe ? 'border-amber-400 scale-105 shadow-lg' : owner ? 'border-transparent opacity-40' : 'border-transparent opacity-80 hover:opacity-100 hover:border-slate-500')}
                    style={{ backgroundColor: team.color + '25' }}>
                    <div className="text-2xl mb-1">{team.emoji}</div>
                    <div className="font-bold text-xs" style={{ color: team.color }}>{team.shortName}</div>
                    <div className="text-xs">{owner ? (isMe ? '✅ You' : owner.name) : <span className="text-green-400">Available</span>}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'host' && (
            <div className="glass-effect rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-end">
              <div><label className="text-xs text-slate-400">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="block bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm">
                  <option value="easy">🟢 Easy</option><option value="medium">🟡 Medium</option><option value="hard">🔴 Hard</option></select></div>
              <div><label className="text-xs text-slate-400">Speed</label>
                <select value={speed} onChange={e => setSpeed(e.target.value as Speed)} className="block bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm">
                  <option value="fast">⚡ Fast</option><option value="normal">🕐 Normal</option><option value="slow">🐢 Slow</option></select></div>
              <label className="flex items-center gap-2 cursor-pointer pb-1"><input type="checkbox" checked={soundOn} onChange={e => setSoundOn(e.target.checked)} className="accent-amber-500" /><span className="text-sm">🔊 Sound</span></label>
            </div>
          )}

          <div className="text-center">
            {mode === 'host' ? (
              <button onClick={startGame} disabled={!canStart} className={'gradient-gold text-black font-bold text-lg px-12 py-4 rounded-2xl bid-button shadow-lg shadow-amber-500/25 ' + (!canStart ? 'opacity-40 cursor-not-allowed' : '')}>
                🚀 Start Auction! ({lobbyPlayers.filter(p => p.teamId).length} ready)
              </button>
            ) : (
              <div className="glass-effect rounded-xl p-6">
                <div className="text-3xl mb-2 animate-float">⏳</div>
                <p className="text-slate-300 font-semibold">Waiting for host to start...</p>
                <p className="text-xs text-slate-400 mt-1">Select a team above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // AUCTION
  // ═══════════════════════════════════════════
  const renderAuction = () => {
    const nextBids = getNextBids();
    const isMyBid = curBid?.teamId === myTeamId;
    const osCount = myTeam?.players.filter(p => p.nationality === 'Overseas').length || 0;
    const canOS = !curPlayer || curPlayer.nationality === 'Indian' || osCount < MAX_OS;
    const sqFull = (myTeam?.players.length || 0) >= MAX_SQ;

    return (
      <div className={'min-h-screen ' + (darkMode ? 'bg-[#0c1222]' : 'bg-gray-100') + ' text-white flex flex-col'}>
        <div className={'px-3 py-2 flex items-center justify-between flex-wrap gap-2 ' + (darkMode ? 'glass-effect' : 'bg-white shadow')}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏏</span>
            <div>
              <div className="font-bold text-xs text-gradient-gold">IPL AUCTION ARENA</div>
              <div className="text-xs text-slate-400">
                {mode === 'solo' ? 'Solo' : mode === 'host' ? '👑 Host' : '🔗 Connected'}
                <span className={'ml-1 inline-block w-1.5 h-1.5 rounded-full ' + (connStatus === 'connected' ? 'bg-green-500' : 'bg-red-500')} />
                {' | ' + (queueIndex + 1) + '/' + (playerQueue.length || '?')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSq(true)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600">👥 {myTeam?.players.length || 0}</button>
            <button onClick={() => setShowBoard(true)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600">📊</button>
            {isHost && <button onClick={() => setScreen('results')} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400">🏁 End</button>}
          </div>
        </div>

        <div className={'h-1 ' + (darkMode ? 'bg-slate-800' : 'bg-gray-200')}>
          <div className="h-full gradient-gold transition-all duration-500" style={{ width: progress + '%' }} />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 max-w-7xl mx-auto w-full">
          {/* Left */}
          <div className="lg:w-2/5 flex flex-col gap-3">
            {curPlayer ? (
              <div className={'animate-scale-in rounded-2xl p-5 ' + (darkMode ? 'glass-effect' : 'bg-white shadow-xl')}>
                {phase === 'resolving' && (
                  <div className={'mb-3 p-3 rounded-xl text-center font-bold animate-bounce-in ' + (resolveRes === 'sold' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30')}>
                    {resolveRes === 'sold' ? '🎉 SOLD! → ' + (getT(winTeam)?.shortName || '?') : '❌ UNSOLD'}
                  </div>
                )}
                <div className="text-center mb-3">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-2 border-4" style={{ borderColor: getRoleColor(curPlayer.role), background: getRoleColor(curPlayer.role) + '20' }}>{getRoleEmoji(curPlayer.role)}</div>
                  {curPlayer.isMarquee && <div className="text-amber-400 text-xs font-bold mb-0.5">⭐ MARQUEE</div>}
                  <h2 className="text-xl font-black">{curPlayer.name}</h2>
                  <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: getRoleColor(curPlayer.role) + '30', color: getRoleColor(curPlayer.role) }}>{curPlayer.role}</span>
                    <span className={'px-2 py-0.5 rounded-full text-xs font-semibold ' + (curPlayer.nationality === 'Indian' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400')}>{curPlayer.country}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{curPlayer.speciality}</div>
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs text-slate-400">Base Price</div>
                  <div className="text-2xl font-black text-gradient-gold">{formatPrice(curPlayer.basePrice)}</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[{ v: curPlayer.stats.matches, l: 'Mat' },
                    ...(curPlayer.stats.runs !== undefined ? [{ v: (curPlayer.stats.runs / 1000).toFixed(1) + 'k', l: 'Runs' }] : []),
                    ...(curPlayer.stats.wickets !== undefined ? [{ v: curPlayer.stats.wickets, l: 'Wkt' }] : []),
                    ...(curPlayer.stats.average !== undefined ? [{ v: curPlayer.stats.average, l: 'Avg' }] : []),
                    ...(curPlayer.stats.strikeRate !== undefined ? [{ v: curPlayer.stats.strikeRate, l: 'SR' }] : []),
                    ...(curPlayer.stats.economy !== undefined ? [{ v: curPlayer.stats.economy, l: 'Econ' }] : []),
                  ].slice(0, 6).map((s, i) => (
                    <div key={i} className={'rounded-lg p-2 text-center ' + (darkMode ? 'bg-slate-800/50' : 'bg-gray-100')}>
                      <div className="text-sm font-bold">{s.v}</div><div className="text-xs text-slate-400">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-slate-400">Rating</span><span className="text-amber-400 font-bold">{curPlayer.rating}/100</span></div>
                <div className={'h-1.5 rounded-full ' + (darkMode ? 'bg-slate-700' : 'bg-gray-200')}><div className="h-full rounded-full gradient-gold" style={{ width: curPlayer.rating + '%' }} /></div>
              </div>
            ) : done ? (
              <div className={'rounded-2xl p-6 text-center animate-scale-in ' + (darkMode ? 'glass-effect' : 'bg-white shadow-xl')}>
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="text-xl font-black text-gradient-gold mb-2">Auction Complete!</h3>
                <button onClick={() => setScreen('results')} className="gradient-gold text-black font-bold px-6 py-2 rounded-xl bid-button text-sm">View Results →</button>
              </div>
            ) : (
              <div className={'rounded-2xl p-6 text-center ' + (darkMode ? 'glass-effect' : 'bg-white shadow-xl')}>
                <div className="text-3xl mb-3 animate-float">⏳</div><p className="text-slate-400 text-sm">Loading...</p>
              </div>
            )}

            {myTeam && (
              <div className={'rounded-2xl p-3 ' + (darkMode ? 'glass-effect' : 'bg-white shadow')}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: myTeam.color, color: myTeam.textColor }}>{myTeam.shortName[0]}</div>
                    <div><div className="font-bold text-xs">{myTeam.shortName}</div><div className="text-xs text-slate-400">{myTeam.players.length}/{MAX_SQ}</div></div>
                  </div>
                  <div className="text-right"><div className="font-bold text-sm text-gradient-gold">{formatPrice(myTeam.budget)}</div><div className="text-xs text-slate-400">left</div></div>
                </div>
                <div className={'h-1 rounded-full ' + (darkMode ? 'bg-slate-700' : 'bg-gray-200')}><div className="h-full rounded-full bg-green-500" style={{ width: (myTeam.budget / myTeam.initialBudget * 100) + '%' }} /></div>
                <div className="flex gap-2 text-xs text-slate-400 mt-1.5">
                  <span>🇮🇳{myTeam.players.filter(p => p.nationality === 'Indian').length}</span>
                  <span>🌍{osCount}/{MAX_OS}</span>
                  <span>🏏{myTeam.players.filter(p => p.role === 'Batter').length}</span>
                  <span>🎯{myTeam.players.filter(p => p.role === 'Bowler').length}</span>
                  <span>⭐{myTeam.players.filter(p => p.role === 'All-Rounder').length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="lg:w-3/5 flex flex-col gap-3">
            {curPlayer && phase === 'active' && (
              <div className={'animate-slide-up rounded-2xl p-5 ' + (darkMode ? 'glass-effect' : 'bg-white shadow-xl')}>
                <div className="text-center mb-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Current Bid</div>
                  <div className="text-3xl md:text-5xl font-black text-gradient-gold tabular-nums">{curBid ? formatPrice(curBid.amount) : formatPrice(curPlayer.basePrice)}</div>
                  {curBid && (
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: getT(curBid.teamId)?.color, color: getT(curBid.teamId)?.textColor }}>{getT(curBid.teamId)?.shortName?.[0]}</div>
                      <span className="text-sm font-semibold" style={{ color: getT(curBid.teamId)?.color }}>{getT(curBid.teamId)?.shortName}</span>
                      {isMyBid && <span className="text-green-400 text-xs">(You!)</span>}
                    </div>
                  )}
                </div>
                <div className="flex justify-center mb-4">
                  <div className={'relative w-16 h-16 ' + (timer <= 3 && timer > 0 ? 'animate-timer-pulse' : '')}>
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke={darkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={timer <= 3 ? '#ef4444' : '#f59e0b'} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42 * (timer / tdur()) + ' ' + 2 * Math.PI * 42} className="transition-all duration-1000" />
                    </svg>
                    <div className={'absolute inset-0 flex items-center justify-center text-xl font-black ' + (timer <= 3 ? 'text-red-400' : 'text-white')}>{timer}</div>
                  </div>
                </div>
                {myTeamId && !sqFull && canOS && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      {nextBids.map((amt, i) => {
                        const ok = amt <= (myTeam?.budget || 0);
                        return (
                          <button key={i} onClick={() => { if (isHost) doBid(myTeamId, amt); else netRef.current?.sendToHost({ type: 'bid', data: { teamId: myTeamId, amount: amt } }); }}
                            disabled={!ok || phase !== 'active'}
                            className={'py-2.5 rounded-xl font-bold text-sm transition-all ' + (ok && phase === 'active' ? 'gradient-gold text-black bid-button' : 'bg-slate-700/30 text-slate-500 cursor-not-allowed')}>
                            {formatPrice(amt)}{i === 0 && <div className="text-xs opacity-60">Quick</div>}
                          </button>
                        );
                      })}
                    </div>
                    <div className={'flex items-center gap-2 p-2.5 rounded-xl ' + (darkMode ? 'bg-slate-800/50' : 'bg-gray-100')}>
                      <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={autoBid} onChange={e => setAutoBid(e.target.checked)} className="w-3.5 h-3.5 accent-amber-500" /><span className="text-xs text-slate-300">🤖 Auto</span></label>
                      {autoBid && <><span className="text-xs text-slate-400">Max:</span><input type="number" value={autoMax} onChange={e => setAutoMax(Number(e.target.value))} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-white text-center" step="0.5" min="0" /><span className="text-xs text-slate-400">Cr</span></>}
                    </div>
                    <div className="text-center text-xs text-slate-500">Press <kbd className="px-1 py-0.5 bg-slate-700 rounded font-mono text-xs">B</kbd> to bid</div>
                  </div>
                )}
                {sqFull && <div className="text-center p-2 bg-red-500/10 rounded-xl text-red-400 text-sm font-semibold">Squad full!</div>}
                {!canOS && !sqFull && <div className="text-center p-2 bg-red-500/10 rounded-xl text-red-400 text-sm font-semibold">Overseas limit!</div>}
              </div>
            )}

            <div className={'rounded-2xl p-3 flex-1 min-h-0 ' + (darkMode ? 'glass-effect' : 'bg-white shadow')}>
              <h3 className="font-bold text-xs text-slate-300 mb-2">📢 Activity</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {logs.slice(0, 40).map(e => (
                  <div key={e.id} className={'text-xs py-1 px-2 rounded-lg ' + (e.type === 'sold' ? 'bg-green-500/10 text-green-400' : e.type === 'unsold' ? 'bg-red-500/10 text-red-400' : e.type === 'bid' ? 'text-slate-300' : e.type === 'system' ? 'bg-purple-500/10 text-purple-300' : 'text-slate-400')}>{e.message}</div>
                ))}
              </div>
            </div>

            <div className={'rounded-2xl p-3 ' + (darkMode ? 'glass-effect' : 'bg-white shadow')}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {teams.sort((a, b) => b.budget - a.budget).map(team => (
                  <div key={team.id} className={'flex items-center gap-1.5 p-1.5 rounded-lg ' + (!team.isAI ? 'bg-amber-500/10 border border-amber-500/20' : '')}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: team.color, color: team.textColor }}>{team.shortName.substring(0, 2)}</div>
                    <div className="min-w-0 flex-1"><div className="text-xs font-bold truncate" style={{ color: team.color }}>{team.shortName}{!team.isAI ? ' 👤' : ''}</div><div className="text-xs text-slate-400">{formatPrice(team.budget)} | {team.players.length}P</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Squad Modal */}
        {showSq && myTeam && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSq(false)}>
            <div className="bg-[#1a2332] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <span className="font-bold">{myTeam.shortName} Squad ({myTeam.players.length})</span>
                <button onClick={() => setShowSq(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="px-4 pt-2 flex gap-1.5 flex-wrap">
                {['all', 'Batter', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(f => (
                  <button key={f} onClick={() => setSqFilter(f)} className={'px-2.5 py-1 rounded-full text-xs font-semibold ' + (sqFilter === f ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400')}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
              <div className="p-4 overflow-y-auto max-h-56">
                {myTeam.players.filter(p => sqFilter === 'all' || p.role === sqFilter).length === 0 ? <div className="text-center py-4 text-slate-500 text-sm">No players</div> : (
                  <div className="space-y-1.5">{myTeam.players.filter(p => sqFilter === 'all' || p.role === sqFilter).map(p => {
                    const sp = soldPlayers.find(s => s.player.id === p.id && s.teamId === myTeam.id);
                    return <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                      <div className="flex items-center gap-2"><span>{getRoleEmoji(p.role)}</span><div><div className="font-semibold text-xs">{p.name}</div><div className="text-xs text-slate-400">{p.role} | {p.country}</div></div></div>
                      <div className="text-right"><div className="text-xs font-bold text-gradient-gold">{sp ? formatPrice(sp.amount) : '-'}</div><div className="text-xs text-slate-400">⭐{p.rating}</div></div>
                    </div>;
                  })}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard Modal */}
        {showBoard && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowBoard(false)}>
            <div className="bg-[#1a2332] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between"><span className="font-bold">📊 Scoreboard</span><button onClick={() => setShowBoard(false)} className="text-slate-400 hover:text-white text-xl">✕</button></div>
              <div className="p-4 overflow-y-auto max-h-96 space-y-2">
                {teams.sort((a, b) => b.players.reduce((s, p) => s + p.rating, 0) - a.players.reduce((s, p) => s + p.rating, 0)).map((team, i) => {
                  const tot = team.players.reduce((s, p) => s + p.rating, 0);
                  return <div key={team.id} className={'p-3 rounded-xl ' + (!team.isAI ? 'border border-amber-500/30 bg-amber-500/5' : 'bg-slate-800/50')}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-400">#{i + 1}</span><div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: team.color, color: team.textColor }}>{team.shortName.substring(0, 2)}</div><div><div className="font-bold text-sm">{team.shortName}{!team.isAI ? ' 👤' : ''}</div><div className="text-xs text-slate-400">{team.players.length}P | {formatPrice(team.initialBudget - team.budget)} spent</div></div></div>
                      <div className="font-bold text-gradient-gold">⭐ {tot}</div>
                    </div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  const renderResults = () => {
    const totSpent = soldPlayers.reduce((s, p) => s + p.amount, 0);
    return (
      <div className={darkMode ? 'gradient-hero min-h-screen' : 'bg-gray-100 min-h-screen'}>
        <div className="text-white p-4 max-w-4xl mx-auto">
          <div className="text-center mb-6 animate-slide-up">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-black text-gradient-gold mb-1">Auction Complete!</h2>
            <p className="text-sm text-slate-400">{soldPlayers.length} sold | {unsoldPlayers.length} unsold | {formatPrice(totSpent)} total</p>
          </div>

          {awards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {awards.map((a, i) => (
                <div key={i} className={darkMode ? 'glass-effect rounded-xl p-3 flex items-center gap-3' : 'bg-white shadow-lg rounded-xl p-3 flex items-center gap-3'}>
                  <div className="text-2xl">{a.emoji}</div>
                  <div><div className="font-bold text-xs">{a.title}</div><div className="text-xs text-amber-400">{a.winner}</div><div className="text-xs text-slate-400">{a.detail}</div></div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {rankings.map((team, i) => {
              const tot = team.players.reduce((s, p) => s + p.rating, 0);
              const spent = team.initialBudget - team.budget;
              return (
                <div key={team.id} className={darkMode ? 'glass-effect rounded-xl p-4' : 'bg-white shadow rounded-xl p-4'}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={i === 0 ? 'text-xl font-black text-amber-400' : 'text-xl font-black text-slate-500'}>#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: team.color, color: team.textColor }}>{team.shortName.substring(0, 2)}</div>
                    <div className="flex-1">
                      <div className="font-bold">{team.shortName} {!team.isAI && '👤'}</div>
                      <div className="text-xs text-slate-400">{team.players.length}P | {formatPrice(spent)} spent | {formatPrice(team.budget)} left</div>
                    </div>
                    <div className="text-right"><div className="text-xl font-black text-gradient-gold">{tot}</div><div className="text-xs text-slate-400">Rating</div></div>
                  </div>
                  <div className={darkMode ? 'h-1.5 rounded-full bg-slate-700' : 'h-1.5 rounded-full bg-gray-200'}>
                    <div className="h-full rounded-full" style={{ width: Math.min((tot / 2000) * 100, 100) + '%', background: team.color }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {team.players.map((p, j) => (
                      <span key={j} className="bg-slate-800/50 text-xs px-1.5 py-0.5 rounded-full text-slate-300">{getRoleEmoji(p.role)} {p.name}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pb-8 space-y-2">
            <button onClick={() => { cleanup(); setScreen('landing'); setTeams([]); setSoldPlayers([]); setUnsoldPlayers([]); setLogs([]); }}
              className="gradient-gold text-black font-bold px-8 py-3 rounded-xl bid-button">🔄 Play Again</button>
            <br />
            <button onClick={() => setScreen('auction')} className="text-slate-400 hover:text-white text-sm">← Back to Auction</button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // MAIN
  // ═══════════════════════════════════════════
  return (
    <div>
      {notif && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-up"><div className="bg-amber-500 text-black px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg">{notif}</div></div>}
      {screen === 'landing' && renderLanding()}
      {screen === 'lobby' && renderLobby()}
      {screen === 'auction' && renderAuction()}
      {screen === 'results' && renderResults()}
    </div>
  );
}
