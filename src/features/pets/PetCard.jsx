import { Icon } from "../../components/common/Icon";
import { classNames } from "../../utils/classNames";

export function PetCard({ pet, image, isFavorite, onFavorite, onSelect, role }) {
  return (
    <article className="card-premium group overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <button onClick={onSelect} className="h-full w-full overflow-hidden text-left">
          <img
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            src={image}
            alt={pet.name}
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>

        {/* Favorite Button - Absolute Positioned on Image */}
        {role === "adopter" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            className={classNames(
              "absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 backdrop-blur-sm transition-premium active:scale-95 shadow-lg",
              isFavorite
                ? "border-red-100 text-red-500"
                : "border-slate-100 text-slate-400 hover:text-red-400"
            )}
          >
            <Icon name={isFavorite ? "heart-filled" : "heart"} />
          </button>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-black tracking-tight text-slate-950">{pet.name}</h3>
            <p className="mt-1 truncate text-xs font-bold text-slate-500 uppercase tracking-wider">
              {pet.breed} · {typeof pet.age === "object" ? `${pet.age.value} ${pet.age.unit}` : `${pet.age} years`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={classNames(
            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
            pet.type === "adoption" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
          )}>
            {pet.type || "adoption"}
          </span>
          <span className={classNames(
            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
            pet.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
          )}>
            {pet.status}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
            {pet.location || "Anywhere"}
          </span>
        </div>

        <button
          onClick={onSelect}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition-premium hover:border-[#176f5b] hover:bg-[#176f5b] hover:text-white hover:shadow-lg hover:shadow-[#176f5b]/20 active:scale-[0.98]"
        >
          View profile
        </button>
      </div>
    </article>
  );
}
