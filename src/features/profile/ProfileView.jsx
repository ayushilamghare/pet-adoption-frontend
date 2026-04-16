import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field } from "../../components/common/Field";
import { SectionHeader } from "../../components/common/SectionHeader";
import { TextArea } from "../../components/common/TextArea";
import { selectAuth, updateCurrentUser } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";

export function ProfileView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [profile, setProfile] = useState({
    name: auth.user.name || "",
    phone: auth.user.phone || "",
    address: auth.user.address || ""
  });

  const save = async () => {
    try {
      const updated = await apiRequest("/api/users/me", { token: auth.token, method: "PUT", body: profile });
      dispatch(updateCurrentUser(updated));
      dispatch(setNotice("Profile updated."));
    } catch (error) {
      dispatch(setNotice(error.message));
    }
  };

  return (
    <section>
      <SectionHeader eyebrow="Account" title="Profile" />
      <div className="max-w-2xl rounded border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
          <Field label="Phone" value={profile.phone} onChange={(phone) => setProfile({ ...profile, phone })} />
          <div className="md:col-span-2"><TextArea label="Address" value={profile.address} onChange={(address) => setProfile({ ...profile, address })} /></div>
        </div>
        <button onClick={save} className="mt-4 h-11 rounded bg-[#176f5b] px-4 font-bold text-white">Save profile</button>
      </div>
    </section>
  );
}
