"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { WebSocketClient } from "@/app/lib/websocket-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
export default function Room() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [showUsernameStep, setShowUsernameStep] = useState(false);
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
    } catch {
      setError("Failed to connect to server. Please try again.");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
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
    setShowUsernameStep(true);
    setError("");
  };

  const initiateJoin = () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setAction("join");
    setShowUsernameStep(true);
    setError("");
  };

  const handleSubmitUsername = () => {
    if (action === "create") {
      handleCreateRoom();
      return;
    }

    if (action === "join") {
      handleJoinRoom();
    }
  };

  const resetToRoomOptions = () => {
    setShowUsernameStep(false);
    setAction(null);
    setUsername("");
    setError("");
    setIsCreating(false);
    setIsJoining(false);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      className="will-change-transform"
    >
<Card className="overflow-hidden border border-gray-300 bg-white/98 shadow-[0_22px_55px_rgba(15,23,42,0.16)] backdrop-blur-md transition-[colors,box-shadow] duration-300 hover:border-gray-400">
        <CardContent className="p-5 sm:p-6">
          <div className="relative min-h-[300px]">
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                showUsernameStep
                  ? "pointer-events-none translate-y-4 opacity-0"
                  : "translate-y-0 opacity-100",
              )}
            >
              <div className="w-full max-w-sm space-y-4 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Enter Room Code
                </p>
                <Input
                  placeholder="* * * * * *"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && initiateJoin()}
                  maxLength={6}
                  className="h-11 text-center uppercase tracking-[0.3em]"
                />

                <Button
                  onClick={initiateJoin}
                  className="h-11 w-full"
                  size="lg"
                  disabled={isJoining}
                >
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>

                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-400">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                <Button
                  onClick={initiateCreate}
                  variant="outline"
                  className="h-11 w-full"
                  size="lg"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            </div>
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                showUsernameStep
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <div className="w-full max-w-sm space-y-4 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  {action === "join" ? "Join Room" : "Create Room"}
                </p>
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitUsername()}
                  autoFocus={showUsernameStep}
                  className="h-11 text-center"
                />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <div className="flex gap-2.5">
                  <Button
                    onClick={resetToRoomOptions}
                    variant="outline"
                    className="h-11 flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitUsername}
                    className="h-11 flex-1"
                    disabled={isCreating || isJoining}
                  >
                    {isCreating || isJoining ? "Please wait..." : "Continue"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
