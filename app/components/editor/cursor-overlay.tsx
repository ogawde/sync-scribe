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
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.65376 12.3673L0 0L11.5468 7.05429L7.23737 8.28426L5.65376 12.3673Z"
              fill={cursor.color}
            />
          </svg>
          <div
            className="ml-5 -mt-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </div>
        </div>
      ))}
    </>
  );
}

