import { BadgeCheck } from 'lucide-react';
import { cn } from '../../utils';

/**
 * Trust marker shown next to professors whose university email is confirmed.
 * Only render when verification is actually true — an absent badge is the signal
 * for unverified accounts.
 */
export default function VerifiedBadge({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <BadgeCheck
        aria-label="University email verified"
        role="img"
        className={cn('h-4 w-4 text-primary-600 shrink-0', className)}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-600/15 px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified university email
    </span>
  );
}
