import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyLead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xl text-muted-foreground', className)} {...props} />;
}
