import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Search, FileText, Bell, CheckCircle, ArrowRight,
  FlaskConical, ShieldCheck, Globe2, Sparkles, FolderKanban, BookmarkPlus,
  CalendarClock, UserRound, Clock, MapPin, MailX, Megaphone, Inbox,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageTitle';

/* ---------- Illustrative preview data (marked as sample in UI) ---------- */
const sampleOpportunities = [
  {
    title: 'Machine Learning for Protein Folding',
    lab: 'Computational Biology Lab',
    field: 'Bioinformatics',
    mode: 'Hybrid',
    hours: '10h/week',
    comp: 'Stipend',
    compClass: 'badge-green',
    skills: ['Python', 'PyTorch', 'Biology'],
  },
  {
    title: 'Behavioral Economics Field Study',
    lab: 'Decision Science Group',
    field: 'Economics',
    mode: 'On campus',
    hours: '8h/week',
    comp: 'Course credit',
    compClass: 'badge-blue',
    skills: ['R', 'Statistics', 'Survey design'],
  },
  {
    title: 'Perovskite Solar Cell Characterization',
    lab: 'Advanced Materials Lab',
    field: 'Materials Science',
    mode: 'In lab',
    hours: '12h/week',
    comp: 'Paid',
    compClass: 'badge-green',
    skills: ['Lab experience', 'Data analysis'],
  },
];

const trustSignals = [
  { icon: ShieldCheck, label: 'University-email-verified researchers' },
  { icon: GraduationCap, label: 'Built for universities & labs' },
  { icon: Search, label: 'Field-specific discovery' },
  { icon: FileText, label: 'One-click structured applications' },
  { icon: Globe2, label: 'Growing research network' },
];

const features = [
  { icon: Sparkles, title: 'Smart matching', desc: 'Opportunities surfaced by field, skills, and interests — not keyword luck.' },
  { icon: ShieldCheck, title: 'Verified researchers', desc: 'Researchers can confirm their university email — look for the verified badge on listings and profiles.' },
  { icon: UserRound, title: 'Academic profiles', desc: 'One research profile — CV, GPA, skills — reused across every application.' },
  { icon: FolderKanban, title: 'Application tracking', desc: 'Every application and its status, in one dashboard.' },
  { icon: BookmarkPlus, title: 'Saved opportunities', desc: 'Bookmark labs and projects to revisit when you’re ready.' },
  { icon: CalendarClock, title: 'Deadline visibility', desc: 'Clear deadlines on every listing, so nothing slips by.' },
  { icon: Search, title: 'Field-specific search', desc: 'Filter by department, research area, compensation, and time commitment.' },
  { icon: Bell, title: 'Status notifications', desc: 'Know the moment a lab reviews, shortlists, or responds.' },
];

const painPoints = [
  {
    icon: MailX,
    problem: 'Cold emails disappear.',
    reality: 'Students send dozens of messages into faculty inboxes and rarely hear back — often because there was never an opening to begin with.',
    answer: 'On Labyro, every listing is a real opening with requirements and a deadline. You apply once, in a structured form, and track the response.',
  },
  {
    icon: Megaphone,
    problem: 'Openings never leave the hallway.',
    reality: 'Most research positions are filled through word of mouth, department newsletters, and whoever happened to ask at the right time.',
    answer: 'Posting an opportunity takes minutes and reaches motivated students beyond the usual circle — including those who would never cold-email.',
  },
  {
    icon: Inbox,
    problem: "An inbox isn't an applicant tracker.",
    reality: 'Interest arrives as scattered emails with mismatched attachments, so comparing candidates fairly is nearly impossible.',
    answer: 'Every application arrives in the same structure — CV, skills, availability, cover letter — in one pipeline you can actually review.',
  },
];

