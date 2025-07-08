"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { WebSocketClient } from "@/app/lib/websocket-client";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [action, setAction] = useState<"create" | "join" | null>(null);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const wsClient = new WebSocketClient();
      
      wsClient.on("room-created", (payload) => {
        const { roomId } = payload;
        wsClient.disconnect();
        router.push(`/editor/${roomId}?username=${encodeURIComponent(username)}`);
      });

      wsClient.on("error", (payload) => {
        setError(payload.message || "Failed to create room");
        setIsCreating(false);
        wsClient.disconnect();
      });

      await wsClient.connect();

      wsClient.send({
        type: "create-room",
        payload: {},
      });
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect to server. Please try again.");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setIsJoining(true);
    setError("");
    router.push(`/editor/${roomCode.toUpperCase()}?username=${encodeURIComponent(username)}`);
  };

  const initiateCreate = () => {
    setAction("create");
    setShowUsernameModal(true);
    setError("");
  };

  const initiateJoin = () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    setAction("join");
    setShowUsernameModal(true);
    setError("");
  };

  const handleSubmitUsername = () => {
    if (action === "create") {
      handleCreateRoom();
    } else if (action === "join") {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Collaborative Doc Editor
          </h1>
          <p className="text-gray-600">
            Create or join a room to start editing documents together
          </p>
        </div>

        {!showUsernameModal ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Room</CardTitle>
                <CardDescription>
                  Start a new collaborative session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={initiateCreate}
                  className="w-full"
                  size="lg"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create New Room"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>
                  Enter a room code to join an existing session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room code (e.g., ABC123)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && initiateJoin()}
                  maxLength={6}
                />
                <Button
                  onClick={initiateJoin}
                  className="w-full"
                  size="lg"
                  disabled={isJoining}
                >
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Enter Your Name</CardTitle>
              <CardDescription>
                Choose a username for the collaborative session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitUsername()}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowUsernameModal(false);
                    setAction(null);
                    setUsername("");
                    setError("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitUsername}
                  className="flex-1"
                  disabled={isCreating || isJoining}
                >
                  {isCreating || isJoining ? "Please wait..." : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && !showUsernameModal && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Maximum 4 users per room • Real-time collaboration</p>
        </div>
      </div>
    </div>
  );
}

