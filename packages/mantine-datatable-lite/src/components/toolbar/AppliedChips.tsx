import {
  Group,
  Pill,
  Popover,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import type { StatePill } from '../../utils/describeState';

export function AppliedChips({
  pills,
  maxChips = 5,
}: {
  pills: StatePill[];
  maxChips?: number;
}) {
  const limit = Math.max(0, Math.floor(maxChips));
  const renderPill = (pill: StatePill) => (
    <Pill
      key={pill.key}
      size='sm'
      withRemoveButton
      w={'min-content'}
      onRemove={pill.remove}
      removeButtonProps={{
        'aria-label': `Remove ${pill.label}`,
        'aria-hidden': false,
        tabIndex: 0,
      }}
      bg='gray.3'
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
        <Popover position='bottom-start' withinPortal>
          <Popover.Target>
            <UnstyledButton fz='xs' c='dimmed' fw={500}>
              +{pills.length - limit} more
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
