import { useMemo, useState, type ReactNode } from 'react';
import { HeaderPopoverContext } from '../../context/DataTableContext';

/** Keeps open/close of header popovers local to the header, so rows do not re-render. */
export function HeaderPopoverScope({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <HeaderPopoverContext.Provider value={value}>
      {children}
    </HeaderPopoverContext.Provider>
  );
}
