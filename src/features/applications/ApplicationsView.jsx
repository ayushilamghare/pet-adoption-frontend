import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { Icon } from "../../components/common/Icon";
import { selectAuth } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";
import { PetDetailModal } from "../pets/PetDetailModal";

export function ApplicationsView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);

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
    try {
      await apiRequest(`/api/applications/${id}`, {
        token: auth.token,
        method: "PUT",
        body: { status, scheduledMeet, shelterNote }
      });
      notify("Application updated.");
      load();
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <section>
      <SectionHeader eyebrow="Application management" title={auth.user.role === "shelter" ? "Shelter applications" : "My applications"} />
      {loading ? <StateLine text="Loading applications" /> : null}
      <div className="grid gap-4">
        {applications.map((application) => (
          <ApplicationRow key={application._id} application={application} role={auth.user.role} onUpdate={updateStatus} onViewPet={() => setSelectedPet(application.pet)} />
        ))}
      </div>
      {!loading && applications.length === 0 ? <StateLine text="No applications yet" /> : null}

      {selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          auth={auth}
          onClose={() => setSelectedPet(null)}
          notify={notify}
          onRefresh={load}
        />
      )}
    </section>
  );
}

function ApplicationRow({ application, role, onUpdate, onViewPet }) {
  const [meet, setMeet] = useState(application.scheduledMeet ? new Date(application.scheduledMeet).toISOString().slice(0, 16) : "");
  const [note, setNote] = useState(application.shelterNote || "");

  const statusColors = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    more_info_requested: "bg-blue-50 text-blue-600 border-blue-100",
    meet_scheduled: "bg-violet-50 text-violet-600 border-violet-100"
  };

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-premium hover:shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Icon name={application.type === "foster" ? "home" : "heart"} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-black tracking-tight text-slate-950">{application.pet?.name || "Pet"}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-slate-600">
                {application.type}
              </span>
            </div>
            <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">
              {role === "shelter" ? application.user?.name : "Shelter Application"} · {application.user?.email || application.pet?.breed}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {role === "shelter" && (
            <button
              onClick={onViewPet}
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-4 text-xs font-black text-slate-600 transition-premium hover:bg-slate-100 active:scale-95"
            >
              <Icon name="search" />
              History
            </button>
          )}
          <span className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${statusColors[application.status] || "bg-slate-50 text-slate-400"}`}>
            {application.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {(application.scheduledMeet || application.shelterNote) && (
        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
          {application.scheduledMeet && (
            <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <Icon name="calendar" className="text-violet-500" style={{ height: "20px !important" }} />
              <span>Meeting: {new Date(application.scheduledMeet).toLocaleString()}</span>
            </div>
          )}
          {application.shelterNote && (
            <div className="flex items-start gap-3 text-sm font-medium text-slate-600">
              <Icon name="message" className="mt-0.5 text-blue-500" />
              <p>{application.shelterNote}</p>
            </div>
          )}
        </div>
      )}

      {role === "shelter" && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule Meeting</span>
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-violet-500"
                  type="datetime-local"
                  value={meet}
                  onChange={(e) => setMeet(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Note / Instructions</span>
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500"
                  placeholder="e.g. Please bring valid ID"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onUpdate(application._id, "more_info_requested", undefined, note)} className="h-11 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 transition-premium hover:bg-slate-50">MORE INFO</button>
                <button onClick={() => onUpdate(application._id, "meet_scheduled", meet, note)} className="h-11 rounded-xl bg-violet-600 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition-premium hover:bg-violet-700">SCHEDULE</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onUpdate(application._id, "rejected", undefined, note)} className="h-11 rounded-xl bg-rose-50 text-xs font-black text-rose-600 hover:bg-rose-100 transition-premium">REJECT</button>
                <button onClick={() => onUpdate(application._id, "approved", undefined, note)} className="h-11 rounded-xl bg-[#176f5b] text-xs font-black text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848]">APPROVE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
