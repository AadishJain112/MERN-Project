import { Link } from 'react-router-dom';

const heroStats = [
  { label: 'Verified certificates', value: '18k+' },
  { label: 'Institutions onboarded', value: '62' },
  { label: 'Avg. approval time', value: '2h 14m' },
];

const features = [
  {
    title: 'Adaptive dashboards',
    description: 'Role-aware layouts surface the exact tasks each persona needs.',
  },
  {
    title: 'Realtime verification',
    description: 'Teachers approve uploads with one tap and notify students instantly.',
  },
  {
    title: 'Insights & timelines',
    description: 'Admins view institution-wide stats and deep dive into cohorts.',
  },
];

const steps = [
  'Students upload achievements with proofs, metadata, and timelines.',
  'Teachers review, annotate, and approve or reject with transparent notes.',
  'Admins audit progress, export transcripts, and broadcast recognitions.',
];

const Landing = () => (
  <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div className="hero-spark" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%)] opacity-60" />
    <div className="relative mx-auto flex max-w-6xl flex-col gap-24 px-4 py-20 md:px-8">
      <header className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="relative space-y-8">
          <p className="accent-pill bg-white/10 text-slate-200">
            <span className="status-dot bg-emerald-400" />
            CD-STAR · Trusted campus operating system
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Elevate every achievement with a <span className="text-cyan-300">next-gen</span>{' '}
            activity cloud.
          </h1>
          <p className="text-lg text-slate-300">
            Replace fragmented spreadsheets with an immersive record system. Students, teachers, and
            admins collaborate in real time with automated approvals and beautiful transcripts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="btn-primary">
              Launch workspace
              <span aria-hidden className="text-xl">
                →
              </span>
            </Link>
            <a href="#features" className="btn-secondary">
              Explore the platform
            </a>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div key={item.label} className="glass-panel px-5 py-4 text-left">
                <p className="text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="floating-badge">Avg. approval SLA → 2 hrs</div>
          <div className="glass-panel chart-grid relative overflow-hidden p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Activity health
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-white">97.2%</h3>
            <p className="text-sm text-slate-300">submission confidence</p>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="space-y-10">
        <div className="flex flex-col gap-4 text-center">
          <p className="accent-pill mx-auto bg-white/10 text-slate-200">Why campuses switch</p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            An immersive UI your community will love
          </h2>
          <p className="text-base text-slate-300 md:text-lg">
            Delightfully responsive layouts, glass surfaces, and purposeful gradients create a
            premium experience while keeping workflows blazing fast.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass-panel h-full p-6">
              <div className="mb-5 h-12 w-12 rounded-2xl bg-white/15 text-2xl text-white">
                <div className="flex h-full items-center justify-center">✦</div>
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default Landing;

