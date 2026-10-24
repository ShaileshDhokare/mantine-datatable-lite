Add `selection` to show row checkboxes. The header checkbox selects the visible, eligible rows and shows an indeterminate state when only some are selected.

```tsx
const [selectedIds, setSelectedIds] = useState<RowId[]>([]);

<DataTable columns={columns} rows={employees}
  selection={{
    selectedIds,
    onChange: ({ ids }) => setSelectedIds(ids),
    isSelectable: (row) => row.isActive,
    renderBulkActions: ({ ids, clear }) => (
      <Button onClick={() => { console.log(ids); clear(); }}>
        Log selected IDs
      </Button>
    ),
  }} />
```

Import `useState` from React, `Button` from Mantine and `RowId` from the package. `selectedIds` is optional: omit it and the table keeps the selection itself while still calling `onChange`.

`renderBulkActions` adds a bulk action bar that replaces the toolbar while at least one row is selected. Its close action clears the selection.

IDs are retained across page and sort changes; applied filter and search changes clear selection. `loadedRows` contains only selected records present in the current `rows`. The package selects visible pages; it does not provide inverted selection of every matching remote record.

The live delete action opens a confirmation modal and removes only demo records. Use the source for a complete example of confirming a destructive bulk action.
