import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyLarge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-lg font-semibold', className)} {...props} />;
}
