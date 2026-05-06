"use client";

export function AnimatedGradientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base cream fill */}
      <div className="absolute inset-0 bg-cream" />

      {/* Animated mesh blobs — haute opacité, plein écran */}
      <div className="absolute inset-0 opacity-[0.85]">
        {/* Bordeaux — centre-gauche, très large */}
        <div className="animate-mesh-1 absolute -left-[10%] -top-[10%] h-[90%] w-[90%] rounded-full bg-[radial-gradient(circle,_rgba(122,31,61,0.45)_0%,_transparent_65%)] blur-3xl" />

        {/* Or vif — centre-droit */}
        <div className="animate-mesh-2 absolute -right-[5%] top-[10%] h-[85%] w-[85%] rounded-full bg-[radial-gradient(circle,_rgba(201,168,76,0.4)_0%,_transparent_65%)] blur-3xl" />

        {/* Bordeaux profond — bas-centre */}
        <div className="animate-mesh-3 absolute -bottom-[10%] left-[5%] h-[85%] w-[85%] rounded-full bg-[radial-gradient(circle,_rgba(92,26,42,0.4)_0%,_transparent_65%)] blur-3xl" />

        {/* Or chaud — haut-droit */}
        <div className="animate-mesh-4 absolute -top-[5%] right-[5%] h-[80%] w-[80%] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.35)_0%,_transparent_65%)] blur-3xl" />

        {/* Cream lumineux — centre */}
        <div className="animate-mesh-5 absolute left-[15%] top-[25%] h-[80%] w-[80%] rounded-full bg-[radial-gradient(circle,_rgba(255,248,240,0.5)_0%,_transparent_65%)] blur-3xl" />

        {/* Bordeaux rosé — droit-bas (nouveau) */}
        <div className="animate-mesh-6 absolute bottom-[5%] right-[10%] h-[75%] w-[75%] rounded-full bg-[radial-gradient(circle,_rgba(140,47,79,0.3)_0%,_transparent_65%)] blur-3xl" />
      </div>
    </div>
  );
}
