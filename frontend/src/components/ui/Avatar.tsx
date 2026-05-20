import { getInitials, getAvatarUrl, cn } from '../../utils';

interface AvatarProps {
  firstName: string;
  lastName: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ firstName, lastName, src, size = 'md', className }: AvatarProps) {
  const url = getAvatarUrl(src);

  if (url) {
    return (
      <img
        src={url}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover ring-2 ring-white', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center ring-2 ring-white flex-shrink-0',
        sizes[size],
        className,
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
