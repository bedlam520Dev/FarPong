import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyP({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />;
}
