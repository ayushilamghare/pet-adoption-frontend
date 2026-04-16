import { Icon } from "./Icon";

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-premium">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-premium hover:border-slate-300 hover:text-slate-900 active:scale-90"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </section>
    </div>
  );
}
