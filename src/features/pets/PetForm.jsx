import { useState } from "react";
import { Field } from "../../components/common/Field";
import { Modal } from "../../components/common/Modal";
import { TextArea } from "../../components/common/TextArea";
import { petSizes } from "../../constants/petOptions";
import { apiRequest } from "../../services/api";
import { Icon } from "../../components/common/Icon";
import { classNames } from "../../utils/classNames";

export function PetForm({ token, onClose, onSaved, initialData }) {
  const [form, setForm] = useState(initialData ? {
    ...initialData,
    age: typeof initialData.age === "object" ? initialData.age : { value: initialData.age || 0, unit: "years" },
    images: (initialData.images || []).join(", "),
    videos: (initialData.videos || []).join(", ")
  } : {
    name: "",
    age: { value: "", unit: "years" },
    breed: "",
    size: "small",
    color: "",
    type: "adoption",
    location: "",
    medicalHistory: "",
    images: "",
    videos: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isValidURL = (urlStr) => {
    try {
      const url = new URL(urlStr);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};
    
    const nameStr = form.name.trim();
    if (!nameStr) newErrors.name = "Name is required";
    else if (nameStr.length < 2 || nameStr.length > 50) newErrors.name = "Name must be 2-50 characters";

    const breedStr = form.breed.trim();
    if (!breedStr) newErrors.breed = "Breed is required";
    else if (breedStr.length > 50) newErrors.breed = "Breed must be max 50 characters";
    else if (!/^[a-zA-Z\s]+$/.test(breedStr)) newErrors.breed = "Breed can only contain letters";

    const locStr = form.location.trim();
    if (!locStr) newErrors.location = "Location is required";
    else if (locStr.length < 2 || locStr.length > 100) newErrors.location = "Location must be 2-100 characters";
    else if (!/^[a-zA-Z\s\-,]+$/.test(locStr)) newErrors.location = "Location must be a valid city name";

    if (form.age.value === "" || isNaN(form.age.value)) {
      newErrors.age = "Valid age is required";
    } else {
      const val = Number(form.age.value);
      if (val < 0) newErrors.age = "Age cannot be negative";
      else if (form.age.unit === "years" && val > 30) newErrors.age = "Max age is 30 years";
      else if (form.age.unit === "months" && val > 360) newErrors.age = "Max age is 360 months";
      else if (form.age.unit === "days" && val > 10950) newErrors.age = "Max age is 10950 days";
    }

    if (!form.type) newErrors.type = "Listing type is required";

    if (form.images.trim()) {
      const parts = form.images.split(",").map(i => i.trim()).filter(Boolean);
      for (const p of parts) {
        if (!isValidURL(p)) {
          newErrors.images = "One or more photo URLs are invalid";
          break;
        }
      }
    }

    if (form.videos.trim()) {
      const parts = form.videos.split(",").map(i => i.trim()).filter(Boolean);
      for (const p of parts) {
        if (!isValidURL(p)) {
          newErrors.videos = "One or more video URLs are invalid";
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const path = initialData ? `/api/pets/${initialData._id}` : "/api/pets";

      await apiRequest(path, {
        token,
        method,
        body: {
          ...form,
          age: {
            value: Number(form.age.value),
            unit: form.age.unit
          },
          images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
          videos: form.videos.split(",").map((item) => item.trim()).filter(Boolean)
        }
      });
      onSaved();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initialData ? "Edit Pet Details" : "New Pet Listing"} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          {errors.submit && (
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
              <Icon name="alert" />
              {errors.submit}
            </div>
          )}
        </div>

        <Field label="Pet name" placeholder="E.g. Buddy" value={form.name} onChange={(name) => setForm({ ...form, name })} error={errors.name} />

        <div className="flex flex-col">
          <span className="mb-2.5 block text-sm font-bold text-slate-700">Age</span>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              placeholder="2"
              className={classNames("h-12 w-full rounded-xl border bg-white px-4 text-slate-900 outline-none transition-premium focus:ring-4 focus:ring-[#176f5b]/5", errors.age ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-[#176f5b]")}
              value={form.age.value}
              onChange={(e) => setForm({ ...form, age: { ...form.age, value: e.target.value } })}
            />
            <select
              className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition-premium focus:border-[#176f5b]"
              value={form.age.unit}
              onChange={(e) => setForm({ ...form, age: { ...form.age, unit: e.target.value } })}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
          {errors.age && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.age}</p>}
        </div>

        <Field label="Breed" placeholder="E.g. Lab Mix" value={form.breed} onChange={(breed) => setForm({ ...form, breed })} error={errors.breed} />

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-2.5 block text-sm font-bold text-slate-700">Listing Type</span>
            <select
              className={classNames("h-12 w-full rounded-xl border bg-white px-4 text-slate-900 transition-premium outline-none focus:ring-4 focus:ring-[#176f5b]/5", errors.type ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-[#176f5b]")}
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="adoption">Adoption</option>
              <option value="foster">Foster</option>
            </select>
            {errors.type && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.type}</p>}
          </label>

          <label className="block">
            <span className="mb-2.5 block text-sm font-bold text-slate-700">Size category</span>
            <select
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 transition-premium outline-none focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5"
              value={form.size}
              onChange={(event) => setForm({ ...form, size: event.target.value })}
            >
              {petSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </label>
        </div>

        <Field label="Main color" placeholder="E.g. Golden" value={form.color} onChange={(color) => setForm({ ...form, color })} />
        <Field label="Current location" placeholder="E.g. Mumbai, MH" value={form.location} onChange={(location) => setForm({ ...form, location })} error={errors.location} />

        <div className="md:col-span-2">
          <TextArea label="Medical history & special needs" placeholder="Any vaccinations, conditions, or dietary requirements..." value={form.medicalHistory} onChange={(medicalHistory) => setForm({ ...form, medicalHistory })} />
        </div>

        <div className="md:col-span-2 space-y-4">
          <Field label="Photo URLs" value={form.images} onChange={(images) => setForm({ ...form, images })} placeholder="https://..., https://..." error={errors.images} />
          <Field label="Video URLs" value={form.videos} onChange={(videos) => setForm({ ...form, videos })} placeholder="https://..., https://..." error={errors.videos} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Tip: Use commas to separate multiple URLs. High-quality photos increase adoption rates.
          </p>
        </div>

        <div className="mt-4 md:col-span-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-14 rounded-xl border-2 border-slate-100 font-bold text-slate-600 transition-premium hover:bg-slate-50 active:scale-[0.98]"
          >
            Discard
          </button>
          <button
            disabled={saving}
            className="flex-[2] h-14 rounded-xl bg-[#176f5b] font-black text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Saving Listing</span>
              </div>
            ) : (
              initialData ? "Update Pet Listing" : "Publish Pet Listing"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
