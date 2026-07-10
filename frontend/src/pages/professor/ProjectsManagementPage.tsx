import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsApi } from '../../api/projects';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { compensationLabels, formatDate } from '../../utils';
import { useState } from 'react';
import Modal from '../../components/ui/Modal';

export default function ProjectsManagementPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: projectsApi.getMine,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Project deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Link to="/professor/projects/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />Post New
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No projects yet"
          description="Post your first research opportunity to start receiving applications from students."
          action={<Link to="/professor/projects/new" className="btn-primary">Post First Project</Link>}
        />
      ) : (
        <div className="space-y-3">
          {(projects as any[]).map((p) => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{p.title}</h3>
                  {p.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Closed</span>}
                  {p.isFilled && <span className="badge-yellow">Filled</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{compensationLabels[p.compensationType as keyof typeof compensationLabels]}</span>
                  {p.hoursPerWeek && <span>{p.hoursPerWeek}h/week</span>}
                  {p.applicationDeadline && <span>Deadline: {formatDate(p.applicationDeadline)}</span>}
                  <span className="text-primary-600 font-medium">{p._count?.applications ?? 0} application{p._count?.applications !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/professor/applications?project=${p.id}`} className="btn-secondary btn-sm">
                  View Applications
                </Link>
                <Link to={`/professor/projects/${p.id}/edit`} className="btn-secondary btn-sm gap-1">
                  <Edit className="h-3.5 w-3.5" />Edit
                </Link>
                <button onClick={() => setDeleteId(p.id)} className="btn-secondary btn-sm gap-1 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project" size="sm">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this project? This cannot be undone. Applications you've already received are kept and will show as general applications to your lab.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="btn-danger flex-1">
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
