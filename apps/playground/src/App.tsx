import { Container, Title } from '@mantine/core';
import {
  DataTable,
  type DataTableColumn,
} from '@scope/mantine-datatable-lite';

type User = { id: number; name: string };
const columns: DataTableColumn<User>[] = [
  { dataIndex: 'id', header: 'ID' },
  { dataIndex: 'name', header: 'Name' },
];
const users: User[] = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Grace' },
];

export function App() {
  return (
    <Container py="xl">
      <Title order={1} mb="md">DataTable playground</Title>
      <DataTable columns={columns} records={users} />
    </Container>
  );
}
