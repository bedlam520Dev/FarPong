import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographySmall({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <small className={cn('text-sm font-medium leading-none', className)} {...props} />;
}
