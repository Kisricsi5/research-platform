import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, BookOpen, Building2, SlidersHorizontal } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Layout from '../../components/layout/Layout';
import ProjectCard from '../../components/shared/ProjectCard';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import { usePageTitle } from '../../hooks/usePageTitle';
import { YEAR_OPTIONS } from '../../data/suggestions';

const COMPENSATION_FILTERS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'STIPEND', label: 'Stipend' },
  { value: 'CREDIT', label: 'Course credit' },
  { value: 'UNPAID', label: 'Volunteer' },
];

const HOURS_FILTERS = [
  { value: 5, label: '≤ 5 h/week' },
  { value: 10, label: '≤ 10 h/week' },
  { value: 15, label: '≤ 15 h/week' },
  { value: 20, label: '≤ 20 h/week' },
];

const chipClass = (active: boolean) =>
  cn(
    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ring-1 ring-inset',
    active
      ? 'bg-ink-900 text-white ring-ink-900 shadow-sm'
      : 'bg-white text-gray-600 ring-gray-300 hover:ring-gray-400 hover:text-gray-900',
  );

export default function BrowseProjectsPage() {
  usePageTitle('Research Opportunities');
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [compensationType, setCompensationType] = useState('');
  const [year, setYear] = useState('');
  const [maxHours, setMaxHours] = useState(0);
  const [myUniversityOnly, setMyUniversityOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);

  // Close the filter panel with Escape (Handshake/LinkedIn-style slide-over)
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  const studentUniversity =
    user?.role === 'STUDENT' && user.profile && 'university' in user.profile
      ? (user.profile as { university?: string }).university
      : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['projects', q, compensationType, year, maxHours, myUniversityOnly ? studentUniversity : '', page],
    queryFn: () =>
      projectsApi.list({
        q,
        compensationType: compensationType || undefined,
        year: year || undefined,
        maxHours: maxHours || undefined,
        university: myUniversityOnly && studentUniversity ? studentUniversity : undefined,
        page,
        limit: 12,
      }),
    placeholderData: (prev) => prev,
  });

  const clearFilters = () => { setCompensationType(''); setYear(''); setMaxHours(0); setMyUniversityOnly(false); setPage(1); };
  const activeCount = (compensationType ? 1 : 0) + (year ? 1 : 0) + (maxHours ? 1 : 0) + (myUniversityOnly ? 1 : 0);
  const hasFilters = Boolean(q) || activeCount > 0;

  // Human-readable chips for what's currently applied
  const appliedChips: { label: string; clear: () => void }[] = [];
  if (compensationType) {
    appliedChips.push({
      label: COMPENSATION_FILTERS.find((f) => f.value === compensationType)?.label ?? compensationType,
      clear: () => { setCompensationType(''); setPage(1); },
    });
  }
  if (year) {
    appliedChips.push({
      label: YEAR_OPTIONS.find((y) => y.value === year)?.label ?? year,
      clear: () => { setYear(''); setPage(1); },
    });
  }
  if (maxHours) {
    appliedChips.push({ label: `≤ ${maxHours} h/week`, clear: () => { setMaxHours(0); setPage(1); } });
  }
  if (myUniversityOnly) {
    appliedChips.push({ label: 'My university only', clear: () => { setMyUniversityOnly(false); setPage(1); } });
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-eyebrow">Opportunities</p>
          <h1 className="display text-3xl sm:text-4xl mb-3">Research opportunities</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Verified openings from labs and faculty — with skills, time commitment,
            compensation, and deadlines up front.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filters button */}
        <div className="space-y-3 mb-8">
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="input pl-10"
                placeholder="Search by title, topic, or skill…"
                aria-label="Search research opportunities"
              />
            </div>
            <button
              onClick={() => setPanelOpen(true)}
              className={cn('btn-secondary gap-2 shrink-0', activeCount > 0 && 'border-primary-300 bg-primary-50 text-primary-700')}
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary-600 text-white text-xs font-semibold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Applied filter chips */}
          {appliedChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {appliedChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 text-white px-3 py-1 text-sm font-medium hover:bg-ink-700 transition-colors"
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button onClick={clearFilters} className="btn-ghost btn-sm gap-1 text-gray-500">
                Clear all
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : !data?.data.length ? (
          <EmptyState
            icon={BookOpen}
            title={hasFilters ? 'No matches for these filters' : 'No open opportunities right now'}
            description={
              hasFilters
                ? 'Try broadening your search or clearing a filter — new positions are posted throughout the semester.'
                : 'New research positions are posted throughout the semester. Check back soon, or browse researchers directly.'
            }
            action={
              hasFilters
                ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button>
                : <a href="/professors" className="btn-primary">Browse researchers</a>
            }
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5" aria-live="polite">
              <span className="font-semibold text-ink-900">{data.meta.total}</span> open opportunit{data.meta.total !== 1 ? 'ies' : 'y'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.data.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {data.meta.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 mt-12" aria-label="Pagination">
                <button onClick={() => setPage(page - 1)} disabled={!data.meta.hasPrevPage} className="btn-secondary">
                  Previous
                </button>
                <span className="text-sm text-gray-500 tabular-nums">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <button onClick={() => setPage(page + 1)} disabled={!data.meta.hasNextPage} className="btn-secondary">
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Filter slide-over panel */}
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink-950/40 z-40"
            aria-hidden
            onClick={() => setPanelOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-ink-900">Filters</h2>
              <button
                onClick={() => setPanelOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Compensation</h3>
                <div className="flex flex-wrap gap-2">
                  {COMPENSATION_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setCompensationType(compensationType === f.value ? '' : f.value); setPage(1); }}
                      aria-pressed={compensationType === f.value}
                      className={chipClass(compensationType === f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your year</h3>
                <div className="flex flex-wrap gap-2">
                  {YEAR_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setYear(year === value ? '' : value); setPage(1); }}
                      aria-pressed={year === value}
                      className={chipClass(year === value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="helper mt-2">Listings open to any year always stay visible.</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Time commitment</h3>
                <div className="flex flex-wrap gap-2">
                  {HOURS_FILTERS.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => { setMaxHours(maxHours === h.value ? 0 : h.value); setPage(1); }}
                      aria-pressed={maxHours === h.value}
                      className={chipClass(maxHours === h.value)}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
                <p className="helper mt-2">Listings without specified hours always stay visible.</p>
              </section>

              {studentUniversity && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">University</h3>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={myUniversityOnly}
                      onChange={(e) => { setMyUniversityOnly(e.target.checked); setPage(1); }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />My university only</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Only openings from {studentUniversity}</span>
                    </span>
                  </label>
                </section>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={clearFilters} className="btn-secondary flex-1 justify-center" disabled={activeCount === 0}>
                Clear all
              </button>
              <button onClick={() => setPanelOpen(false)} className="btn-primary flex-1 justify-center">
                Show results{data ? ` (${data.meta.total})` : ''}
              </button>
            </div>
          </aside>
        </>
      )}
    </Layout>
  );
}
