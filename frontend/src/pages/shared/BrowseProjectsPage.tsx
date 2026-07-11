import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, BookOpen, Building2 } from 'lucide-react';
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
  { value: '', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'STIPEND', label: 'Stipend' },
  { value: 'CREDIT', label: 'Course credit' },
  { value: 'UNPAID', label: 'Volunteer' },
];

const HOURS_FILTERS = [
  { value: 0, label: 'Any hours' },
  { value: 5, label: '≤ 5 h/week' },
  { value: 10, label: '≤ 10 h/week' },
  { value: 15, label: '≤ 15 h/week' },
  { value: 20, label: '≤ 20 h/week' },
];

export default function BrowseProjectsPage() {
  usePageTitle('Research Opportunities');
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [compensationType, setCompensationType] = useState('');
  const [year, setYear] = useState('');
  const [maxHours, setMaxHours] = useState(0);
  const [myUniversityOnly, setMyUniversityOnly] = useState(false);
  const [page, setPage] = useState(1);

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

  const clearFilters = () => { setQ(''); setCompensationType(''); setYear(''); setMaxHours(0); setMyUniversityOnly(false); setPage(1); };
  const hasFilters = q || compensationType || year || maxHours || myUniversityOnly;

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
        {/* Search + filter chips */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="input pl-10"
              placeholder="Search by title, topic, or skill…"
              aria-label="Search research opportunities"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Compensation</span>
            {COMPENSATION_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setCompensationType(f.value); setPage(1); }}
                aria-pressed={compensationType === f.value}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ring-1 ring-inset',
                  compensationType === f.value
                    ? 'bg-ink-900 text-white ring-ink-900 shadow-sm'
                    : 'bg-white text-gray-600 ring-gray-300 hover:ring-gray-400 hover:text-gray-900',
                )}
              >
                {f.label}
              </button>
            ))}
            {studentUniversity && (
              <>
                <span className="mx-1 h-4 w-px bg-gray-300" aria-hidden />
                <button
                  onClick={() => { setMyUniversityOnly(!myUniversityOnly); setPage(1); }}
                  aria-pressed={myUniversityOnly}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ring-1 ring-inset',
                    myUniversityOnly
                      ? 'bg-ink-900 text-white ring-ink-900 shadow-sm'
                      : 'bg-white text-gray-600 ring-gray-300 hover:ring-gray-400 hover:text-gray-900',
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  My university only
                </button>
              </>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost btn-sm gap-1 text-gray-500">
                <X className="h-3.5 w-3.5" />Clear all
              </button>
            )}
          </div>

          {/* Year + time commitment */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Your year</span>
            {YEAR_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setYear(year === value ? '' : value); setPage(1); }}
                aria-pressed={year === value}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ring-1 ring-inset',
                  year === value
                    ? 'bg-ink-900 text-white ring-ink-900 shadow-sm'
                    : 'bg-white text-gray-600 ring-gray-300 hover:ring-gray-400 hover:text-gray-900',
                )}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-gray-300" aria-hidden />
            <label htmlFor="maxHours" className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</label>
            <select
              id="maxHours"
              value={maxHours}
              onChange={(e) => { setMaxHours(Number(e.target.value)); setPage(1); }}
              className="input w-auto py-1.5 text-sm"
            >
              {HOURS_FILTERS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
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
    </Layout>
  );
}
