import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await axiosInstance.post('/register', form);
      navigate('/login', { replace: true });
    } catch (requestError) {
      const apiMessage = requestError.response?.data?.message;
      setError(apiMessage ?? 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="surface-card w-full max-w-md p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AuraBicara</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register to start your AI presentation journey.</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label htmlFor="name" className="grid gap-2 text-sm text-slate-700">
            <span>Name</span>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </label>

          <label htmlFor="email" className="grid gap-2 text-sm text-slate-700">
            <span>Email</span>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
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
              minLength={8}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
