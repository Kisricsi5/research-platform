import { Link } from 'react-router-dom';
import { Clock, Calendar, DollarSign, Building2 } from 'lucide-react';
import { ResearchProject } from '../../types';
import { compensationLabels, compensationColors, formatDate } from '../../utils';
import Avatar from '../ui/Avatar';
import VerifiedBadge from './VerifiedBadge';

interface ProjectCardProps {
  project: ResearchProject;
  showApply?: boolean;
}

export default function ProjectCard({ project, showApply = true }: ProjectCardProps) {
  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      {/* Professor info */}
      {project.professor && (
        <div className="flex items-center gap-2">
          <Avatar
            firstName={project.professor.firstName}
            lastName={project.professor.lastName}
            src={project.professor.profilePicture}
            size="sm"
          />
          <div>
            <Link
              to={`/professors/${project.professor.id}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600 inline-flex items-center gap-1"
            >
              {project.professor.firstName} {project.professor.lastName}
              {project.professor.user?.emailVerified && <VerifiedBadge compact className="h-3.5 w-3.5" />}
            </Link>
            <p className="text-xs text-gray-500">{project.professor.department}</p>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <Link to={`/projects/${project.id}`} className="font-semibold text-gray-900 hover:text-primary-600 leading-snug">
          {project.title}
        </Link>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
      </div>

      {/* Skills */}
      {(project.requiredSkills.length > 0 || project.openToOtherUniversities === false) && (
        <div className="flex flex-wrap gap-1.5">
          {project.openToOtherUniversities === false && (
            <span className="badge-ink"><Building2 className="h-3 w-3" />Same university only</span>
          )}
          {project.requiredSkills.slice(0, 4).map((s) => (
            <span key={s} className="badge-gray">{s}</span>
          ))}
          {project.requiredSkills.length > 4 && (
            <span className="badge-gray">+{project.requiredSkills.length - 4}</span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {project.hoursPerWeek && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {project.hoursPerWeek}h/week
          </span>
        )}
        {project.applicationDeadline && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Due {formatDate(project.applicationDeadline)}
          </span>
        )}
        <span className={`flex items-center gap-1 ${compensationColors[project.compensationType]}`}>
          <DollarSign className="h-3.5 w-3.5" />
          {compensationLabels[project.compensationType]}
        </span>
      </div>

      {showApply && (
        <Link
          to={`/projects/${project.id}`}
          className="btn-primary w-full justify-center mt-1"
        >
          View & Apply
        </Link>
      )}
    </div>
  );
}
