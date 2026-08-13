import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-navy px-4">
      <div className="flex flex-1 items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-navy-light/40 p-8">
          <h1 className="text-xl font-bold text-white">
            Apply<span className="text-lime">IQ</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Search less. Land more.</p>

          {error && (
            <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-electric px-3 py-2 text-sm font-semibold text-navy hover:bg-electric-light disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            No account?{" "}
            <Link to="/register" className="text-electric-light hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
}
