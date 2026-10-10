Selection is controlled with `selectedIds` and `onChange`. The header checkbox selects the visible, eligible rows and shows an indeterminate state when only some are selected.

```tsx
const [selectedIds, setSelectedIds] = useState<RowId[]>([]);

<DataTable columns={columns} rows={employees} toolbar
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

Import `useState` from React, `Button` from Mantine and `RowId` from the package. Set `toolbar` to enable the replacement bulk action toolbar when more than one row is selected. Its close action clears the selection.

IDs are retained across page and sort changes; applied filter and search changes clear selection. `loadedRows` contains only selected records present in the current `rows`. The published package supports the include model and visible-page selection; it does not provide inverted selection of every matching remote record.

The live delete action opens a confirmation modal and removes only demo records. Use the source for a complete example of confirming a destructive bulk action.
