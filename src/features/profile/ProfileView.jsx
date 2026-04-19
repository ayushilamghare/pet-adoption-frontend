import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field } from "../../components/common/Field";
import { SectionHeader } from "../../components/common/SectionHeader";
import { TextArea } from "../../components/common/TextArea";
import { selectAuth, updateCurrentUser } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";
import { Icon } from "../../components/common/Icon";

export function ProfileView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [profile, setProfile] = useState({
    name: auth.user.name || "",
    phone: auth.user.phone || "",
    address: auth.user.address || ""
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (profile.phone.trim()) {
      if (!/^[\d\s\-\+\(\)]{7,15}$/.test(profile.phone.trim())) {
        newErrors.phone = "Enter a valid phone number (7–15 digits, spaces, or dashes)";
      }
    }

    if (profile.address.length > 200) {
      newErrors.address = "Address must be under 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async () => {
    setSubmitError("");
    if (!validate()) return;

    try {
      const updated = await apiRequest("/api/users/me", { token: auth.token, method: "PUT", body: profile });
      dispatch(updateCurrentUser(updated));
      dispatch(setNotice("Profile updated successfully."));
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <section>
      <SectionHeader eyebrow="Account" title="Profile" />
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        {submitError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
            <Icon name="alert" />
            {submitError}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Full name"
            value={profile.name}
            onChange={(name) => { setProfile({ ...profile, name }); setErrors({ ...errors, name: "" }); }}
            error={errors.name}
          />
          <Field
            label="Phone number"
            placeholder="E.g. +91 98765 43210"
            value={profile.phone}
            onChange={(phone) => { setProfile({ ...profile, phone }); setErrors({ ...errors, phone: "" }); }}
            error={errors.phone}
          />
          <div className="md:col-span-2">
            <TextArea
              label="Address"
              placeholder="Your home or shelter address"
              value={profile.address}
              onChange={(address) => { setProfile({ ...profile, address }); setErrors({ ...errors, address: "" }); }}
            />
            {errors.address && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.address}</p>}
            <p className="mt-1 text-[10px] text-slate-400">{profile.address.length}/200 characters</p>
          </div>
        </div>

        <button
          onClick={save}
          className="mt-6 h-12 rounded-xl bg-[#176f5b] px-6 font-bold text-white shadow-lg shadow-[#176f5b]/20 transition-all hover:bg-[#0f5848] hover:shadow-xl active:scale-[0.98]"
        >
          Save Profile
        </button>
      </div>
    </section>
  );
}
