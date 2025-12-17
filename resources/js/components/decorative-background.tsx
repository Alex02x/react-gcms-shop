export function DecorativeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Top right gradient orb */}
      <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />

      {/* Bottom left gradient orb */}
      <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />

    </div>
  )
}
