import { WebSocketMessage } from "@/app/types";

const WS_URL = "ws://localhost:8080";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (payload: any) => void> = new Map();
  private isIntentionallyClosed = false;

  connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve(this.ws);
          return;
        }
        this.isIntentionallyClosed = false;
        this.ws = new WebSocket(WS_URL);
        
        let resolved = false;

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolved = true;
          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler(message.payload);
            }
          } catch (error) {
            console.error(error);
          }
        };

        this.ws.onerror = (error) => {
          if (!this.isIntentionallyClosed) {
            console.error(error);
            if (!resolved) {
              reject(error);
            }
          }
        };

        this.ws.onclose = () => {
          this.ws = null;
          if (!this.isIntentionallyClosed && !resolved) {
            reject(new Error("WebSocket closed"));
          } else if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  on(type: string, handler: (payload: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  off(type: string) {
    this.messageHandlers.delete(type);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.messageHandlers.clear();
    if (this.ws) {
      try {
        
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.ws = null;
      }
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

