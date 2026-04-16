import { useState } from "react";
import { useDispatch } from "react-redux";
import { Field } from "../../components/common/Field";
import { Icon } from "../../components/common/Icon";
import { apiRequest } from "../../services/api";
import { setCredentials } from "./authSlice";
import { setNotice } from "../ui/uiSlice";
import { classNames } from "../../utils/classNames";

export function AuthScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "adopter" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (mode === "register" && !form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "register") {
        await apiRequest("/api/auth/register", { method: "POST", body: form });
        dispatch(setNotice("Account created. Sign in to continue."));
        setMode("login");
      } else {
        const data = await apiRequest("/api/auth/login", { method: "POST", body: form });
        dispatch(setCredentials({ token: data.token, user: data.user }));
        dispatch(setNotice("Signed in."));
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[1.2fr_0.8fr]">
      <section className="relative min-h-[40vh] overflow-hidden lg:min-h-screen">
        <img
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] hover:scale-110"
          src="https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1600&q=80"
          alt="Person meeting an adoptable pet"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#172033] via-[#172033]/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-8 sm:p-12 lg:p-20">
          <div className="max-w-2xl rounded-2xl bg-white/5 p-6 backdrop-blur-md lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#91e0c7]">Shelters · Adopters · Fosters</p>
            <h1 className="mt-4 text-5xl font-black leading-tight text-white sm:text-7xl">Adoptly</h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-200">
              Transforming how pets find homes. A unified workspace for modern shelters and compassionate families.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:py-20">
        <div className="w-full max-w-md">
          <form onSubmit={submit} className="transition-premium">
            {errors.submit && (
              <div className="mb-8 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
                <Icon name="alert" />
                {errors.submit}
              </div>
            )}

            <div className="mb-10 inline-flex w-full rounded-xl border border-slate-100 bg-slate-50/50 p-1.5 backdrop-blur-sm">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setMode(item); setErrors({}); }}
                  className={classNames(
                    "flex-1 rounded-lg py-2.5 text-sm font-bold capitalize transition-all",
                    mode === item ? "bg-white text-[#176f5b] shadow-md shadow-slate-200/50" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">
                {mode === "login" ? "Welcome back" : "Get started"}
              </h2>
              <p className="mt-2 text-slate-500 font-medium">Join our community of pet lovers today.</p>
            </div>

            <div className="space-y-5">
              {mode === "register" ? (
                <>
                  <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} error={errors.name} />
                  <label className="block">
                    <span className="mb-2.5 block text-sm font-bold text-slate-700">Join as</span>
                    <select
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 transition-all focus:border-[#176f5b] focus:ring-4 focus:ring-[#176f5b]/5 outline-none"
                      value={form.role}
                      onChange={(event) => setForm({ ...form, role: event.target.value })}
                    >
                      <option value="adopter">Adopter</option>
                      <option value="shelter">Shelter</option>
                      <option value="foster">Foster parent</option>
                    </select>
                  </label>
                </>
              ) : null}
              <Field label="Email address" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} error={errors.email} />
              <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} error={errors.password} />
            </div>

            <button
              className="mt-10 h-14 w-full rounded-xl bg-[#176f5b] text-lg font-bold text-white shadow-lg shadow-[#176f5b]/20 transition-all hover:bg-[#0f5848] hover:shadow-xl hover:shadow-[#176f5b]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Processing</span>
                </div>
              ) : (
                mode === "login" ? "Sign in" : "Create account"
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
