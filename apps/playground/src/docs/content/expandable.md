Use `expandable.render` to show additional content below a row. Expansion defaults to one open panel and an icon trigger. Selection and expansion need stable, unique row IDs; `idAccessor` defaults to `id`.

```tsx
<DataTable columns={columns} rows={employees}
  expandable={{
    allowMultiple: true,
    trigger: 'icon',
    render: (row) => (
      <DataList size="sm" orientation="horizontal">
        <DataList.Item>
          <DataList.ItemLabel>Email</DataList.ItemLabel>
          <DataList.ItemValue>{row.email}</DataList.ItemValue>
        </DataList.Item>
      </DataList>
    ),
  }} />
```

Import `DataList` from `@mantine/core`. Use `trigger: 'row'` to expand by clicking the row. For controlled expansion, supply `expandedIds` together with `onChange`. The boolean shorthand `expandable` uses the separate `expandedRowRender` prop.

Detail panels span all visible columns, including selection controls. The expansion button reports its state with `aria-expanded` and points to the corresponding panel.
