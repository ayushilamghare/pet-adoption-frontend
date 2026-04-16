import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navItems } from "../../constants/navigation";
import { Icon } from "../common/Icon";
import { classNames } from "../../utils/classNames";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import { selectActiveView, setActiveView } from "../../features/ui/uiSlice";
import { setFavorites } from "../../features/favorites/favoritesSlice";
import { apiRequest } from "../../services/api";

export function AppLayout({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const activeView = useSelector(selectActiveView);
  const role = user?.role || "adopter";
  const availableNav = navItems.filter((item) => item.roles.includes(role));

  useEffect(() => {
    if (role === "adopter") {
      const loadFavorites = async () => {
        try {
          const favorites = await apiRequest("/api/users/favorites", { token: user.token });
          dispatch(setFavorites(favorites));
        } catch (error) {
          console.error("Failed to load favorites", error);
        }
      };
      loadFavorites();
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            className="flex items-center gap-3 transition-premium hover:opacity-80"
            onClick={() => dispatch(setActiveView("pets"))}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176f5b] text-white shadow-lg shadow-[#176f5b]/20">
              <Icon name="home" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-black leading-tight tracking-tight text-slate-950">Adoptly</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#176f5b]">Network</span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 text-sm font-bold text-slate-700 sm:flex">
              <span>{user.name}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">{role}</span>
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-premium hover:border-red-200 hover:text-red-500 hover:shadow-red-50/50"
              title="Sign out"
              onClick={() => dispatch(logout())}
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-12 pt-24 sm:px-6 lg:flex-row lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-72 shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-soft lg:flex">
          <nav className="space-y-1.5">
            {availableNav.map((item) => (
              <NavButton key={item.id} item={item} active={activeView === item.id} />
            ))}
          </nav>
          <StatusPanel role={role} />
        </aside>

        <main className="min-w-0 flex-1">
          <nav className="mb-6 grid grid-cols-3 gap-2 sm:gap-4 lg:hidden">
            {availableNav.map((item) => (
              <NavButton key={item.id} item={item} active={activeView === item.id} compact />
            ))}
          </nav>
          <div className="transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavButton({ item, active, compact = false }) {
  const dispatch = useDispatch();

  if (compact) {
    return (
      <button
        onClick={() => dispatch(setActiveView(item.id))}
        className={classNames(
          "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-3 transition-premium",
          active
            ? "border-[#176f5b] bg-[#e7f4ef] text-[#176f5b] shadow-lg shadow-[#176f5b]/10"
            : "border-transparent bg-white text-slate-500 hover:border-slate-200 hover:text-slate-900"
        )}
      >
        <span className={classNames("transition-premium", active ? "scale-110" : "opacity-70")}>
          <Icon name={item.icon} />
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => dispatch(setActiveView(item.id))}
      className={classNames(
        "group flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-bold transition-premium",
        active
          ? "bg-[#176f5b] text-white shadow-lg shadow-[#176f5b]/20"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={classNames("transition-premium", active ? "scale-110" : "opacity-70 group-hover:opacity-100")}>
        <Icon name={item.icon} />
      </span>
      <span className="tracking-tight">{item.label}</span>
    </button>
  );
}

function StatusPanel({ role }) {
  const copy = {
    adopter: ["Adopter Space", "Track your journey to finding a new family member."],
    shelter: ["Shelter Portal", "Manage listings, connect with families, and track fosters."],
    foster: ["Foster Hub", "Coordinate care and share updates for your foster pets."]
  };

  const content = (role && copy[role]) || ["Welcome", "Connecting pets with loving families."];

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 p-5 text-white shadow-xl">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#176f5b]/20 blur-2xl" />
      <p className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-[#91e0c7]">{content?.[0] || "Welcome"}</p>
      <p className="relative z-10 mt-3 text-xs leading-relaxed text-slate-400 font-medium">{content?.[1] || "Connecting pets with families."}</p>
    </div>
  );
}
