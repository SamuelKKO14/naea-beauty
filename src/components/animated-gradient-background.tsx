"use client";

export function AnimatedGradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base cream fill */}
      <div className="absolute inset-0 bg-cream" />

      {/* Animated mesh blobs */}
      <div className="absolute inset-0 opacity-60">
        {/* Bordeaux blob top-left */}
        <div className="animate-mesh-1 absolute -left-[20%] -top-[20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,_rgba(122,31,61,0.35)_0%,_transparent_70%)] blur-3xl" />

        {/* Gold blob center-right */}
        <div className="animate-mesh-2 absolute -right-[10%] top-[20%] h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,_rgba(201,168,76,0.3)_0%,_transparent_70%)] blur-3xl" />

        {/* Deep bordeaux blob bottom */}
        <div className="animate-mesh-3 absolute -bottom-[15%] left-[10%] h-[65%] w-[65%] rounded-full bg-[radial-gradient(circle,_rgba(92,26,42,0.3)_0%,_transparent_70%)] blur-3xl" />

        {/* Warm gold blob top-right */}
        <div className="animate-mesh-4 absolute -top-[10%] right-[20%] h-[50%] w-[50%] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.2)_0%,_transparent_70%)] blur-3xl" />

        {/* Cream accent blob center */}
        <div className="animate-mesh-5 absolute left-[30%] top-[40%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,_rgba(255,248,240,0.4)_0%,_transparent_70%)] blur-3xl" />
      </div>
    </div>
  );
}
