import { Alert, DataList, Drawer, Loader, Stack, Text } from '@mantine/core';
import type { Employee } from '../../types/employee';
import { formatDate, formatSalary } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

type EmployeeDrawerProps = {
  opened: boolean;
  /** Leave out while the employee loads. */
  employee?: Employee;
  error?: string;
  onClose: () => void;
};

/** One employee's profile in a side drawer. */
export function EmployeeDrawer({ opened, employee, error, onClose }: EmployeeDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position='right'
      title={<Text fw={600}>{employee?.name ?? 'Employee'}</Text>}
    >
      {error ? (
        <Alert color='red'>{error}</Alert>
      ) : !employee ? (
        <Loader size='sm' />
      ) : (
        <Stack>
          <StatusBadge active={employee.isActive} />
          <DataList orientation='horizontal'>
            {[
              ['Employee ID', employee.id],
              ['Email', employee.email],
              ['Department', employee.department],
              ['Role', employee.role],
              ['City', employee.city],
              ['Salary', formatSalary(employee.salary)],
              ['Joined', formatDate(employee.joinDate)],
            ].map(([label, value]) => (
              <DataList.Item key={label}>
                <DataList.ItemLabel>{label}</DataList.ItemLabel>
                <DataList.ItemValue>{value}</DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList>
        </Stack>
      )}
    </Drawer>
  );
}
