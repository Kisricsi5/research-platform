import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Layout from '../../components/layout/Layout';
import ProjectCard from '../../components/shared/ProjectCard';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

export default function BrowseProjectsPage() {
  const [q, setQ] = useState('');
  const [compensationType, setCompensationType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', q, compensationType, page],
    queryFn: () => projectsApi.list({ q, compensationType: compensationType || undefined, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const clearFilters = () => { setQ(''); setCompensationType(''); setPage(1); };
  const hasFilters = q || compensationType;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Research Projects</h1>
          <p className="text-gray-500 mt-1">Explore open positions and apply to projects that match your skills</p>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              className="input pl-9"
              placeholder="Search projects..."
            />
          </div>
          <select
            value={compensationType}
            onChange={(e) => { setCompensationType(e.target.value); setPage(1); }}
            className="input w-44"
          >
            <option value="">All compensation</option>
            <option value="PAID">Paid</option>
            <option value="STIPEND">Stipend</option>
            <option value="CREDIT">Course Credit</option>
            <option value="UNPAID">Volunteer</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary gap-1 text-red-600 border-red-200 hover:bg-red-50">
              <X className="h-4 w-4" />Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : !data?.data.length ? (
          <EmptyState icon={BookOpen} title="No projects found" description="Try adjusting your search" action={<button onClick={clearFilters} className="btn-secondary">Clear filters</button>} />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{data.meta.total} project{data.meta.total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.data.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(page - 1)} disabled={!data.meta.hasPrevPage} className="btn-secondary">Previous</button>
                <span className="text-sm text-gray-500">Page {data.meta.page} of {data.meta.totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={!data.meta.hasNextPage} className="btn-secondary">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
