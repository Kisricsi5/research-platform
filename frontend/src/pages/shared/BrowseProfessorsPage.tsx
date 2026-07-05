import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { professorsApi } from '../../api/professors';
import Layout from '../../components/layout/Layout';
import ProfessorCard from '../../components/shared/ProfessorCard';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { Users } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Biology', 'Chemistry', 'Physics', 'Psychology', 'Mathematics', 'Engineering', 'Medicine', 'Economics', 'Sociology'];
const RESEARCH_AREAS = ['Machine Learning', 'Cell Biology', 'Neuroscience', 'Quantum Computing', 'Climate Science', 'CRISPR', 'NLP', 'Robotics', 'Public Health', 'Data Science'];

export default function BrowseProfessorsPage() {
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['professors', q, department, researchArea, acceptingOnly, page],
    queryFn: () => professorsApi.list({ q, department, researchArea, acceptingStudents: acceptingOnly || undefined, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const clearFilters = () => {
    setQ('');
    setDepartment('');
    setResearchArea('');
    setAcceptingOnly(false);
    setPage(1);
  };

  const hasFilters = q || department || researchArea || acceptingOnly;

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

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="input pl-9"
              placeholder="Search by name, department, research area..."
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn-secondary gap-2 ${filtersOpen ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-600" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary gap-1 text-red-600 border-red-200 hover:bg-red-50">
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        {filtersOpen && (
          <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Department</label>
              <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="input">
                <option value="">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Research Area</label>
              <select value={researchArea} onChange={(e) => { setResearchArea(e.target.value); setPage(1); }} className="input">
                <option value="">All areas</option>
                {RESEARCH_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptingOnly}
                  onChange={(e) => { setAcceptingOnly(e.target.checked); setPage(1); }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Accepting students only</span>
              </label>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <SkeletonGrid />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Users}
            title="No researchers found"
            description="Try broadening your search or clearing a filter — new labs join throughout the semester."
            action={<button onClick={clearFilters} className="btn-secondary">Clear filters</button>}
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
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!data.meta.hasPrevPage}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
