import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field } from "../../components/common/Field";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { TextArea } from "../../components/common/TextArea";
import { selectAuth } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";

export function ReviewsView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [targetId, setTargetId] = useState("");
  const [isPet, setIsPet] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ shelterId: "", petId: "", rating: "5", comment: "" });

  const notify = (message) => dispatch(setNotice(message));

  const load = async () => {
    if (!targetId) return;
    try {
      setReviews(await apiRequest(`/api/reviews/${targetId}${isPet ? "?pet=true" : ""}`, { token: auth.token }));
    } catch (error) {
      notify(error.message);
    }
  };

  const submit = async () => {
    try {
      await apiRequest("/api/reviews", { token: auth.token, method: "POST", body: { ...form, rating: Number(form.rating) } });
      notify("Review added.");
      setForm({ shelterId: "", petId: "", rating: "5", comment: "" });
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <section>
      <SectionHeader eyebrow="Reviews and ratings" title="Reviews" />
      <div className="grid gap-4 lg:grid-cols-2">
        {auth.user.role === "adopter" ? (
          <div className="rounded border border-slate-200 bg-white p-4 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Shelter ID" value={form.shelterId} onChange={(shelterId) => setForm({ ...form, shelterId })} />
              <Field label="Pet ID" value={form.petId} onChange={(petId) => setForm({ ...form, petId })} />
              <Field label="Rating" type="number" value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              <div className="md:col-span-2"><TextArea label="Comment" value={form.comment} onChange={(comment) => setForm({ ...form, comment })} /></div>
            </div>
            <button onClick={submit} className="mt-4 h-11 rounded bg-[#176f5b] px-4 font-bold text-white">Post review</button>
          </div>
        ) : null}
        <div className="rounded border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <Field label="Shelter or pet ID" value={targetId} onChange={setTargetId} />
            <label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={isPet} onChange={(event) => setIsPet(event.target.checked)} />
              Pet
            </label>
            <button onClick={load} className="self-end rounded bg-[#172033] px-4 py-3 font-bold text-white">Load</button>
          </div>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review._id} className="rounded bg-slate-50 p-3">
                <p className="font-black">{review.rating}/5 · {review.user?.name || "Adopter"}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{review.comment}</p>
              </article>
            ))}
            {reviews.length === 0 ? <StateLine text="No reviews loaded" /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
