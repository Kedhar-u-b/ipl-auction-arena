import Peer, { DataConnection } from 'peerjs';
import type { NetworkMessage } from './types';

const PEER_CONFIG = { debug: 0 };

export class AuctionNetwork {
  peer: Peer | null = null;
  connections: Map<string, DataConnection> = new Map();
  isHost = false;

  onMessage: ((fromPeerId: string, msg: NetworkMessage) => void) | null = null;
  onConnect: ((peerId: string) => void) | null = null;
  onDisconnect: ((peerId: string) => void) | null = null;
  onError: ((error: any) => void) | null = null;

  private createPeerWithId(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(id, PEER_CONFIG);
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 15000);
      this.peer.on('open', (assignedId) => { clearTimeout(timeout); resolve(assignedId); });
      this.peer.on('error', (err: any) => {
        clearTimeout(timeout);
        if (err.type === 'unavailable-id') {
          this.createPeerWithId(this.generateCode()).then(resolve).catch(reject);
        } else { reject(err); }
      });
    });
  }

  private createPeerRandom(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(PEER_CONFIG);
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 15000);
      this.peer.on('open', (assignedId) => { clearTimeout(timeout); resolve(assignedId); });
      this.peer.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
  }

  async createRoom(): Promise<string> {
    this.isHost = true;
    const code = await this.createPeerWithId(this.generateCode());
    this.peer!.on('connection', (conn) => { this.setupConnection(conn); });
    return code;
  }

  async joinRoom(code: string): Promise<void> {
    this.isHost = false;
    await this.createPeerRandom();
    return new Promise((resolve, reject) => {
      const conn = this.peer!.connect(code.toUpperCase().trim(), { reliable: true });
      const timeout = setTimeout(() => { reject(new Error('Room not found.')); conn.close(); }, 10000);
      conn.on('open', () => { clearTimeout(timeout); this.setupConnection(conn); resolve(); });
      conn.on('error', (err) => { clearTimeout(timeout); reject(err); });
    });
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => { this.connections.set(conn.peer, conn); this.onConnect?.(conn.peer); });
    conn.on('data', (data) => { this.onMessage?.(conn.peer, data as NetworkMessage); });
    conn.on('close', () => { this.connections.delete(conn.peer); this.onDisconnect?.(conn.peer); });
    conn.on('error', () => { this.connections.delete(conn.peer); });
  }

  broadcast(msg: NetworkMessage) {
    if (!this.isHost) return;
    const data = JSON.parse(JSON.stringify(msg));
    this.connections.forEach((conn) => { try { if (conn.open) conn.send(data); } catch {} });
  }

  sendToHost(msg: NetworkMessage) {
    if (this.isHost) return;
    const hostConn = this.connections.values().next().value;
    try { if (hostConn?.open) hostConn.send(msg); } catch {}
  }

  sendTo(peerId: string, msg: NetworkMessage) {
    const conn = this.connections.get(peerId);
    try { if (conn?.open) conn.send(msg); } catch {}
  }

  destroy() {
    this.connections.forEach((conn) => { try { conn.close(); } catch {} });
    this.connections.clear();
    try { this.peer?.destroy(); } catch {}
    this.peer = null;
  }

  get connectedCount(): number { return this.connections.size; }

  private generateCode(): string {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += c[Math.floor(Math.random() * c.length)];
    return code;
  }
}
