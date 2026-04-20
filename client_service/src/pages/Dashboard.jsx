import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaInputArea from '../components/MediaInputArea';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const userInitials = useMemo(() => {
        if (!user?.name) {
            return 'AB';
        }

        return user.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, [user?.name]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700">
            <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
                <aside className="flex flex-col border-r border-slate-200 bg-white p-6">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AuraBicara</p>
                        <h1 className="text-2xl font-display font-bold text-slate-900">Presentation Lab</h1>
                        <p className="text-sm text-slate-500">Enterprise AI speech evaluation suite.</p>
                    </div>

                    <nav className="mt-8 grid gap-2 text-sm">
                        <button
                            type="button"
                            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-left font-medium text-indigo-700"
                        >
                            Media Input
                        </button>
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-600"
                        >
                            Presentation History
                        </button>
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-600"
                        >
                            Coaching Insights
                        </button>
                    </nav>

                    <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 font-semibold text-white">
                                {userInitials}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'AuraBicara User'}</p>
                                <p className="text-xs text-slate-500">{user?.email ?? '-'}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="space-y-6 p-5 md:p-8 lg:p-10">
                    <header className="surface-card p-6 md:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phase 3.3</p>
                        <h2 className="mt-2 text-3xl font-display font-bold text-slate-900 md:text-4xl">Presentation Evaluation Dashboard</h2>
                        <p className="mt-3 max-w-3xl text-sm text-slate-500 md:text-base">
                            Record your pitch, run AI analysis in seconds, and track speaking quality with visual metrics.
                        </p>
                    </header>

                    <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                        <MediaInputArea />

                        <div className="space-y-6">
                            <article className="surface-card surface-card-hover p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Session Focus</p>
                                <h3 className="mt-2 text-2xl font-display font-bold text-slate-900">Live Coaching Checklist</h3>
                                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                    <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">Keep speech pace around 120-160 WPM</li>
                                    <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">Maintain strong eye contact to exceed 70%</li>
                                    <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">Reduce filler words for a cleaner narrative</li>
                                </ul>
                            </article>

                            <article className="surface-card surface-card-hover p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">System Status</p>
                                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <span>AI Gateway</span>
                                        <span className="font-semibold text-emerald-600">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <span>Video Capture</span>
                                        <span className="font-semibold text-blue-600">Ready</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                        <span>Evaluation Engine</span>
                                        <span className="font-semibold text-indigo-600">Waiting Session</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
