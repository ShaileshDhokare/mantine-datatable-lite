import {
  Group,
  Pill,
  Popover,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import classes from '../../styles/styles.module.css';
import type { StatePill } from '../../utils/describeState';

export function AppliedChips({
  pills,
  maxChips = 5,
  inactive,
}: {
  pills: StatePill[];
  maxChips?: number;
  inactive?: boolean;
}) {
  const { labels } = useDataTableConfig();
  const limit = Math.max(0, Math.floor(maxChips));
  const renderPill = (pill: StatePill) => (
    <Pill
      key={pill.key}
      size='sm'
      withRemoveButton
      w={'min-content'}
      onRemove={pill.remove}
      removeButtonProps={{
        'aria-label': labels.removePill(pill.label),
        'aria-hidden': false,
        tabIndex: 0,
      }}
      className={classes.pill}
    >
      <Text span fw={500} inherit>
        {pill.fieldLabel}
      </Text>{' '}
      {pill.emphasizeValue ? (
        <>
          %
          <Text span fw={500} inherit>
            {pill.value}
          </Text>
          %
        </>
      ) : (
        pill.value
      )}
    </Pill>
  );
  return (
    <Group gap='xs' wrap='wrap'>
      {pills.slice(0, limit).map(renderPill)}
      {pills.length > limit && (
        <Popover position='bottom-start' withinPortal disabled={inactive}>
          <Popover.Target>
            <UnstyledButton fz='xs' c='dimmed' fw={500}>
              {labels.morePills(pills.length - limit)}
            </UnstyledButton>
          </Popover.Target>
          <Popover.Dropdown p={8}>
            <ScrollArea.Autosize mah={220}>
              <Stack gap='xs'>{pills.slice(limit).map(renderPill)}</Stack>
            </ScrollArea.Autosize>
          </Popover.Dropdown>
        </Popover>
      )}
    </Group>
  );
}
