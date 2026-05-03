import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaInputArea from '../components/MediaInputArea';
import { useAuth } from '../context/useAuth';

function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }).format(new Date()),
        [],
    );

    const userInitials = user?.name
        ? user.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'AB';

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen text-slate-800">
            <div className="grid min-h-screen xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="border-b border-white/70 bg-white/75 px-4 py-5 backdrop-blur-sm xl:border-b-0 xl:border-r xl:px-6 xl:py-8">
                    <div className="flex items-start justify-between gap-4 xl:block xl:space-y-3">
                        <div>
                            <p className="eyebrow-label">AuraBicara Studio</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Presentation Lab</h1>
                            <p className="mt-2 text-sm text-slate-500">Record, upload, and sharpen delivery with AI coaching in one clean workflow.</p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                            Session Active
                        </div>
                    </div>

                    <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 text-sm xl:grid xl:overflow-visible xl:pb-0">
                        <button
                            type="button"
                            className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-left font-semibold text-teal-800"
                        >
                            Media Workspace
                        </button>
                        <button
                            type="button"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-600"
                        >
                            Session Archive
                        </button>
                        <button
                            type="button"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-600"
                        >
                            Coaching Notes
                        </button>
                    </nav>

                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 xl:mt-10">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 font-semibold text-white">
                                {userInitials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">{user?.name ?? 'AuraBicara User'}</p>
                                <p className="truncate text-xs text-slate-500">{user?.email ?? '-'}</p>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">Signed in on {todayLabel}</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="button-soft mt-4 w-full xl:mt-6"
                    >
                        Logout
                    </button>
                </aside>

                <main className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-80">
                        <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-teal-200/50 blur-3xl" />
                        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-orange-200/35 blur-3xl" />
                        <div className="absolute right-20 top-3/4 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
                    </div>

                    <div className="relative grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] xl:items-start 2xl:p-10">
                        <section className="space-y-6">
                            <header className="surface-card p-6 md:p-8 rise-in">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="eyebrow-label">Phase 3.3 Workspace</p>
                                        <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                                            Evaluate Every Presentation Like a Pro
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
                                            Switch freely between recording and uploading, then generate consistent speaking insights from the same AI pipeline.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Today</p>
                                        <p className="text-sm font-semibold text-slate-800">{todayLabel}</p>
                                    </div>
                                </div>
                            </header>

                            <MediaInputArea />
                        </section>

                        <aside className="space-y-6 xl:sticky xl:top-6">
                            <article className="surface-card surface-card-hover p-6 rise-in rise-in-delay-2">
                                <p className="eyebrow-label">Session Focus</p>
                                <h3 className="mt-2 font-display text-3xl font-bold text-slate-900">Live Coaching Checklist</h3>
                                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                    <li className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Keep speaking pace between 120-160 WPM</li>
                                    <li className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Maintain eye contact above 70% for stronger authority</li>
                                    <li className="rounded-2xl border border-slate-200 bg-white px-3 py-2">Reduce filler words for cleaner delivery</li>
                                </ul>
                            </article>

                            <article className="surface-card surface-card-hover p-6 rise-in rise-in-delay-3">
                                <p className="eyebrow-label">System Health</p>
                                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                        <span>AI Gateway</span>
                                        <span className="font-semibold text-emerald-600">Online</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                        <span>Video Capture</span>
                                        <span className="font-semibold text-teal-700">Ready</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                        <span>Evaluation Queue</span>
                                        <span className="font-semibold text-slate-700">Idle</span>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-3xl border border-orange-200 bg-orange-50/80 p-6 text-sm text-orange-900 shadow-[0_12px_34px_rgba(251,146,60,0.2)]">
                                <p className="eyebrow-label text-orange-700!">Warm-up Tip</p>
                                <p className="mt-2 font-medium leading-relaxed">
                                    Before recording, speak one minute with deliberate pauses. It stabilizes your pace and reduces filler words in the final take.
                                </p>
                            </article>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
