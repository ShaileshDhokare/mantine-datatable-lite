import { Badge } from '@mantine/core';

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant='dot' color={active ? 'teal' : 'gray'} w='fit-content'>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
