import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Info } from "../../components/common/Info";
import { TextArea } from "../../components/common/TextArea";
import { Icon } from "../../components/common/Icon";
import { classNames } from "../../utils/classNames";
import { sampleImages } from "../../constants/assets";
import { apiRequest } from "../../services/api";
import { PetForm } from "./PetForm";
import { setNotice, setActiveView, selectActiveParams } from "../ui/uiSlice";
import { selectAuth } from "../auth/authSlice";
import { StateLine } from "../../components/common/StateLine";

export function PetDetailView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const activeParams = useSelector(selectActiveParams);
  const pet = activeParams?.pet;

  const [answers, setAnswers] = useState("");
  const [fosterDuration, setFosterDuration] = useState({ value: "", unit: "months" });
  const [message, setMessage] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  
  const notify = (msg) => dispatch(setNotice(msg));
  const goBack = () => dispatch(setActiveView("pets"));

  useEffect(() => {
    if (pet?._id) {
      loadReviews();
      checkApplicationStatus();
    }
  }, [pet?._id]);

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <StateLine text="No pet selected." />
        <button onClick={goBack} className="mt-4 px-6 py-2 rounded-full bg-[#176f5b] text-white">Go Back</button>
      </div>
    );
  }

  const image = pet.images?.[0] || sampleImages[0];
  const isOwner = auth.user.role === "shelter" && (pet.shelter?._id === auth.user._id || pet.shelter === auth.user._id);

  const checkApplicationStatus = async () => {
    if (auth.user.role === "shelter") {
      setCheckingApplication(false);
      return;
    }
    try {
      const myApps = await apiRequest("/api/applications/my", { token: auth.token });
      const activeApp = myApps.find(app => (app.pet?._id || app.pet) === pet._id);
      setHasApplied(!!activeApp);
    } catch (error) {
      console.error("Failed to check application status", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await apiRequest(`/api/reviews/pet/${pet._id}`);
      setReviews(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const submitReview = async () => {
    try {
      if (!reviewForm.comment.trim()) return notify("Please enter a comment");
      await apiRequest("/api/reviews", { 
        token: auth.token, 
        method: "POST", 
        body: { petId: pet._id, rating: Number(reviewForm.rating), comment: reviewForm.comment } 
      });
      notify("Review posted successfully.");
      setReviewForm({ rating: "5", comment: "" });
      loadReviews();
    } catch (error) {
      notify(error.message);
    }
  };

  const apply = async () => {
    if (auth.user.role === "foster" && (!fosterDuration.value || Number(fosterDuration.value) <= 0)) {
      return notify("Please provide a valid foster duration.");
    }
    
    try {
      Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we process your application.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await apiRequest("/api/applications", { 
        token: auth.token, 
        method: "POST", 
        body: { 
          petId: pet._id, 
          answers: { note: answers },
          fosterDuration: auth.user.role === "foster" ? { value: Number(fosterDuration.value), unit: fosterDuration.unit } : undefined
        } 
      });
      
      setHasApplied(true);
      
      Swal.fire({
        title: 'Application Submitted!',
        text: 'The shelter has received your request. Check your Applications tab for updates.',
        icon: 'success',
        confirmButtonColor: '#176f5b',
        confirmButtonText: 'Great!'
      });
      
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#176f5b'
      });
    }
  };

  const contact = async () => {
    try {
      await apiRequest("/api/messages", { token: auth.token, method: "POST", body: { receiverId: pet.shelter?._id || pet.shelter, message } });
      Swal.fire({
        title: 'Message Sent!',
        text: 'Your shelter inquiry has been delivered.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setMessage("");
    } catch (error) {
      notify(error.message);
    }
  };

  const remove = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete this listing?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!isConfirmed) return;
    try {
      await apiRequest(`/api/pets/${pet._id}`, { token: auth.token, method: "DELETE" });
      notify("Pet deleted.");
      goBack();
    } catch (error) {
      notify(error.message);
    }
  };

  if (showEdit) {
    return <PetForm token={auth.token} initialData={pet} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); notify("Pet updated. Please refresh."); }} />;
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-16">
      <button onClick={goBack} className="mb-6 flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-soft text-sm font-bold text-slate-500 hover:text-[#176f5b] hover:border-[#176f5b]/30 hover:shadow-lg transition-premium outline-none">
        <Icon name="search" className="h-4 w-4 rotate-90" />
        Back to Listings
      </button>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        
        {/* Left Column: Image, Info, Reviews */}
        <div className="space-y-8 flex flex-col">
          <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl shadow-slate-200/50">
            <img className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" src={image} alt={pet.name} />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-8 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <p className="text-xl font-black drop-shadow-md">Living in {pet.location || "Open location"}</p>
            </div>
            
            <span className="absolute top-6 left-6 rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg">
               {pet.type} List
            </span>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-soft border border-slate-100/50">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Breed</p>
                  <p className="font-bold text-slate-800">{pet.breed}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Age</p>
                  <p className="font-bold text-slate-800">{typeof pet.age === "object" ? `${pet.age.value} ${pet.age.unit}` : `${pet.age} yrs`}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Size</p>
                  <p className="font-bold text-slate-800">{pet.size || "Standard"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Color</p>
                  <p className="font-bold text-slate-800">{pet.color || "Varied"}</p>
                </div>
             </div>

             {pet.medicalHistory && (
               <div className="mt-8 rounded-2xl bg-slate-50/80 p-5 border border-slate-100">
                 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#176f5b]">
                   <Icon name="file" />
                   Medical History
                 </h4>
                 <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">
                   {pet.medicalHistory}
                 </p>
               </div>
             )}
          </div>

          <div className="pt-4 max-w-full">
            <div className="flex items-center justify-between mb-8">
               <h4 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                 <Icon name="star" />
                 Reviews <span className="text-slate-400 font-medium">({reviews.length})</span>
               </h4>
            </div>

            {(auth.user.role === "adopter" || auth.user.role === "foster") && (
              <div className="mb-10 rounded-3xl border border-emerald-100 bg-[#e7f4ef]/60 p-6 shadow-soft transition-premium focus-within:shadow-xl focus-within:border-emerald-200 focus-within:bg-white">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-sm font-black uppercase tracking-widest text-[#176f5b]">Write Review</h5>
                    <select
                      className="h-9 w-max rounded-lg border border-emerald-200/50 bg-[#176f5b]/5 px-3 text-xs font-bold text-[#176f5b] outline-none transition-premium focus:ring-2 focus:ring-[#176f5b]/20 cursor-pointer"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <textarea 
                    className="w-full min-h-[80px] rounded-2xl border-0 bg-transparent p-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-0 resize-none"
                    placeholder="Share your interactions with this pet..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                  <button onClick={submitReview} className="h-10 px-8 rounded-full bg-[#176f5b] text-sm font-black text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848] hover:shadow-xl hover:-translate-y-0.5 active:scale-95 self-end">
                    Publish
                  </button>
                </div>
              </div>
            )}

            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {reviews.length === 0 ? (
                <div className="break-inside-avoid p-8 text-center flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Icon name="star" className="text-slate-300 h-10 w-10 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No experiences shared yet.</p>
                </div>
              ) : (
                 reviews.map(review => (
                   <article key={review._id} className="break-inside-avoid rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft transition-premium hover:shadow-xl">
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shadow-inner">
                           {(review.user?.name || "U")[0].toUpperCase()}
                         </div>
                         <div className="min-w-0">
                           <p className="truncate text-sm font-black text-slate-900">{review.user?.name || "Anonymous"}</p>
                           <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">{review.user?.role || "User"}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-1 text-[#f59e0b] bg-amber-50 px-2 py-1 rounded-full shadow-inner shrink-0">
                         <Icon name="star" className="h-3 w-3" />
                         <span className="text-xs font-black">{review.rating}</span>
                       </div>
                     </div>
                     <p className="text-sm font-medium leading-relaxed text-slate-600 line-clamp-6">{review.comment}</p>
                   </article>
                 ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Cards */}
        <div className="flex flex-col gap-6 sticky top-8 self-start">
          
          <div className="rounded-[2rem] border-2 border-[#176f5b]/10 bg-white p-6 shadow-xl shadow-slate-200/50">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">{pet.name}</h1>
            <p className="text-sm font-bold text-slate-500 mb-8">{pet.breed} • {pet.size || "Standard"} • {pet.type === 'foster' ? 'Needs Temporary Home' : 'Ready for Adoption'}</p>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
               <div className="h-12 w-12 flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-[#176f5b]">
                 <Icon name="home" />
               </div>
               <div className="min-w-0">
                 <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Cared for by</p>
                 <p className="truncate text-sm font-black text-slate-900">{pet.shelter?.name || "Independent Shelter"}</p>
               </div>
            </div>
          </div>

          {(auth.user.role === "adopter" || auth.user.role === "foster") ? (
            <div className="flex flex-col gap-6">
              
              {!checkingApplication && hasApplied ? (
                <div className="rounded-[2rem] border-2 border-emerald-500/20 bg-emerald-50 p-8 text-center shadow-lg">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#176f5b] mb-4 shadow-inner">
                    <Icon name="file" />
                  </div>
                  <p className="text-lg font-black text-[#176f5b] mb-2">Application Active!</p>
                  <p className="text-sm font-bold text-emerald-700/80 leading-relaxed">
                    Good luck! You've already submitted a request. Check your Applications Dashboard to see updates.
                  </p>
                </div>
              ) : (
                <div className="rounded-[2rem] border-2 border-[#176f5b]/20 bg-gradient-to-b from-[#e7f4ef]/50 to-white p-8 shadow-xl shadow-[#176f5b]/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Icon name={auth.user.role === "foster" ? "home" : "heart"} className="h-32 w-32" />
                  </div>

                  <h3 className="text-2xl font-black text-[#176f5b] mb-6">
                    {auth.user.role === "foster" ? "Apply to Foster" : "Adopt Me"}
                  </h3>
                  
                  <div className="space-y-5 relative z-10">
                    {auth.user.role === "foster" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#176f5b]">Foster Duration</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            placeholder="Amount (e.g. 5)"
                            className="h-12 flex-1 rounded-xl border border-emerald-200/60 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-premium focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/10 shadow-inner"
                            value={fosterDuration.value}
                            onChange={(e) => setFosterDuration({ ...fosterDuration, value: e.target.value })}
                          />
                          <select
                            className="h-12 w-[110px] rounded-xl border border-emerald-200/60 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition-premium focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/10 shadow-inner cursor-pointer"
                            value={fosterDuration.unit}
                            onChange={(e) => setFosterDuration({ ...fosterDuration, unit: e.target.value })}
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="months">Months</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                       <label className="block text-xs font-bold uppercase tracking-widest text-[#176f5b]">Why are you a great match?</label>
                       <textarea 
                         className="w-full min-h-[140px] rounded-2xl border border-emerald-200/60 bg-white p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/10 outline-none resize-none shadow-inner transition-premium"
                         placeholder="Introduce yourself to the shelter..."
                         value={answers} 
                         onChange={(e) => setAnswers(e.target.value)}
                       />
                    </div>

                    <button 
                      onClick={apply} 
                      disabled={checkingApplication}
                      className="h-14 w-full flex items-center justify-center gap-3 rounded-2xl bg-[#176f5b] text-base font-black text-white shadow-xl shadow-[#176f5b]/30 transition-premium hover:bg-[#0f5848] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    >
                      <Icon name="send" />
                      Submit Application
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
                <h3 className="text-lg font-black text-slate-900 mb-6">Ask the Shelter</h3>
                <div className="space-y-4">
                  <textarea 
                    className="w-full min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none shadow-inner transition-premium"
                    placeholder="Have a question about diet or behavior?"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button onClick={contact} className="h-12 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 transition-premium hover:border-indigo-500 hover:text-indigo-600 active:scale-[0.98]">
                    <Icon name="message" />
                    Send Inquiry
                  </button>
                </div>
              </div>
              
            </div>
          ) : isOwner ? (
            <div className="rounded-[2rem] border-2 border-slate-200 bg-white p-8 shadow-xl">
              <h3 className="text-lg font-black text-slate-900 mb-6">Owner Tools</h3>
              <div className="flex flex-col gap-4">
                <button onClick={() => setShowEdit(true)} className="h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-base font-bold text-slate-700 transition-premium hover:border-[#176f5b] hover:text-[#176f5b] hover:shadow-lg active:scale-[0.98]">
                  <Icon name="edit" />
                  Edit Listing
                </button>
                <button onClick={remove} className="h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 text-base font-bold text-red-600 transition-premium hover:border-red-300 hover:bg-red-100 hover:shadow-lg active:scale-[0.98]">
                  <Icon name="trash" />
                  Delete Listing
                </button>
              </div>
            </div>
          ) : (
             null
          )}
          
        </div>
      </div>
    </div>
  );
}
