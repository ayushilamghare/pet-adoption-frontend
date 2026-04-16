export function TextArea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-bold text-slate-700 uppercase tracking-wider text-[10px]">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium leading-relaxed text-slate-900 transition-premium placeholder:text-slate-400 outline-none focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
