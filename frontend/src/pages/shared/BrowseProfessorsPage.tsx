import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal, Users } from 'lucide-react';
import { professorsApi } from '../../api/professors';
import Layout from '../../components/layout/Layout';
import ProfessorCard from '../../components/shared/ProfessorCard';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { cn } from '../../utils';
import { usePageTitle } from '../../hooks/usePageTitle';
import { COMMON_RESEARCH_INTERESTS } from '../../data/suggestions';

export default function BrowseProfessorsPage() {
  usePageTitle('Researchers & Labs');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);

  // Close the filter panel with Escape (Handshake/LinkedIn-style slide-over)
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  const { data, isLoading } = useQuery({
    queryKey: ['professors', q, department, researchArea, acceptingOnly, page],
    queryFn: () => professorsApi.list({ q, department, researchArea, acceptingStudents: acceptingOnly || undefined, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const clearFilters = () => { setDepartment(''); setResearchArea(''); setAcceptingOnly(false); setPage(1); };
  const activeCount = (department ? 1 : 0) + (researchArea ? 1 : 0) + (acceptingOnly ? 1 : 0);
  const hasFilters = Boolean(q) || activeCount > 0;

  // Human-readable chips for what's currently applied
  const appliedChips: { label: string; clear: () => void }[] = [];
  if (department) appliedChips.push({ label: department, clear: () => { setDepartment(''); setPage(1); } });
  if (researchArea) appliedChips.push({ label: researchArea, clear: () => { setResearchArea(''); setPage(1); } });
  if (acceptingOnly) appliedChips.push({ label: 'Accepting students only', clear: () => { setAcceptingOnly(false); setPage(1); } });

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="section-eyebrow">Researchers</p>
          <h1 className="display text-3xl sm:text-4xl mb-3">Find researchers & labs</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse faculty and lab profiles by department and research area — and see
            who's currently accepting students.
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
                placeholder="Search by name, department, research area…"
                aria-label="Search researchers"
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

        {/* Results */}
        {isLoading ? (
          <SkeletonGrid />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? 'No researchers match these filters' : 'No researchers yet'}
            description="Try broadening your search or clearing a filter — new labs join throughout the semester."
            action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : undefined}
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5" aria-live="polite">
              <span className="font-semibold text-ink-900">{data.meta.total}</span> researcher{data.meta.total !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.data.map((prof) => (
                <ProfessorCard key={prof.id} professor={prof} />
              ))}
            </div>

            {/* Pagination */}
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
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Department</h3>
                <input
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                  className="input"
                  placeholder="e.g. Computer Science"
                  aria-label="Department"
                />
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Research area</h3>
                <input
                  value={researchArea}
                  onChange={(e) => { setResearchArea(e.target.value); setPage(1); }}
                  list="research-area-suggestions"
                  className="input"
                  placeholder="e.g. Machine Learning"
                  aria-label="Research area"
                />
                <datalist id="research-area-suggestions">
                  {COMMON_RESEARCH_INTERESTS.map((area) => <option key={area} value={area} />)}
                </datalist>
                <p className="helper mt-2">Start typing to see common areas, or enter your own.</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Availability</h3>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => { setAcceptingOnly(e.target.checked); setPage(1); }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">Accepting students only</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Only labs currently open to new students</span>
                  </span>
                </label>
              </section>
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
