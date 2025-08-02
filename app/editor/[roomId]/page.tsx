"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { TextEditor } from "@/components/editor/text-editor";
import { UserPresence } from "@/components/editor/user-presence";
import { CursorOverlay } from "@/components/editor/cursor-overlay";
import { ShareRoom } from "@/components/editor/share-room";
import { useEditorStore } from "@/app/lib/store";
import { WebSocketClient } from "@/app/lib/websocket-client";

export default function EditorPage() {
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomId;
  const username = searchParams.get("username");

  const {
    setUsers,
    setCurrentUser,
    setRoomId,
    setIsConnected,
    setDocument,
    updateUserCursor,
    setWs,
  } = useEditorStore();

  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [nameInput, setNameInput] = useState(username ?? "");
  const [nameError, setNameError] = useState("");
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    if (clientRef.current) {
      return;
    }

    const client = new WebSocketClient();
    clientRef.current = client;
    setWsClient(client);

    const initializeConnection = async () => {
      try {
        client.on("room-joined", (payload) => {
          const { user, document: doc } = payload;
          setCurrentUser(user);
          setRoomId(roomId);
          setDocument(doc);
          setIsConnecting(false);
        });

        client.on("user-presence", (payload) => {
          const { users } = payload;
          setUsers(users);
        });

        client.on("document-update", (payload) => {
          const { document: doc } = payload;
          setDocument(doc);
        });

        client.on("cursor-move", (payload) => {
          const { userId, cursorPosition } = payload;
          updateUserCursor(userId, cursorPosition);
        });

        client.on("error", (payload) => {
          const { message } = payload;
          setError(message);
          setIsConnecting(false);
          setTimeout(() => router.push("/"), 3000);
        });

        const ws = await client.connect();
        setWs(ws);
        setIsConnected(true);

        client.send({
          type: "join",
          payload: { roomId, username },
        });
      } catch {
        setError("Failed to connect to server");
        setIsConnecting(false);
        setTimeout(() => router.push("/"), 3000);
      }
    };

    initializeConnection();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [
    roomId,
    username,
    router,
    setUsers,
    setCurrentUser,
    setRoomId,
    setIsConnected,
    setDocument,
    updateUserCursor,
    setWs,
  ]);

  const handleDocumentUpdate = (content: any) => {
    if (wsClient) {
      wsClient.send({
        type: "document-update",
        payload: { document: content },
      });
    }
  };

  const handleCursorMove = (position: {
    x: number;
    y: number;
    from: number;
    to: number;
  }) => {
    if (wsClient) {
      wsClient.send({
        type: "cursor-move",
        payload: { cursorPosition: position },
      });
    }
  };

  const handleNameSubmit = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError("Please enter a name");
      return;
    }

    setNameError("");
    router.replace(`/editor/${roomId}?username=${encodeURIComponent(trimmed)}`);
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
          <h1 className="mb-2 text-center text-2xl font-semibold">
            Join room {roomId}
          </h1>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Enter your name to join this SyncScribe room.
          </p>
          <div className="space-y-3">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameSubmit();
                }
              }}
              autoFocus
            />
            {nameError ? (
              <p className="text-xs text-red-600">{nameError}</p>
            ) : null}
            <button
              type="button"
              onClick={handleNameSubmit}
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Join room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ShareRoom
        roomId={roomId}
        userCount={useEditorStore.getState().users.length}
      />
      <UserPresence />
      <div className="flex-1 overflow-hidden">
        <TextEditor
          onUpdate={handleDocumentUpdate}
          onCursorMove={handleCursorMove}
        />
      </div>
      <CursorOverlay />
    </div>
  );
}