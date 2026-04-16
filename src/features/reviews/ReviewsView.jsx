import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { Icon } from "../../components/common/Icon";
import { selectAuth } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";

export function ReviewsView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const notify = (message) => dispatch(setNotice(message));

  const loadReviews = async () => {
    setLoading(true);
    try {
      const endpoint = auth.user.role === "shelter" ? "/api/reviews/shelter" : "/api/reviews/me";
      const data = await apiRequest(endpoint, { token: auth.token });
      setReviews(data || []);
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await apiRequest(`/api/reviews/${id}`, { token: auth.token, method: "DELETE" });
      notify("Review deleted.");
      loadReviews();
    } catch (error) {
      notify(error.message);
    }
  };

  const isShelter = auth.user.role === "shelter";

  return (
    <section>
      <SectionHeader 
        eyebrow={isShelter ? "Your feedback" : "My history"} 
        title={isShelter ? "Received Reviews" : "My Reviews"} 
        action={
          <button onClick={loadReviews} className="flex h-11 items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 font-bold text-slate-700 transition-premium hover:border-[#176f5b] hover:text-[#176f5b] outline-none">
            <Icon name="search" />
            Refresh
          </button>
        }
      />

      {loading ? <StateLine text="Loading reviews..." /> : null}
      
      {!loading && reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/60 bg-white/60 p-16 text-center shadow-xl backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Icon name="star" />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-500">
            {isShelter ? "No reviews received yet." : "You haven't reviewed any pets yet."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <article key={review._id} className="flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl transition-premium hover:-translate-y-1 hover:shadow-2xl">
            <div>
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-600">
                   <Icon name="star" className="h-4 w-4" />
                   <span className="text-sm font-black">{review.rating} / 5</span>
                 </div>
                 {!isShelter && (
                    <button 
                      onClick={() => deleteReview(review._id)}
                      className="text-slate-400 hover:text-red-500 transition-premium p-1"
                      title="Delete Review"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                 )}
               </div>

               <p className="mb-6 text-sm font-medium leading-relaxed text-slate-700">
                 "{review.comment || "No comment provided."}"
               </p>
            </div>
            
            <div className="mt-4 border-t border-slate-100 pt-4 flex items-center gap-3">
               <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#176f5b]/10 text-[#176f5b] flex items-center justify-center">
                  <Icon name={isShelter ? "user" : "heart"} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {isShelter ? "Reviewed by" : "Reviewed Pet"}
                 </p>
                 <p className="text-sm font-bold text-slate-900 truncate">
                   {isShelter ? review.user?.name : review.pet?.name}
                 </p>
               </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
