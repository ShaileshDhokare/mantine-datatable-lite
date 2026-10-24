import { Alert, Badge, DataList, Drawer, Loader, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { errorMessage, fetchEmployee, type Employee } from './api';
import { formatDate, formatSalary } from './format';

/** Loads one employee by id, showing how row actions can call the API. */
export function EmployeeDrawer({
  employeeId,
  onClose,
}: {
  employeeId: number | null;
  onClose: () => void;
}) {
  const [employee, setEmployee] = useState<Employee>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (employeeId === null) return;
    let current = true;
    setEmployee(undefined);
    setError(undefined);
    fetchEmployee(employeeId)
      .then((result) => current && setEmployee(result))
      .catch((cause: unknown) => current && setError(errorMessage(cause)));
    return () => {
      current = false;
    };
  }, [employeeId]);

  return (
    <Drawer
      opened={employeeId !== null}
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
          <Badge variant='dot' color={employee.isActive ? 'teal' : 'gray'} w='fit-content'>
            {employee.isActive ? 'Active' : 'Inactive'}
          </Badge>
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
