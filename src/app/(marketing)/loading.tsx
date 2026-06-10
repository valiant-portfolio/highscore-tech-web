// Subtle, dependency-free loading state for the marketing area. Cyan
// progress sliver under a neutral panel — never blocks the chrome.

export default function MarketingLoading() {
  return (
    <section className="relative isolate min-h-[60vh] px-4 md:px-8 py-24 md:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, #18C2DC 10%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="mx-auto max-w-[640px]">
        <div className="h-3 rounded-full overflow-hidden bg-surface-hover relative">
          <div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full animate-[loading-sweep_1.4s_ease-in-out_infinite]"
            style={{
              background: 'linear-gradient(90deg, #18C2DC 0%, #6CE8FA 50%, #18C2DC 100%)',
            }}
          />
        </div>
        <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">
          Loading
        </p>
      </div>
      <style>{`
        @keyframes loading-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </section>
  );
}
