import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-2">Collaborative Doc Editor</h1>
        <p>Create or join a room to start editing documents together</p>

        <div className="mt-8 flex gap-4 justify-center">
          <Input
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <Button>Create Room</Button>
          <Button>Join Room</Button>
        </div>
      </div>
    </div>
  );
}
