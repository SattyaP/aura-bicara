import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/useAuth';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axiosInstance.post('/login', form);
      const token = response.data?.access_token;

      if (!token) {
        setError('Login response did not include access token.');
        return;
      }

      login(token);
      navigate('/', { replace: true });
    } catch (requestError) {
      const apiMessage = requestError.response?.data?.message;
      const apiError = requestError.response?.data?.error;
      setError(apiMessage ?? apiError ?? 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-800">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <section className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10 2xl:p-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-10 top-16 h-52 w-52 rounded-full bg-teal-400/35 blur-3xl" />
            <div className="absolute right-14 top-44 h-64 w-64 rounded-full bg-orange-300/25 blur-3xl" />
          </div>

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200">AuraBicara</p>
            <h1 className="mt-4 max-w-lg font-display text-5xl font-bold leading-tight text-white">
              Professional Presentation Coaching Workspace
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-200">
              Practice with confidence and evaluate speaking quality with production-grade AI analysis.
            </p>
          </div>

          <ul className="relative grid gap-3 text-sm text-slate-100">
            <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Camera recording and upload in one workflow</li>
            <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Live pace, filler words, and eye contact scoring</li>
            <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Fast reports for training and review sessions</li>
          </ul>
        </section>

        <section className="flex items-center px-4 py-6 sm:px-8 lg:px-12 2xl:px-20">
          <div className="w-full space-y-6">
            <section className="surface-card p-7 sm:p-9 rise-in">
              <p className="eyebrow-label">Secure Access</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to continue your speaking performance tracking.</p>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <label htmlFor="email" className="grid gap-2 text-sm text-slate-700">
                  <span>Email</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="input-shell"
                  />
                </label>

                <label htmlFor="password" className="grid gap-2 text-sm text-slate-700">
                  <span>Password</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="input-shell"
                  />
                </label>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button-brand w-full"
                >
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-500">
                Do not have an account?{' '}
                <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
                  Create one
                </Link>
              </p>
            </section>

            <p className="text-center text-xs text-slate-500">Secure JWT authentication • Session protected API access</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
