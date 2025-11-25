import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyH4({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props} />
  );
}
