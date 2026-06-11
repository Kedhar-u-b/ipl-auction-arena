import Peer, { DataConnection } from "peerjs";
import type { NetworkMessage } from "./types";

const PEER_CONFIG = {
  debug: 2,
};

export class AuctionNetwork {
  peer: Peer | null = null;
  connections = new Map<string, DataConnection>();
  isHost = false;

  onMessage: ((fromPeerId: string, msg: NetworkMessage) => void) | null = null;
  onConnect: ((peerId: string) => void) | null = null;
  onDisconnect: ((peerId: string) => void) | null = null;
  onError: ((error: any) => void) | null = null;

  async createRoom(): Promise<string> {
    this.isHost = true;

    const roomCode = this.generateCode();

    return new Promise((resolve, reject) => {
      this.peer = new Peer(roomCode, PEER_CONFIG);

      const timeout = setTimeout(() => {
        reject(new Error("Peer creation timeout"));
      }, 15000);

      this.peer.on("open", (id) => {
        clearTimeout(timeout);

        console.log("HOST OPEN:", id);

        this.peer?.on("connection", (conn) => {
          console.log("INCOMING CONNECTION:", conn.peer);
          this.setupConnection(conn);
        });

        resolve(id);
      });

      this.peer.on("error", (err) => {
        clearTimeout(timeout);
        console.error("HOST ERROR:", err);
        this.onError?.(err);
        reject(err);
      });
    });
  }

  async joinRoom(roomCode: string): Promise<void> {
    this.isHost = false;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(undefined, PEER_CONFIG);

      this.peer.on("open", () => {
        console.log("CLIENT OPEN:", this.peer?.id);

        const conn = this.peer!.connect(
          roomCode.trim().toUpperCase(),
          {
            reliable: true,
          }
        );

        const timeout = setTimeout(() => {
          conn.close();
          reject(new Error("Room not found"));
        }, 10000);

        conn.on("open", () => {
          clearTimeout(timeout);

          console.log("CONNECTED TO HOST");

          this.setupConnection(conn);

          resolve();
        });

        conn.on("error", (err) => {
          clearTimeout(timeout);
          console.error("JOIN ERROR:", err);
          reject(err);
        });
      });

      this.peer.on("error", (err) => {
        console.error("CLIENT PEER ERROR:", err);
        reject(err);
      });
    });
  }

  private setupConnection(conn: DataConnection) {
    conn.on("open", () => {
      console.log("PEER CONNECTED:", conn.peer);

      this.connections.set(conn.peer, conn);

      this.onConnect?.(conn.peer);
    });

    conn.on("data", (data) => {
      console.log("MESSAGE:", data);

      this.onMessage?.(
        conn.peer,
        data as NetworkMessage
      );
    });

    conn.on("close", () => {
      console.log("PEER DISCONNECTED:", conn.peer);

      this.connections.delete(conn.peer);

      this.onDisconnect?.(conn.peer);
    });

    conn.on("error", (err) => {
      console.error("CONNECTION ERROR:", err);

      this.connections.delete(conn.peer);
    });
  }

  broadcast(msg: NetworkMessage) {
    if (!this.isHost) return;

    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(structuredClone(msg));
      }
    });
  }

  sendToHost(msg: NetworkMessage) {
    if (this.isHost) return;

    const host = this.connections.values().next().value;

    if (host?.open) {
      host.send(msg);
    }
  }

  sendTo(peerId: string, msg: NetworkMessage) {
    const conn = this.connections.get(peerId);

    if (conn?.open) {
      conn.send(msg);
    }
  }

  destroy() {
    this.connections.forEach((conn) => conn.close());

    this.connections.clear();

    this.peer?.destroy();

    this.peer = null;
  }

  get connectedCount() {
    return this.connections.size;
  }

  private generateCode() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars[
        Math.floor(Math.random() * chars.length)
      ];
    }

    return code;
  }
}
