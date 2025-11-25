import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyBlockquote({ className, ...props }: HTMLAttributes<HTMLQuoteElement>) {
  return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />;
}
