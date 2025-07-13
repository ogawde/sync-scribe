"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Copy, Check } from "lucide-react";

interface ShareRoomProps {
  roomId: string;
  userCount: number;
}

export function ShareRoom({ roomId, userCount }: ShareRoomProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Room Code</p>
          <p className="text-2xl font-bold tracking-wider">{roomId}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

