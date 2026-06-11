export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
export type Nationality = 'Indian' | 'Overseas';
export type GameScreen = 'landing' | 'setup' | 'lobby' | 'auction' | 'results';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Speed = 'fast' | 'normal' | 'slow';
export type GameMode = 'solo' | 'host' | 'client';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface PlayerStats {
  matches: number;
  runs?: number;
  wickets?: number;
  average?: number;
  strikeRate?: number;
  economy?: number;
}

export interface Player {
  id: number;
  name: string;
  role: PlayerRole;
  nationality: Nationality;
  country: string;
  basePrice: number;
  rating: number;
  stats: PlayerStats;
  speciality: string;
  isMarquee: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  emoji: string;
  budget: number;
  initialBudget: number;
  players: Player[];
  isAI: boolean;
  personality: 'aggressive' | 'balanced' | 'conservative';
  ownerName?: string;
  ownerPeerId?: string;
}

export interface SoldPlayer {
  player: Player;
  teamId: string;
  amount: number;
}

export interface LogEntry {
  id: number;
  message: string;
  type: 'bid' | 'sold' | 'unsold' | 'info' | 'system';
  teamId?: string;
  timestamp: number;
}

export interface Award {
  title: string;
  emoji: string;
  description: string;
  winner: string;
  detail: string;
}

export interface LobbyPlayer {
  peerId: string;
  name: string;
  teamId: string;
  isHost: boolean;
  isReady: boolean;
}

export interface GameStateBroadcast {
  teams: Team[];
  currentPlayer: Player | null;
  currentBid: { teamId: string; amount: number } | null;
  timer: number;
  phase: 'idle' | 'active' | 'resolving';
  resolveResult: 'sold' | 'unsold';
  soldPlayers: SoldPlayer[];
  unsoldPlayers: Player[];
  activityLog: LogEntry[];
  queueIndex: number;
  playerQueueLength: number;
  auctionComplete: boolean;
  winningTeamId: string;
}

export interface NetworkMessage {
  type: 'join' | 'select_team' | 'ready' | 'start_game' | 'game_state' | 'lobby_state' | 'bid' | 'chat' | 'error' | 'host_left' | 'player_left';
  data: any;
}
