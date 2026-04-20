const gradeThemes = {
  A: {
    label: 'Excellent Delivery',
    border: 'border-emerald-300',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
  },
  B: {
    label: 'Strong Performance',
    border: 'border-blue-300',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-50',
  },
  C: {
    label: 'Needs Refinement',
    border: 'border-amber-300',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-50',
  },
  D: {
    label: 'Needs Immediate Practice',
    border: 'border-rose-300',
    accentText: 'text-rose-700',
    accentBg: 'bg-rose-50',
  },
  default: {
    label: 'Pending Evaluation',
    border: 'border-slate-300',
    accentText: 'text-slate-700',
    accentBg: 'bg-slate-100',
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

  return (
    <section className="surface-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Evaluation Summary</p>
          <h2 className="mt-2 font-display text-2xl text-slate-900 md:text-3xl">AI Performance Snapshot</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs text-slate-500">
          Metrics powered by AuraBicara AI
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className={`md:col-span-2 rounded-2xl border-l-4 border border-slate-200 p-5 ${theme.border} ${theme.accentBg}`}>
          <p className="text-sm font-medium text-slate-600">Final Grade</p>
          <div className="mt-2 flex items-end gap-4">
            <p className={`font-display text-7xl leading-none ${theme.accentText}`}>{grade}</p>
            <p className="pb-2 text-sm text-slate-600">{theme.label}</p>
          </div>
        </article>

        <article className="surface-card rounded-2xl p-5">
          <p className="text-sm text-slate-500">Words Per Minute</p>
          <p className="mt-3 font-display text-4xl font-bold text-slate-900">{Math.round(wpm)}</p>
          <p className="mt-2 text-xs text-slate-500">Speaking pace indicator</p>
        </article>

        <article className="surface-card rounded-2xl p-5">
          <p className="text-sm text-slate-500">Filler Words</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-lg font-semibold text-amber-700">
            {Math.round(fillerWords)}
          </div>
          <p className="mt-3 text-xs text-slate-500">"umm", "eh", and hesitation count</p>
        </article>

        <article className="surface-card md:col-span-2 xl:col-span-4 rounded-2xl p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Eye Contact</p>
              <p className="font-display text-3xl text-slate-900">{eyeContact.toFixed(1)}%</p>
            </div>
            <p className="text-xs text-slate-500">Higher is better for audience engagement</p>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${eyeContact}%` }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}

export default EvaluationResult;
