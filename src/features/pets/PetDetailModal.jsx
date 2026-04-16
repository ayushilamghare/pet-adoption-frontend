import { useState } from "react";
import { Info } from "../../components/common/Info";
import { Modal } from "../../components/common/Modal";
import { TextArea } from "../../components/common/TextArea";
import { Icon } from "../../components/common/Icon";
import { classNames } from "../../utils/classNames";
import { sampleImages } from "../../constants/assets";
import { apiRequest } from "../../services/api";
import { PetForm } from "./PetForm";

export function PetDetailModal({ pet, auth, isFavorite, onFavorite, onClose, notify, onRefresh }) {
  const [answers, setAnswers] = useState("");
  const [message, setMessage] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const image = pet.images?.[0] || sampleImages[0];

  const isOwner = auth.user.role === "shelter" && (pet.shelter?._id === auth.user._id || pet.shelter === auth.user._id);

  const apply = async () => {
    try {
      await apiRequest("/api/applications", { token: auth.token, method: "POST", body: { petId: pet._id, answers: { note: answers } } });
      notify("Application submitted.");
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      notify(error.message);
    }
  };

  const contact = async () => {
    try {
      await apiRequest("/api/messages", { token: auth.token, method: "POST", body: { receiverId: pet.shelter?._id || pet.shelter, message } });
      notify("Message sent.");
      setMessage("");
    } catch (error) {
      notify(error.message);
    }
  };

  const remove = async () => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    try {
      await apiRequest(`/api/pets/${pet._id}`, { token: auth.token, method: "DELETE" });
      notify("Pet deleted.");
      onClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      notify(error.message);
    }
  };

  if (showEdit) {
    return <PetForm token={auth.token} initialData={pet} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); onClose(); notify("Pet updated."); if (onRefresh) onRefresh(); }} />;
  }

  return (
    <Modal title={pet.name} onClose={onClose}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
            <img className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={image} alt={pet.name} />

            {/* Favorite Button in Modal */}
            {auth.user.role === "adopter" ? (
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                title={isFavorite ? "Remove from favorites" : "Save to favorites"}
                className={classNames(
                  "absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-xl transition-premium active:scale-95",
                  isFavorite ? "text-red-500" : "text-slate-400 hover:text-red-500"
                )}
              >
                <Icon name={isFavorite ? "heart-filled" : "heart"} />
              </button>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-6 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm font-bold opacity-90">Living in {pet.location || "Open location"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Owner Shelter</h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#176f5b]/10 text-[#176f5b]">
                <Icon name="home" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{pet.shelter?.name || "Independent Shelter"}</p>
                <p className="text-xs font-semibold text-slate-500">{pet.shelter?.email || "Contact via portal"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Breed" value={pet.breed} />
            <Info label="Age" value={typeof pet.age === "object" ? `${pet.age.value} ${pet.age.unit}` : `${pet.age} years`} />
            <Info label="Size" value={pet.size || "Standard"} />
            <Info label="Color" value={pet.color || "Varied"} />
            <Info label="Type" value={pet.type || "Adoption"} />
          </div>

          <div className="mt-8 rounded-2xl bg-[#f8fafc] p-6 border border-slate-100">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Icon name="file" />
              Medical History
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">
              {pet.medicalHistory || "This pet has a standard medical record with no reported complications."}
            </p>
          </div>


          <div className="mt-8 space-y-6 pt-8 border-t border-slate-100">
            {auth.user.role === "adopter" ? (
              <div className="space-y-6">
                <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                  <TextArea label="Quick Adoption Note" placeholder="Tell us why you and this pet would be a great match..." value={answers} onChange={setAnswers} />
                  <button onClick={apply} className="h-12 w-full btn-primary shadow-lg shadow-[#176f5b]/20">
                    <Icon name="file" />
                    Submit Application
                  </button>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5">
                  <TextArea label="Direct Message" placeholder="Ask the shelter a question..." value={message} onChange={setMessage} />
                  <button onClick={contact} className="h-12 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 font-bold text-slate-700 transition-premium hover:border-[#176f5b] hover:text-[#176f5b]">
                    <Icon name="send" />
                    Send Inquiry
                  </button>
                </div>
              </div>
            ) : isOwner ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button onClick={() => setShowEdit(true)} className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 font-bold text-slate-700 transition-premium hover:border-[#176f5b] hover:text-[#176f5b] hover:shadow-lg hover:shadow-slate-200/50">
                  <Icon name="edit" />
                  Edit Details
                </button>
                <button onClick={remove} className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 font-bold text-red-600 transition-premium hover:border-red-200 hover:bg-red-100 hover:shadow-lg hover:shadow-red-50/50">
                  <Icon name="trash" />
                  Delete Listing
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-500">
                <Icon name="alert" />
                Only adopters can apply or message shelters regarding hearting this pet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
