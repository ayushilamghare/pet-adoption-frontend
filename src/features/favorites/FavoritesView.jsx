import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { sampleImages } from "../../constants/assets";
import { selectAuth } from "../auth/authSlice";
import { setNotice, setActiveView } from "../ui/uiSlice";
import { selectFavoritePets, setFavorites } from "./favoritesSlice";
import { apiRequest } from "../../services/api";
import { PetCard } from "../pets/PetCard";

export function FavoritesView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const favoritePets = useSelector(selectFavoritePets);
  const [loading, setLoading] = useState(true);

  const notify = (message) => dispatch(setNotice(message));

  const loadFavorites = async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const favorites = await apiRequest("/api/users/favorites", { token: auth.token });
      dispatch(setFavorites(favorites));
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (petId) => {
    try {
      const favorites = await apiRequest(`/api/users/favorites/${petId}`, {
        token: auth.token,
        method: "DELETE"
      });
      dispatch(setFavorites(favorites));
      notify("Removed from favorites.");
    } catch (error) {
      notify(error.message);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <section>
      <SectionHeader
        eyebrow="Saved pets"
        title="Favorites"
        action={(
          <button onClick={() => dispatch(setActiveView("pets"))} className="h-11 rounded border border-slate-300 px-4 font-bold text-slate-800">
            Browse pets
          </button>
        )}
      />

      {loading ? <StateLine text="Loading favorites" /> : null}
      {!loading && favoritePets.length === 0 ? <StateLine text="No favorite pets yet" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {favoritePets.map((pet, index) => (
          <PetCard
            key={pet._id}
            pet={pet}
            image={pet.images?.[0] || sampleImages[index % sampleImages.length]}
            isFavorite
            onFavorite={() => removeFavorite(pet._id)}
            onSelect={() => dispatch(setActiveView({ view: "petDetail", params: { pet } }))}
            role="adopter"
          />
        ))}
      </div>
    </section>
  );
}
