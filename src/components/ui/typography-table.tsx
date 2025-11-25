import type { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export function TypographyTable({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('my-6 w-full overflow-y-auto', className)} {...props}>
      <table className="w-full">
        <thead>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right">
              King&apos;s Treasury
            </th>
            <th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right">
              People&apos;s happiness
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Empty
            </td>
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Overflowing
            </td>
          </tr>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Modest
            </td>
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Satisfied
            </td>
          </tr>
          <tr className="m-0 border-t p-0 even:bg-muted">
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Full
            </td>
            <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
              Ecstatic
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
