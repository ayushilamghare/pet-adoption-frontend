import { useSelector } from "react-redux";
import { AppLayout } from "./components/layout/AppLayout";
import { NoticeToast } from "./components/layout/NoticeToast";
import { ApplicationsView } from "./features/applications/ApplicationsView";
import { AuthScreen } from "./features/auth/AuthScreen";
import { selectCurrentUser } from "./features/auth/authSlice";
import { FosterView } from "./features/foster/FosterView";
import { FavoritesView } from "./features/favorites/FavoritesView";
import { MessagesView } from "./features/messages/MessagesView";
import { PetsView } from "./features/pets/PetsView";
import { ProfileView } from "./features/profile/ProfileView";
import { ReviewsView } from "./features/reviews/ReviewsView";
import { selectActiveView } from "./features/ui/uiSlice";

const viewComponents = {
  pets: PetsView,
  favorites: FavoritesView,
  applications: ApplicationsView,
  foster: FosterView,
  messages: MessagesView,
  reviews: ReviewsView,
  profile: ProfileView
};

function App() {
  const user = useSelector(selectCurrentUser);
  const activeView = useSelector(selectActiveView);
  const ActiveView = viewComponents[activeView] || PetsView;

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {user ? (
        <AppLayout>
          <ActiveView />
        </AppLayout>
      ) : (
        <AuthScreen />
      )}
      <NoticeToast />
    </div>
  );
}

export default App;
