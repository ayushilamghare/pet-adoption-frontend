import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field } from "../../components/common/Field";
import { SectionHeader } from "../../components/common/SectionHeader";
import { TextArea } from "../../components/common/TextArea";
import { Icon } from "../../components/common/Icon";
import { selectAuth } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";

export function FosterView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [form, setForm] = useState({ bio: "", experience: "" });
  const [foster, setFoster] = useState(null);
  const [note, setNote] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [assign, setAssign] = useState({ petId: "", fosterId: "" });

  const notify = (message) => dispatch(setNotice(message));

  const load = async () => {
    if (auth.user.role !== "foster") return;
    try {
      const data = await apiRequest("/api/foster/me", { token: auth.token });
      setFoster(data);
      if (data.pets?.length > 0 && !selectedPetId) {
        setSelectedPetId(data.pets[0]._id);
      }
    } catch {
      setFoster(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const register = async () => {
    try {
      if (!form.bio.trim() || !form.experience.trim()) {
        return notify("Please fill in your bio and experience.");
      }
      await apiRequest("/api/foster/register", {
        token: auth.token,
        method: "POST",
        body: form
      });
      notify("Foster profile created.");
      load();
    } catch (error) {
      notify(error.message);
    }
  };

  const update = async () => {
    if (!selectedPetId) return notify("Please select a pet for this update");
    if (!note.trim()) return notify("Please enter an update note");

    try {
      await apiRequest("/api/foster/update", {
        token: auth.token,
        method: "PUT",
        body: { petId: selectedPetId, note }
      });
      setNote("");
      notify("Update posted successfully.");
      load();
    } catch (error) {
      notify(error.message);
    }
  };

  const assignPet = async () => {
    try {
      await apiRequest("/api/foster/assign", { token: auth.token, method: "PUT", body: assign });
      notify("Pet assigned successfully.");
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <section>
      <SectionHeader eyebrow="Foster coordination" title="Foster center" />
      {auth.user.role === "shelter" ? (
        <div className="rounded border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pet ID" value={assign.petId} onChange={(petId) => setAssign({ ...assign, petId })} />
            <Field label="Foster user ID" value={assign.fosterId} onChange={(fosterId) => setAssign({ ...assign, fosterId })} />
          </div>
          <button onClick={assignPet} className="mt-4 flex h-11 items-center gap-2 rounded bg-[#176f5b] px-4 font-bold text-white">
            <Icon name="home" />
            Assign foster
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {!foster ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
              <div className="max-w-md">
                <h3 className="text-xl font-black text-slate-900">Become a Foster Parent</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">Help animals in need by providing a temporary home. Tell us a bit about yourself.</p>
              </div>
              <div className="grid gap-4">
                <TextArea label="Bio" placeholder="Tell us about yourself..." value={form.bio} onChange={(bio) => setForm({ ...form, bio })} />
                <TextArea label="Experience" placeholder="Previous experience with pets..." value={form.experience} onChange={(experience) => setForm({ ...form, experience })} />
                <button onClick={register} className="h-12 w-full btn-primary">Create foster profile</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <Icon name="user" />
                      Foster Profile
                    </h4>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{foster.bio || "No bio provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{foster.experience || "No experience listed"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Icon name="home" />
                    Assigned Pets ({foster.pets?.length || 0})
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(foster.pets || []).map((pet) => (
                      <article key={pet._id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition-premium hover:border-[#176f5b]/30 hover:shadow-xl">
                        <p className="text-lg font-black text-slate-900">{pet.name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">{pet.breed} · {pet.status}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Active Foster</span>
                        </div>
                      </article>
                    ))}
                  </div>
                  {(!foster.pets || foster.pets.length === 0) && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 p-12 text-center">
                      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-300">
                        <Icon name="heart" />
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-400">No pets currently assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
