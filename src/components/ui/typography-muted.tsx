import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyMuted({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
