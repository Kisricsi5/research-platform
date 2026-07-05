import { Link } from 'react-router-dom';
import { Building2, BookOpen, CheckCircle } from 'lucide-react';
import { ProfessorProfile } from '../../types';
import Avatar from '../ui/Avatar';

interface ProfessorCardProps {
  professor: ProfessorProfile;
}

export default function ProfessorCard({ professor }: ProfessorCardProps) {
  return (
    <div className="card card-hover p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar
          firstName={professor.firstName}
          lastName={professor.lastName}
          src={professor.profilePicture}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {professor.firstName} {professor.lastName}
          </h3>
          <p className="text-sm text-gray-500">{professor.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{professor.department} · {professor.university}</span>
          </div>
        </div>
      </div>

      {/* Research areas */}
      {professor.researchAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {professor.researchAreas.slice(0, 4).map((area) => (
            <span key={area} className="badge-blue">{area}</span>
          ))}
          {professor.researchAreas.length > 4 && (
            <span className="badge-gray">+{professor.researchAreas.length - 4}</span>
          )}
        </div>
      )}

      {/* Bio preview */}
      {professor.bio && (
        <p className="text-sm text-gray-600 line-clamp-2">{professor.bio}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {professor.acceptingStudents ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">Accepting students</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">Not accepting</span>
          )}
        </div>
        {professor._count?.projects !== undefined && professor._count.projects > 0 && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">{professor._count.projects} open project{professor._count.projects !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <Link
        to={`/professors/${professor.id}`}
        className="btn-primary w-full justify-center mt-1"
      >
        View Profile
      </Link>
    </div>
  );
}
