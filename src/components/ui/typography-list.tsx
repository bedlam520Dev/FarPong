import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props} />;
}
