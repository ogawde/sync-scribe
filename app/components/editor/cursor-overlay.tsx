"use client";

import { useEditorStore } from "@/app/lib/store";

export function CursorOverlay() {
  const { users, currentUser } = useEditorStore();

  const otherUsers = users.filter(
    (user) => user.id !== currentUser?.id && user.cursorPosition
  );

  return (
    <>
      {otherUsers.map((user) => (
  <div
    key={user.id}
    className="fixed pointer-events-none z-50 transition-all duration-100"
    style={{
      left: `${user.cursorPosition?.x ?? 0}px`,
      top: `${user.cursorPosition?.y ?? 0}px`,
    }}
  >
    <div
      className="w-px h-6"
      style={{ backgroundColor: user.color }}
    />
    <div
      className="ml-2 -mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
      style={{ backgroundColor: user.color }}
    >
      {user.username}
    </div>
  </div>
))}
    </>
  );
}

