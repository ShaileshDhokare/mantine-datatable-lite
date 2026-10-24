import { ActionIcon, Menu, type MenuItemProps } from '@mantine/core';
import { useState, type ReactNode } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import {
  useDataTableContext,
  useHeaderPopover,
} from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn, MenuOption, SortOrder } from '../../types';
import { columnLabel } from '../../utils/columnLabel';
import { FilterControls } from './FilterControls';
import { SearchControls } from './SearchControls';

const defaultMenuOptions: MenuOption[] = [
  'sort',
  'filter',
  'search',
  'pin',
  'display',
];

const itemProps = { py: 3, px: 6, fz: 'xs' } as const;

function MenuItem({
  children,
  ...props
}: MenuItemProps & { onClick?: () => void; children: ReactNode }) {
  return (
    <Menu.Item {...itemProps} {...props}>
      {children}
    </Menu.Item>
  );
}

function SubTarget({
  children,
  ...props
}: MenuItemProps & {
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Menu.Sub.Target>
      <Menu.Sub.Item {...itemProps} {...props}>
        {children}
      </Menu.Sub.Item>
    </Menu.Sub.Target>
  );
}

export function ColumnMenu<T>({
  column,
  rows,
  serverMode,
  order,
  canHide,
}: {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
  order?: SortOrder;
  canHide: boolean;
}) {
  const options = column.menuOptions ?? defaultMenuOptions;
  const {
    filters,
    columnSearch,
    setSort,
    setColumnHidden,
    pinned,
    pinColumn,
    movePinned,
  } = useDataTableContext();
  const { labels } = useDataTableConfig();
  const { closeAll } = useHeaderPopover(`menu:${column.dataIndex}`);
  const field = column.dataIndex;
  const side = pinned.left.includes(field)
    ? 'left'
    : pinned.right.includes(field)
      ? 'right'
      : null;
  const sideFields = side ? pinned[side] : [];
  const pinIndex = sideFields.indexOf(field);
  const activeFilter = filters.some((filter) => filter.field === field);
  const activeSearch = columnSearch.some((search) => search.field === field);
  const [opened, setOpened] = useState(false);
  const [filterSubOpen, setFilterSubOpen] = useState(false);
  const [searchSubOpen, setSearchSubOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const closeSubs = () => {
    setFilterSubOpen(false);
    setSearchSubOpen(false);
  };

  function renderOption(option: MenuOption) {
    switch (option) {
      case 'sort':
        return column.sortable ? (
          <Menu.Sub key='sort' offset={6}>
            <SubTarget
              onMouseEnter={closeSubs}
              onFocus={closeSubs}
              onClick={closeSubs}
              leftSection={<Icon name='sort' size={14} />}
            >
              {labels.sort}
            </SubTarget>
            <Menu.Sub.Dropdown>
              <MenuItem
                disabled={order === 'asc'}
                onClick={() => setSort(field, 'asc')}
              >
                {labels.sortAsc}
              </MenuItem>
              <MenuItem
                disabled={order === 'desc'}
                onClick={() => setSort(field, 'desc')}
              >
                {labels.sortDesc}
              </MenuItem>
              <MenuItem
                color='red'
                disabled={!order}
                onClick={() => setSort(field, null)}
              >
                {labels.clearSort}
              </MenuItem>
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        ) : (
          <MenuItem
            key='sort'
            disabled
            leftSection={<Icon name='sort' size={14} />}
          >
            {labels.sort}
          </MenuItem>
        );
      case 'filter':
        return column.filterable ? (
          <Menu.Sub
            key='filter'
            offset={6}
            opened={filterSubOpen}
            onChange={(next) => {
              if (next) setFilterSubOpen(true);
            }}
          >
            <SubTarget
              onMouseEnter={() => setSearchSubOpen(false)}
              leftSection={
                <Icon
                  name='filter'
                  size={14}
                  fill={activeFilter ? 'currentColor' : undefined}
                />
              }
            >
              {labels.filter}
            </SubTarget>
            <Menu.Sub.Dropdown p={0}>
              <FilterControls
                key={openCount}
                column={column}
                rows={rows}
                serverMode={serverMode}
                onDone={() => setOpened(false)}
              />
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        ) : (
          <MenuItem
            key='filter'
            disabled
            leftSection={<Icon name='filter' size={14} />}
          >
            {labels.filter}
          </MenuItem>
        );
      case 'search':
        return column.searchable === true ? (
          <Menu.Sub
            key='search'
            offset={6}
            opened={searchSubOpen}
            onChange={(next) => {
              if (next) setSearchSubOpen(true);
            }}
          >
            <SubTarget
              onMouseEnter={() => setFilterSubOpen(false)}
              color={
                activeSearch ? 'var(--mantine-primary-color-filled)' : undefined
              }
              leftSection={<Icon name='search' size={14} />}
            >
              {labels.search}
            </SubTarget>
            <Menu.Sub.Dropdown p={0}>
              <SearchControls
                key={openCount}
                column={column}
                onDone={() => setOpened(false)}
              />
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        ) : (
          <MenuItem
            key='search'
            disabled
            leftSection={<Icon name='search' size={14} />}
          >
            {labels.search}
          </MenuItem>
        );
      case 'pin':
        return column.pinnable !== false ? (
          <Menu.Sub key='pin' offset={6}>
            <SubTarget leftSection={<Icon name='pin' size={14} />}>
              {labels.pin}
            </SubTarget>
            <Menu.Sub.Dropdown>
              <MenuItem
                disabled={side === 'left'}
                leftSection={
                  <Icon
                    name='pin'
                    size={14}
                    style={{ transform: 'rotate(90deg)' }}
                  />
                }
                onClick={() => pinColumn(field, 'left')}
              >
                {labels.pinLeft}
              </MenuItem>
              <MenuItem
                disabled={side === 'right'}
                leftSection={
                  <Icon
                    name='pin'
                    size={14}
                    style={{ transform: 'rotate(-90deg)' }}
                  />
                }
                onClick={() => pinColumn(field, 'right')}
              >
                {labels.pinRight}
              </MenuItem>
              {side && (
                <>
                  <MenuItem
                    disabled={pinIndex === 0}
                    leftSection={<Icon name='prevPage' size={14} />}
                    onClick={() => movePinned(field, -1)}
                  >
                    {labels.moveLeft}
                  </MenuItem>
                  <MenuItem
                    disabled={pinIndex === sideFields.length - 1}
                    leftSection={<Icon name='nextPage' size={14} />}
                    onClick={() => movePinned(field, 1)}
                  >
                    {labels.moveRight}
                  </MenuItem>
                  <MenuItem onClick={() => pinColumn(field, null)}>
                    {labels.unpin}
                  </MenuItem>
                </>
              )}
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        ) : null;
      case 'display':
        return (
          <MenuItem
            key='display'
            disabled={!canHide || column.hideable === false}
            leftSection={<Icon name='hide' size={14} />}
            onClick={() => setColumnHidden(field, true)}
          >
            {labels.hide}
          </MenuItem>
        );
    }
  }

  return (
    <Menu
      position='bottom-end'
      offset={0}
      withinPortal
      opened={opened}
      onChange={(next) => {
        setOpened(next);
        if (next) {
          closeAll();
          setOpenCount((count) => count + 1);
        } else {
          closeSubs();
        }
      }}
    >
      <Menu.Target>
        <ActionIcon
          variant='transparent'
          size='sm'
          color='var(--mantine-color-dimmed)'
          ml='auto'
          aria-label={labels.columnMenu(columnLabel(column))}
        >
          <Icon name='menu' size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>{options.map(renderOption)}</Menu.Dropdown>
    </Menu>
  );
}
