import { classNames } from "../../utils/classNames";

export function Field({ label, value, onChange, type = "text", placeholder = "", error }) {
  return (
    <label className="block">
      <span className={classNames(
        "mb-2.5 block text-sm font-bold transition-premium",
        error ? "text-red-500" : "text-slate-700"
      )}>
        {label}
      </span>
      <input
        className={classNames(
          "h-12 w-full rounded-xl border px-4 text-slate-900 transition-premium placeholder:text-slate-400 outline-none",
          error
            ? "border-red-200 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-400/5"
            : "border-slate-200 bg-white focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
        )}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>}
    </label>
  );
}
