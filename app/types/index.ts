export interface User {
    id: string;
    username: string;
    color: string;
    cursorPosition?: CursorPosition;
  }
  
  export interface CursorPosition {
    x: number;
    y: number;
    from: number;
    to: number;
  }
  
  export interface Room {
    id: string;
    users: User[];
    document: any;
    maxUsers: number;
  }
  
  export type MessageType =
    | "join"
    | "leave"
    | "document-update"
    | "room-created"
    | "room-joined"
    | "error";
  
  export interface WebSocketMessage {
    type: MessageType;
    payload: any;
    userId?: string;
    roomId?: string;
  }
  
  