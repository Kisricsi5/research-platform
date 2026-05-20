import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const variants = {
  blue:   'badge-blue',
  green:  'badge-green',
  yellow: 'badge-yellow',
  red:    'badge-red',
  gray:   'badge-gray',
};

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>;
}
