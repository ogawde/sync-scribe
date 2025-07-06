"use client";

import { User } from "@/app/types";
import { useEditorStore } from "@/app/lib/store";

export function UserPresence() {
  const { users, currentUser } = useEditorStore();

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-2 p-4 border-b bg-background">
      <div className="text-sm font-medium text-muted-foreground mr-2">
        {users.length}/{4} Users
      </div>
      <div className="flex gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full border"
            style={{
              backgroundColor: `${user.color}20`,
              borderColor: user.color,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: user.color }}
            >
              {getInitials(user.username)}
            </div>
            <span className="text-sm font-medium">
              {user.username}
              {currentUser?.id === user.id && " (You)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

