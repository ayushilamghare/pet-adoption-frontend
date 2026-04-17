import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { Icon } from "../../components/common/Icon";
import { selectAuth } from "../auth/authSlice";
import { setNotice, setActiveView } from "../ui/uiSlice";
import { classNames } from "../../utils/classNames";
import { apiRequest } from "../../services/api";

export function ApplicationsView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("adoption");

  const notify = (message) => dispatch(setNotice(message));

  const load = async () => {
    setLoading(true);
    try {
      const path = auth.user.role === "shelter" ? "/api/applications/shelter" : "/api/applications/my";
      setApplications(await apiRequest(path, { token: auth.token }));
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status, scheduledMeet = "", shelterNote = "") => {
    Swal.fire({
      title: 'Updating...',
      text: 'Please wait while the status processes.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await apiRequest(`/api/applications/${id}`, {
        token: auth.token,
        method: "PUT",
        body: { status, scheduledMeet, shelterNote }
      });
      Swal.fire({
        title: "Updated",
        text: "Application processed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      load();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const viewPetDetails = (pet) => {
    dispatch(setActiveView({ view: "petDetail", params: { pet } }));
  };

  const isShelter = auth.user.role === "shelter";

  // Filter based on shelter tab selection. Fosters & Adopters view everything.
  const displayedApplications = isShelter 
    ? applications.filter(app => app.type === activeTab)
    : applications;

  // Group by pet if shelter
  const groupedByPet = isShelter ? displayedApplications.reduce((acc, app) => {
    const petId = app.pet?._id;
    if (!acc[petId]) acc[petId] = { pet: app.pet, applications: [] };
    acc[petId].applications.push(app);
    return acc;
  }, {}) : null;

  const groupedApplications = isShelter ? Object.values(groupedByPet) : null;

  return (
    <section>
      <SectionHeader 
        eyebrow="Application management" 
        title={isShelter ? "Shelter Dashboard" : "My Applications"} 
      />

      {isShelter && (
        <div className="mb-8 flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("adoption")}
            className={classNames(
              "px-6 py-4 text-sm font-black transition-premium outline-none",
              activeTab === "adoption" ? "border-b-4 border-[#176f5b] text-[#176f5b]" : "text-slate-400 hover:text-slate-600 border-b-4 border-transparent hover:border-slate-300"
            )}
          >
            Adoption Requests
          </button>
          <button
            onClick={() => setActiveTab("foster")}
            className={classNames(
              "px-6 py-4 text-sm font-black transition-premium outline-none",
              activeTab === "foster" ? "border-b-4 border-[#176f5b] text-[#176f5b]" : "text-slate-400 hover:text-slate-600 border-b-4 border-transparent hover:border-slate-300"
            )}
          >
            Foster Requests
          </button>
        </div>
      )}

      {loading ? <StateLine text="Loading applications" /> : null}

      {isShelter ? (
        <div className="grid gap-8">
          {groupedApplications.map((group) => (
            <div key={group.pet._id} className="rounded-3xl bg-slate-50/50 p-6 border border-slate-200/60 shadow-inner">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                 <div className="flex items-center gap-3">
                   <h3 className="text-xl font-black text-slate-800">{group.pet.name}</h3>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">{group.applications.length} Requests</span>
                 </div>
                 <button onClick={() => viewPetDetails(group.pet)} className="text-sm font-bold text-[#176f5b] hover:underline transition-premium">View Pet Details →</button>
              </div>
              <div className="grid gap-6">
                {group.applications.map((application) => (
                  <ApplicationRow 
                    key={application._id} 
                    application={application} 
                    role={auth.user.role} 
                    onUpdate={updateStatus} 
                    onViewPet={() => viewPetDetails(application.pet)} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {displayedApplications.map((application) => (
            <ApplicationRow 
              key={application._id} 
              application={application} 
              role={auth.user.role} 
              onUpdate={updateStatus} 
              onViewPet={() => viewPetDetails(application.pet)} 
            />
          ))}
        </div>
      )}
      
      {!loading && displayedApplications.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mb-4">
             <Icon name="file" className="h-8 w-8" />
          </div>
          <p className="text-xl font-black text-slate-400">No applications found in this category.</p>
        </div>
      ) : null}
    </section>
  );
}

function ApplicationRow({ application, role, onUpdate, onViewPet }) {
  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rejected: "bg-rose-50 text-rose-600 border-rose-200",
    more_info_requested: "bg-blue-50 text-blue-600 border-blue-200",
    meet_scheduled: "bg-violet-50 text-violet-600 border-violet-200"
  };

  const handleApprove = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Approve Application?',
      text: `Are you sure you want to approve this for ${application.pet?.name || 'this pet'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#176f5b',
      confirmButtonText: 'Yes, Approve',
      focusCancel: true
    });
    if (isConfirmed) onUpdate(application._id, "approved");
  };

  const handleReject = async () => {
    const { isConfirmed, value: note } = await Swal.fire({
      title: 'Reject Application',
      text: "You can optionally provide a reason to the applicant:",
      input: 'text',
      inputPlaceholder: "Reason for rejection...",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Reject'
    });
    if (isConfirmed) onUpdate(application._id, "rejected", undefined, note);
  };

  const handleMoreInfo = async () => {
    const { isConfirmed, value: note } = await Swal.fire({
      title: 'Request More Info',
      input: 'text',
      inputPlaceholder: "What questions do you have?",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Send Request',
      inputValidator: (value) => {
        if (!value) return 'You need to write a message!';
      }
    });
    if (isConfirmed) onUpdate(application._id, "more_info_requested", undefined, note);
  };

  const handleSchedule = async () => {
    const { isConfirmed, value: formValues } = await Swal.fire({
      title: 'Schedule Meeting',
      html: `
        <div style="text-align:left; font-size: 14px; font-weight: bold; color: #475569; margin-bottom: 8px;">Select Date & Time</div>
        <input type="datetime-local" id="swal-meet" class="swal2-input" style="width: 100%; margin: 0 0 1rem 0; box-sizing: border-box; font-family: inherit;">
        <div style="text-align:left; font-size: 14px; font-weight: bold; color: #475569; margin-bottom: 8px;">Internal Note / Instructions (Optional)</div>
        <input type="text" id="swal-note" class="swal2-input" placeholder="e.g. Please bring ID..." style="width: 100%; margin: 0; box-sizing: border-box; font-family: inherit;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Schedule",
      confirmButtonColor: '#8b5cf6',
      preConfirm: () => {
        return {
          meet: document.getElementById('swal-meet').value,
          note: document.getElementById('swal-note').value
        };
      }
    });

    if (isConfirmed) {
      if (formValues && formValues.meet) {
        onUpdate(application._id, "meet_scheduled", formValues.meet, formValues.note);
      } else {
        Swal.fire("Error", "Please select a valid date/time.", "error");
      }
    }
  };

  return (
    <article className="group rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-soft transition-premium hover:shadow-xl hover:border-slate-300">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-5">
          <div className={classNames(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner text-white",
            application.type === "foster" ? "bg-gradient-to-tr from-[#176f5b] to-emerald-400" : "bg-gradient-to-tr from-blue-500 to-indigo-500"
          )}>
            <Icon name={application.type === "foster" ? "home" : "heart"} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-black tracking-tight text-slate-900">{application.pet?.name || "Pet"}</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                {application.type}
              </span>
            </div>
            <p className="mt-2 text-sm font-black text-slate-500 tracking-wide">
              {role === "shelter" ? application.user?.name : "Shelter Overview"} <span className="text-slate-300 mx-1">•</span> <span className="text-slate-400 font-bold">{application.user?.email || application.pet?.breed}</span>
            </p>
            
            {application.type === "foster" && application.fosterDuration && role === "shelter" && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                <Icon name="file" /> Duration: {application.fosterDuration.value} {application.fosterDuration.unit}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onViewPet}
            className="flex h-12 items-center gap-2 rounded-xl bg-slate-50 px-5 text-sm font-black text-slate-600 transition-premium hover:bg-slate-100 active:scale-95 border border-slate-200"
          >
            <Icon name="search" />
            Listing
          </button>
          <span className={`rounded-xl border-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest shadow-inner ${statusColors[application.status] || "bg-slate-50 text-slate-400 border-slate-200"}`}>
            {application.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {(application.scheduledMeet || application.shelterNote) && (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {application.scheduledMeet && (
            <div className="flex items-center gap-4 rounded-2xl bg-violet-50/50 p-5 border border-violet-100">
              <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-violet-500">
                <Icon name="calendar" style={{ height: "20px" }} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-0.5">Meeting Time</p>
                <p className="text-sm font-bold text-violet-900">{new Date(application.scheduledMeet).toLocaleString()}</p>
              </div>
            </div>
          )}
          {application.shelterNote && (
            <div className="flex items-start gap-4 rounded-2xl bg-blue-50/50 p-5 border border-blue-100">
              <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-blue-500">
                <Icon name="message" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">Note</p>
                <p className="text-sm font-bold text-blue-900">{application.shelterNote}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {application.answers && application.answers.note && role === "shelter" && (
         <div className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-100">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message from Applicant</p>
           <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-2 border-slate-300 pl-3">
             "{application.answers.note}"
           </p>
         </div>
      )}

      {role === "shelter" && !["approved", "rejected"].includes(application.status) && (
        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap justify-end gap-3">
            <button onClick={handleMoreInfo} className="h-12 px-6 rounded-xl border-2 border-blue-100 bg-white text-xs font-black text-blue-600 transition-premium hover:bg-blue-50 active:scale-95">MORE INFO</button>
            <button onClick={handleSchedule} className="h-12 px-6 rounded-xl bg-violet-600 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition-premium hover:bg-violet-700 active:scale-95">SCHEDULE</button>
            <button onClick={handleReject} className="h-12 px-6 rounded-xl bg-rose-50 border-2 border-rose-100 text-xs font-black text-rose-600 hover:bg-rose-100 transition-premium active:scale-95">REJECT</button>
            <button onClick={handleApprove} className="h-12 px-8 rounded-xl bg-[#176f5b] text-xs font-black text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848] active:scale-95">APPROVE</button>
        </div>
      )}
    </article>
  );
}
