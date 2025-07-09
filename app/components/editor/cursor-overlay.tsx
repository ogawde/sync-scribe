"use client";

import { useEditorStore } from "@/app/lib/store";
import { useEffect, useState } from "react";

export function CursorOverlay() {
  const { users, currentUser } = useEditorStore();
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; username: string; color: string }>>(new Map());

  useEffect(() => {
    const newCursors = new Map();
    users.forEach((user) => {
      if (user.id !== currentUser?.id && user.cursorPosition) {
        newCursors.set(user.id, {
          x: user.cursorPosition.x,
          y: user.cursorPosition.y,
          username: user.username,
          color: user.color,
        });
      }
    });
    setCursors(newCursors);
  }, [users, currentUser]);

  return (
    <>
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        >
          <div
            className="w-px h-6"
            style={{ backgroundColor: cursor.color }}
          />
          <div
            className="ml-2 -mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </>
  );
}

