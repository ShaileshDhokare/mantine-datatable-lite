import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';

export function GlobalSearch({
  debounceTime = 300,
}: {
  debounceTime?: number;
}) {
  const { searchQuery, setSearchQuery, resetVersion } = useDataTableContext();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(searchQuery);
  const apply = useDebouncedCallback(
    (value: string) => setSearchQuery(value, true),
    Math.max(0, debounceTime),
  );
  useEffect(() => {
    apply.cancel();
    setDraft(searchQuery);
  }, [searchQuery, resetVersion]);

  return (
    <>
      {expanded ? (
        <TextInput
          autoFocus
          size='sm'
          aria-label='Search all columns'
          placeholder='Search all columns'
          leftSection={<Icon name='search' size={16} />}
          rightSection={
            draft ? (
              <Tooltip label='Clear global search' withArrow>
                <ActionIcon
                  variant='transparent'
                  size='sm'
                  aria-label='Clear global search'
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    apply.cancel();
                    setDraft('');
                    setSearchQuery('', true);
                  }}
                >
                  <Icon name='clear' size={18} />
                </ActionIcon>
              </Tooltip>
            ) : undefined
          }
          value={draft}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft(value);
            apply(value);
          }}
          onBlur={() => {
            if (!draft) setExpanded(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              apply.cancel();
              setDraft('');
              setSearchQuery('', true);
              setExpanded(false);
            }
          }}
        />
      ) : (
        <Tooltip label='Global search' withArrow>
          <ActionIcon
            variant='subtle'
            aria-label='Open global search'
            onClick={() => setExpanded(true)}
            size='lg'
          >
            <Icon
              name='search'
              strokeWidth={1.5}
              size={20}
              color='var(--mantine-color-gray-6)'
            />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
}
