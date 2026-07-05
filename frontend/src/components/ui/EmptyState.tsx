import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary-100/60 blur-xl scale-125" aria-hidden />
        <div className="relative rounded-2xl bg-white ring-1 ring-gray-200 shadow-card p-4">
          <Icon className="h-8 w-8 text-primary-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-ink-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
