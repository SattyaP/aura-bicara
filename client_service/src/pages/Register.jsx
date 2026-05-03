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
        <main className="min-h-screen text-slate-800">
            <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
                <section className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10 2xl:p-14">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-8 top-14 h-56 w-56 rounded-full bg-teal-400/35 blur-3xl" />
                        <div className="absolute right-12 top-40 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
                    </div>

                    <div className="relative">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200">AuraBicara</p>
                        <h1 className="mt-4 max-w-lg font-display text-5xl font-bold leading-tight text-white">
                            Build Better Speaking Habits with AI Guidance
                        </h1>
                        <p className="mt-5 max-w-lg text-base text-slate-200">
                            Create your account and start evaluating presentations with structured, professional feedback.
                        </p>
                    </div>

                    <ul className="relative grid gap-3 text-sm text-slate-100">
                        <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Fast onboarding for individual and classroom practice</li>
                        <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Consistent scoring on pace, eye contact, and verbal clarity</li>
                        <li className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">Actionable reports to improve each speaking session</li>
                    </ul>
                </section>

                <section className="flex items-center px-4 py-6 sm:px-8 lg:px-12 2xl:px-20">
                    <div className="w-full space-y-6">
                        <section className="surface-card p-7 sm:p-9 rise-in">
                            <p className="eyebrow-label">New Account</p>
                            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900">Create account</h2>
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
                                        className="input-shell"
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
                                        minLength={8}
                                        className="input-shell"
                                    />
                                </label>

                                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="button-brand w-full"
                                >
                                    {isSubmitting ? 'Creating account...' : 'Register'}
                                </button>
                            </form>

                            <p className="mt-6 text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
                                    Sign in
                                </Link>
                            </p>
                        </section>

                        <p className="text-center text-xs text-slate-500">Secure JWT authentication • Protected evaluation workspace</p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Register;
