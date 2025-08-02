import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Room from "@/components/room";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <BackgroundRippleEffect
        interactive={false}
        cellSize={52}
        className="opacity-60 [--cell-border-color:rgba(0,0,0,0.15)] [--cell-fill-color:rgba(255,255,255,0.96)] [--cell-shadow-color:rgba(0,0,0,0.06)]"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              SyncScribe
            </h1>
            <p className="text-gray-500">
              Create or join a room to start writing together.
            </p>
          </div>

          <div className="mx-auto max-w-md">
            <Room />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Maximum 4 users per room • Real-time collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

