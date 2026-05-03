const gradeThemes = {
  A: {
    label: 'Excellent Delivery',
    toneText: 'text-emerald-700',
    panelBg: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-white',
    panelBorder: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    progress: 'bg-emerald-600',
  },
  B: {
    label: 'Strong Performance',
    toneText: 'text-teal-700',
    panelBg: 'bg-gradient-to-br from-teal-100 via-teal-50 to-white',
    panelBorder: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    progress: 'bg-teal-600',
  },
  C: {
    label: 'Needs Refinement',
    toneText: 'text-amber-700',
    panelBg: 'bg-gradient-to-br from-amber-100 via-amber-50 to-white',
    panelBorder: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    progress: 'bg-amber-600',
  },
  D: {
    label: 'Needs Immediate Practice',
    toneText: 'text-rose-700',
    panelBg: 'bg-gradient-to-br from-rose-100 via-rose-50 to-white',
    panelBorder: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    progress: 'bg-rose-600',
  },
  default: {
    label: 'Pending Evaluation',
    toneText: 'text-slate-700',
    panelBg: 'bg-gradient-to-br from-slate-100 to-slate-50',
    panelBorder: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    progress: 'bg-cyan-700',
  },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function EvaluationResult({ result }) {
  if (!result) {
    return null;
  }

  const rawGrade = String(result.predicted_grade ?? result.grade ?? 'N/A').toUpperCase();
  const grade = ['A', 'B', 'C', 'D'].includes(rawGrade) ? rawGrade : 'N/A';
  const theme = gradeThemes[grade] ?? gradeThemes.default;

  const wpm = safeNumber(result.wpm);
  const eyeContact = clamp(safeNumber(result.eye_contact_percentage), 0, 100);
  const fillerWords = safeNumber(result.filler_word_count);
  const performanceTag = eyeContact >= 70 && fillerWords <= 3 ? 'Confident presence' : 'Keep refining';

  return (
    <section className="surface-card p-6 md:p-7 rise-in rise-in-delay-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow-label">Evaluation Summary</p>
          <h2 className="mt-2 font-display text-3xl text-slate-900 md:text-4xl">AI Performance Snapshot</h2>
        </div>
        <div className="rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-semibold text-orange-700">
          Metrics powered by AuraBicara AI
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className={`md:col-span-2 rounded-3xl border p-5 shadow-sm ${theme.panelBg} ${theme.panelBorder}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600">Final Grade</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>{theme.label}</span>
          </div>

          <div className="mt-3 flex items-end gap-4">
            <p className={`font-display text-7xl leading-none ${theme.toneText}`}>{grade}</p>
            <p className="pb-2 text-sm text-slate-600">Overall speaking quality score</p>
          </div>

          <p className="mt-4 inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
            {performanceTag}
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Words Per Minute</p>
          <p className="mt-3 font-display text-4xl font-bold text-slate-900">{Math.round(wpm)}</p>
          <p className="mt-2 text-xs text-slate-500">Speaking pace indicator</p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Filler Words</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-lg font-semibold text-amber-700">
            {Math.round(fillerWords)}
          </div>
          <p className="mt-3 text-xs text-slate-500">"umm", "eh", and hesitation count</p>
        </article>

        <article className="md:col-span-2 xl:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Eye Contact</p>
              <p className="font-display text-3xl text-slate-900">{eyeContact.toFixed(1)}%</p>
            </div>
            <p className="text-xs text-slate-500">Higher is better for audience engagement</p>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${theme.progress}`}
              style={{ width: `${eyeContact}%` }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}

export default EvaluationResult;
