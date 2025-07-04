import { create } from "zustand";
import { User, CursorPosition } from "@/app/types";

interface EditorStore {
  users: User[];
  currentUser: User | null;
  roomId: string | null;
  isConnected: boolean;
  document: any;
  ws: WebSocket | null;
  
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
  setRoomId: (roomId: string | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setDocument: (document: any) => void;
  setWs: (ws: WebSocket | null) => void;
  updateUserCursor: (userId: string, cursorPosition: CursorPosition) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  users: [],
  currentUser: null,
  roomId: null,
  isConnected: false,
  document: null,
  ws: null,

  setUsers: (users) => set({ users }),

  setCurrentUser: (currentUser) => set({ currentUser }),
  
  setRoomId: (roomId) => set({ roomId }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  setDocument: (document) => set({ document }),
  
  setWs: (ws) => set({ ws }),
  
  updateUserCursor: (userId, cursorPosition) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, cursorPosition } : user
      ),
    })),
}));

