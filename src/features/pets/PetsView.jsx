import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field } from "../../components/common/Field";
import { Icon } from "../../components/common/Icon";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { classNames } from "../../utils/classNames";
import { sampleImages } from "../../constants/assets";
import { petSizes } from "../../constants/petOptions";
import { selectAuth } from "../auth/authSlice";
import { selectFavoriteIds, setFavorites } from "../favorites/favoritesSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";
import { PetCard } from "./PetCard";
import { PetDetailModal } from "./PetDetailModal";
import { PetForm } from "./PetForm";

export function PetsView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const favoriteIds = useSelector(selectFavoriteIds);
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    breed: "",
    age: "",
    size: "",
    location: "",
    status: "available",
    type: "", // Default determined by role in useEffect
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const notify = (message) => dispatch(setNotice(message));

  const loadPets = async (pageToLoad = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        page: pageToLoad,
        limit: 9
      });
      const data = await apiRequest(`/api/pets?${params.toString()}`, { token: auth.token });
      setPets(data.pets || []);
      setPagination({ total: data.total || 0, totalPages: data.totalPages || 1 });
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default type based on role once on mount
    if (!filters.type) {
      if (auth.user.role === "adopter") {
        setFilters(prev => ({ ...prev, type: "adoption" }));
      } else if (auth.user.role === "foster") {
        setFilters(prev => ({ ...prev, type: "foster" }));
      }
    }
  }, []); // Only once on mount

  useEffect(() => {
    loadPets();
  }, [page, filters.breed, filters.age, filters.size, filters.location, filters.status, filters.type, filters.sortBy, filters.sortOrder]);

  const toggleFavorite = async (petId) => {
    if (auth.user.role !== "adopter") return;

    try {
      const isFavorite = favoriteIds.includes(petId);
      const favorites = await apiRequest(`/api/users/favorites/${petId}`, {
        token: auth.token,
        method: isFavorite ? "DELETE" : "PUT"
      });

      dispatch(setFavorites(favorites));
      notify(isFavorite ? "Removed from favorites." : "Added to favorites.");
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Search and listings"
        title="Available pets"
        action={auth.user.role === "shelter" ? (
          <button onClick={() => setShowForm(true)} className="flex h-11 items-center gap-2 rounded bg-[#176f5b] px-4 font-bold text-white">
            <Icon name="plus" />
            Add pet
          </button>
        ) : null}
      />

      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <Field label="Breed" value={filters.breed} onChange={(breed) => setFilters({ ...filters, breed })} placeholder="E.g. Lab" />
        <Field label="Max Age" type="number" value={filters.age} onChange={(age) => setFilters({ ...filters, age })} placeholder="E.g. 5" />

        <label className="block">
          <span className="mb-2.5 block text-sm font-bold text-slate-700">Size</span>
          <select
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-premium focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
            value={filters.size}
            onChange={(event) => setFilters({ ...filters, size: event.target.value })}
          >
            <option value="">All sizes</option>
            {petSizes.map((size) => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </label>

        <Field label="Location" value={filters.location} onChange={(location) => setFilters({ ...filters, location })} placeholder="E.g. Mumbai" />

        <label className="block">
          <span className="mb-2.5 block text-sm font-bold text-slate-700">Status</span>
          <select
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-premium focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">Any</option>
            <option value="available">Available</option>
            <option value="fostered">Fostered</option>
            <option value="adopted">Adopted</option>
          </select>
        </label>

        {auth.user.role === "shelter" && (
          <label className="block">
            <span className="mb-2.5 block text-sm font-bold text-slate-700">Listing Type</span>
            <select
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-premium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-slate-900"
              value={filters.type}
              onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            >
              <option value="">All Types</option>
              <option value="adoption">Adoption</option>
              <option value="foster">Foster</option>
            </select>
          </label>
        )}

        <div className="flex flex-col">
          <span className="mb-2.5 block text-sm font-bold text-slate-700">Sort & Order</span>
          <div className="flex gap-2">
            <select
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-premium focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
              value={filters.sortBy}
              onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}
            >
              <option value="createdAt">Date listed</option>
              <option value="age">Age</option>
              <option value="name">Name</option>
            </select>
            <button
              type="button"
              title={filters.sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
              onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
              className={classNames(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition-premium",
                filters.sortOrder === "asc" ? "border-[#176f5b] bg-[#e7f4ef] text-[#176f5b]" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              <Icon name="arrow-down" className={classNames("h-5 w-5 transition-transform", filters.sortOrder === "asc" ? "rotate-180" : "")} />
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => { setPage(1); loadPets(1); }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#176f5b] font-black text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848] active:scale-[0.98]"
          >
            <Icon name="search" />
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? <StateLine text="Loading pets" /> : null}
      {!loading && pets.length === 0 ? <StateLine text="No pets match the current filters" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet, index) => (
          <PetCard
            key={pet._id}
            pet={pet}
            image={pet.images?.[0] || sampleImages[index % sampleImages.length]}
            isFavorite={favoriteIds.includes(pet._id)}
            onFavorite={() => toggleFavorite(pet._id)}
            onSelect={() => setSelectedPet(pet)}
            role={auth.user.role}
          />
        ))}
      </div>

      {!loading && pagination.totalPages > 1 ? (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded border border-slate-200 bg-white p-4 shadow-soft sm:flex-row">
          <p className="text-sm font-bold text-slate-600">
            Page {page} of {pagination.totalPages} · {pagination.total} pets
          </p>
          <div className="flex gap-2">
            <button
              className="h-10 rounded border border-slate-300 px-4 font-bold text-slate-700 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </button>
            <button
              className="h-10 rounded border border-slate-300 px-4 font-bold text-slate-700 disabled:opacity-40"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? <PetForm token={auth.token} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadPets(); notify("Pet listing saved."); }} /> : null}
      {selectedPet ? (
        <PetDetailModal
          pet={selectedPet}
          auth={auth}
          isFavorite={favoriteIds.includes(selectedPet._id)}
          onFavorite={() => toggleFavorite(selectedPet._id)}
          onClose={() => setSelectedPet(null)}
          notify={notify}
          onRefresh={loadPets}
        />
      ) : null}
    </section>
  );
}
