/** Vuexy-inspired decorative background — soft gray + floating shapes */
export function AuthDecorBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#f8f7fa] dark:bg-slate-950"
      aria-hidden
    >
      <div className="absolute -left-16 top-24 h-56 w-56 rounded-[2rem] bg-[#845adf]/12 blur-3xl dark:bg-[#845adf]/20" />
      <div className="absolute right-[-5%] top-32 h-72 w-72 rounded-[2.5rem] border-2 border-dashed border-sky-400/25 bg-white/50 dark:border-sky-500/20 dark:bg-slate-900/40" />
      <div className="absolute bottom-20 left-[10%] h-40 w-64 rounded-3xl bg-indigo-400/10 blur-2xl dark:bg-indigo-500/15" />
      <div className="absolute bottom-[-10%] right-10 h-48 w-48 rotate-12 rounded-3xl border border-[#845adf]/15 bg-[#845adf]/5 dark:border-[#845adf]/25" />
      <div className="absolute right-1/4 top-1/3 h-24 w-36 rounded-2xl bg-cyan-400/10 blur-xl" />
    </div>
  )
}
