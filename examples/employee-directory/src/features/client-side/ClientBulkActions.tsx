import { Button, Group } from '@mantine/core';
import type { Employee } from '../../types/employee';
import { downloadTextFile, employeesToCsv } from '../../utils/csv';
import { formatCount } from '../../utils/format';
import { notifyError, notifySuccess } from '../../utils/notify';

/**
 * Bulk action bar content. In client mode every selected row is in memory
 * (`loadedRows`), so these actions need no API call.
 */
export function ClientBulkActions({ employees }: { employees: Employee[] }) {
  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(employees.map((employee) => employee.email).join(', '));
      notifySuccess(`Copied ${formatCount(employees.length, 'email address', 'email addresses')}.`);
    } catch {
      notifyError('The browser did not allow copying to the clipboard.');
    }
  }

  function exportCsv() {
    downloadTextFile('employees.csv', employeesToCsv(employees));
    notifySuccess(`Exported ${formatCount(employees.length, 'employee')} to employees.csv.`);
  }

  return (
    <Group gap='xs' wrap='nowrap'>
      <Button size='xs' variant='light' onClick={copyEmails}>
        Copy emails
      </Button>
      <Button size='xs' variant='light' onClick={exportCsv}>
        Export CSV
      </Button>
    </Group>
  );
}