export default function LandingPage() {
  // Home keeps the site-default title but needs its own canonical (https://labyro.com/)
  // now that the static one is gone from index.html.
  usePageMeta();
  const { user } = useAuth();

  return (
    <Layout>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle backdrop */}
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f6f8fd_0%,#ffffff_60%)]" />
          <div className="absolute -top-32 right-0 w-[640px] h-[640px] rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute top-40 -left-40 w-[480px] h-[480px] rounded-full bg-emerald-50 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#dbe3f3_1px,transparent_1px)] [background-size:28px_28px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: message */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-primary-50/70 px-4 py-1.5 text-sm text-primary-700 font-medium mb-8">
                <FlaskConical className="h-4 w-4" />
                The research opportunity marketplace
              </div>
              <h1 className="display text-5xl sm:text-6xl leading-[1.05] mb-6">
                Find research that matches your{' '}
                <span className="text-primary-600">ambition.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mb-10">
                Labyro connects students, researchers, and labs through verified
                academic opportunities, structured applications, and smarter discovery.
              </p>

              {user ? (
                <Link
                  to={user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard'}
                  className="btn-primary btn-lg"
                >
                  Go to your dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/projects" className="btn-primary btn-lg">
                    Explore opportunities <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/signup?role=professor" className="btn-secondary btn-lg">
                    Post an opportunity
                  </Link>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-6">
                Free for students and researchers · No credit card required
              </p>
            </div>

            {/* Right: floating product preview (illustrative) */}
            <div aria-hidden className="relative hidden lg:block select-none pointer-events-none">
              {/* Search bar mock */}
              <div className="card p-3.5 flex items-center gap-3 mb-6 shadow-float animate-fade-up">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-400">Machine learning, neuroscience, climate…</span>
              </div>

              {/* Cards */}
              <div className="space-y-5">
                {sampleOpportunities.slice(0, 2).map((o, i) => (
                  <div
                    key={o.title}
                    className={`card p-5 shadow-float ${i === 0 ? 'animate-float-slow mr-10' : 'animate-float-slower ml-10'}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-ink-900 leading-snug">{o.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{o.lab}</p>
                      </div>
                      <span className={o.compClass}>{o.comp}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {o.skills.map((s) => (
                        <span key={s} className="badge-gray">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{o.mode}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{o.hours}</span>
                      <span className="ml-auto text-primary-600 font-medium">View details →</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating status chip */}
              <div className="absolute -bottom-4 right-4 card px-4 py-3 shadow-float flex items-center gap-3 animate-float-slow">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-900">Application reviewed</p>
                  <p className="text-[11px] text-gray-500">Interview requested · just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST ROW ============ */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-gray-600">
                <Icon className="h-4.5 w-4 text-primary-600 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OPPORTUNITY DISCOVERY ============ */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="section-eyebrow">Discovery</p>
            <h2 className="display text-3xl sm:text-4xl mb-4">
              Opportunities you can actually compare.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every listing carries the same structure — field, skills, time commitment,
              compensation, deadline — so deciding where to apply takes minutes, not weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6" aria-label="Example opportunity listings">
            {sampleOpportunities.map((o) => (
              <div key={o.title} className="card card-hover p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-ink">{o.field}</span>
                  <span className={o.compClass}>{o.comp}</span>
                </div>
                <h3 className="font-semibold text-ink-900 text-lg leading-snug mb-1.5">{o.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{o.lab}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {o.skills.map((s) => (
                    <span key={s} className="badge-gray">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{o.mode}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{o.hours}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <p className="text-sm text-gray-500 sm:mr-2">Example listings, for illustration.</p>
            <Link to="/projects" className="btn-primary">
              Browse live opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-eyebrow">How it works</p>
            <h2 className="display text-3xl sm:text-4xl mb-4">Three steps, whichever side you're on.</h2>
            <p className="text-lg text-gray-600">One platform, two workflows — built for how research recruiting actually happens.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Students */}
            <div className="card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary-600 rounded-xl p-2.5 shadow-[0_4px_12px_-2px_rgba(37,99,235,.4)]">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink-900">For students</h3>
              </div>
              <ol className="space-y-7">
                {[
                  { t: 'Create your research profile', d: 'Major, skills, interests, and CV — set up once, reused everywhere.' },
                  { t: 'Discover matching opportunities', d: 'Filter by field, compensation, and time commitment to find your fit.' },
                  { t: 'Apply and track everything', d: 'Structured applications with live status updates — no follow-up emails.' },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-4">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-600/15 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{s.t}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/signup?role=student" className="btn-primary mt-9">
                Sign up as a student <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Researchers */}
            <div className="card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-600 rounded-xl p-2.5 shadow-[0_4px_12px_-2px_rgba(16,185,129,.4)]">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink-900">For researchers & labs</h3>
              </div>
              <ol className="space-y-7">
                {[
                  { t: 'Post an opportunity', d: 'Real requirements: skills, majors, hours per week, paid, credit, or stipend.' },
                  { t: 'Review comparable candidates', d: 'Every applicant arrives with a CV, GPA, skills, and availability attached.' },
                  { t: 'Build your research team', d: 'Shortlist, request interviews, and accept — all in one pipeline.' },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-4">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15 flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{s.t}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                to="/signup?role=professor"
                className="btn mt-9 bg-emerald-700 text-white px-4 py-2 text-sm shadow-[0_1px_2px_rgba(16,185,129,.35)] hover:bg-emerald-800 hover:-translate-y-px active:translate-y-0 focus-visible:ring-emerald-500"
              >
                Post your first opportunity <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="section-eyebrow">Platform</p>
            <h2 className="display text-3xl sm:text-4xl mb-4">Everything the cold email never had.</h2>
            <p className="text-lg text-gray-600">Purpose-built tools for finding, evaluating, and managing research positions.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-hover p-6">
                <div className="h-10 w-10 rounded-xl bg-primary-50 ring-1 ring-primary-600/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-ink-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY IT MATTERS ============ */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="section-eyebrow">Why it matters</p>
            <h2 className="display text-3xl sm:text-4xl mb-4">The way research recruiting works is broken.</h2>
            <p className="text-lg text-gray-600">Labyro replaces the cold-email lottery with structure both sides can trust.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map(({ icon: Icon, problem, reality, answer }) => (
              <div key={problem} className="card p-7 flex flex-col">
                <div className="h-10 w-10 rounded-xl bg-gray-100 ring-1 ring-gray-900/5 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-gray-500" />
                </div>
                <h3 className="font-semibold text-ink-900 text-lg mb-2">{problem}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{reality}</p>
                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-ink-950">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="display text-3xl sm:text-5xl text-white mb-5">
            Start building your research future today.
          </h2>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
            Join the platform connecting ambitious students with the labs doing the work
            that matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects" className="btn-lg bg-white text-ink-900 rounded-xl inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:bg-gray-100 hover:-translate-y-px shadow-[0_4px_16px_-4px_rgba(255,255,255,.3)]">
              Browse opportunities
            </Link>
            <Link to="/signup?role=professor" className="btn-lg bg-primary-600 text-white rounded-xl inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:bg-primary-500 hover:-translate-y-px">
              Post a research opportunity
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
