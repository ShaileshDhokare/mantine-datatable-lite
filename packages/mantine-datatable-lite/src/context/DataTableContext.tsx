import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { TableState } from '../hooks/useTableState';

export const DataTableContext = createContext<TableState | null>(null);

export function useDataTableContext() {
  const context = useContext(DataTableContext);
  if (!context)
    throw new Error('DataTable components must be inside DataTableContext');
  return context;
}

/** Which header popover is open, e.g. `filter:name`. Lives in the header row only. */
export const HeaderPopoverContext = createContext<{
  open: string | null;
  setOpen: Dispatch<SetStateAction<string | null>>;
}>({ open: null, setOpen: () => {} });

export function useHeaderPopover(key: string) {
  const { open, setOpen } = useContext(HeaderPopoverContext);
  return {
    opened: open === key,
    // Closing only clears this popover, never one that opened in the meantime.
    setOpened: (opened: boolean) =>
      setOpen((current) => (opened ? key : current === key ? null : current)),
    closeAll: () => setOpen(null),
  };
}
