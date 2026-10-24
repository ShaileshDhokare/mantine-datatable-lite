import { Code, Paper, Spoiler, Text } from '@mantine/core';
import type { TableChange } from 'mantine-datatable-lite';

type TableStatePreviewProps = {
  title: string;
  description?: string;
  /** The latest object from the table's `onChange`. */
  change: TableChange | null;
  placeholder: string;
};

/** Shows the latest TableChange as JSON. */
export function TableStatePreview({
  title,
  description,
  change,
  placeholder,
}: TableStatePreviewProps) {
  return (
    <Paper withBorder p='md' radius='sm'>
      <Text fw={600} size='sm'>
        {title}
      </Text>
      {description && (
        <Text size='sm' c='dimmed'>
          {description}
        </Text>
      )}
      <Spoiler maxHeight={120} showLabel='Show all' hideLabel='Hide' mt='xs'>
        <Code block>{change ? JSON.stringify(change, null, 2) : placeholder}</Code>
      </Spoiler>
    </Paper>
  );
}
