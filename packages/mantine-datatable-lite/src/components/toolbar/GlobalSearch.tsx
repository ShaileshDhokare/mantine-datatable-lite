import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';

export function GlobalSearch({
  debounceTime = 300,
}: {
  debounceTime?: number;
}) {
  const { searchQuery, setSearchQuery, resetVersion } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const [expanded, setExpanded] = useState(false);
  // The draft belongs to the applied query it was typed against; an outside change
  // (reset, pill removal) replaces it.
  const source = `${resetVersion}:${searchQuery}`;
  const [draft, setDraft] = useState({ text: searchQuery, source });
  const text = draft.source === source ? draft.text : searchQuery;
  const apply = useDebouncedCallback((value: string) => {
    // Keep the typed text (e.g. a trailing space) after its own query applies.
    setDraft({ text: value, source: `${resetVersion}:${value.trim()}` });
    setSearchQuery(value);
  }, Math.max(0, debounceTime));
  // Drop typing that is still waiting when the applied query changes elsewhere.
  useEffect(() => apply.cancel(), [apply, source]);

  function clear() {
    apply.cancel();
    setDraft({ text: '', source });
    setSearchQuery('');
  }

  return expanded ? (
    <TextInput
      autoFocus
      size='sm'
      aria-label={labels.globalSearch}
      placeholder={labels.globalSearch}
      leftSection={<Icon name='search' size={16} />}
      rightSection={
        text ? (
          <Tooltip label={labels.clearGlobalSearch} withArrow>
            <ActionIcon
              variant='transparent'
              size='sm'
              aria-label={labels.clearGlobalSearch}
              onMouseDown={(event) => event.preventDefault()}
              onClick={clear}
            >
              <Icon name='clear' size={18} />
            </ActionIcon>
          </Tooltip>
        ) : undefined
      }
      value={text}
      onChange={(event) => {
        const value = event.currentTarget.value;
        setDraft({ text: value, source });
        apply(value);
      }}
      onBlur={() => {
        if (!text) setExpanded(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          clear();
          setExpanded(false);
        }
      }}
    />
  ) : (
    <Tooltip label={labels.globalSearch} withArrow>
      <ActionIcon
        variant='subtle'
        aria-label={labels.openGlobalSearch}
        onClick={() => setExpanded(true)}
        size='lg'
      >
        <Icon
          name='search'
          strokeWidth={1.5}
          size={20}
          color='var(--mantine-color-dimmed)'
        />
      </ActionIcon>
    </Tooltip>
  );
}
