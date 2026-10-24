import { Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';

type TabIntroProps = {
  /** What the example shows. */
  children: ReactNode;
  /** A live status, such as the number of matching rows. */
  status: ReactNode;
  actions?: ReactNode;
};

/** The line above each example's table. */
export function TabIntro({ children, status, actions }: TabIntroProps) {
  return (
    <Group justify='space-between' align='center' gap='sm'>
      <Text size='sm' maw={760}>
        {children}
      </Text>
      <Group gap='sm' wrap='nowrap'>
        <Text size='sm' c='dimmed' aria-live='polite'>
          {status}
        </Text>
        {actions}
      </Group>
    </Group>
  );
}
