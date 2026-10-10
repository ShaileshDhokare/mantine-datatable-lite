import { columnLabel } from '../../utils/columnLabel';
import { ActionIcon, Menu } from '@mantine/core';
import { useState } from 'react';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn, MenuOption, SortOrder } from '../../types';
import { useDataTableContext } from '../../context/DataTableContext';
import { FilterControls } from './FilterControls';
import { SearchControls } from './SearchControls';

const defaultMenuOptions: MenuOption[] = [
  'sort',
  'filter',
  'search',
  'pin',
  'display',
];

type ColumnMenuProps<T> = {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
  order?: SortOrder;
  setSort: (field: string, order?: SortOrder | null) => void;
  canHide: boolean;
};

export function ColumnMenu<T>({
  column,
  rows,
  serverMode,
  order,
  setSort,
  canHide,
}: ColumnMenuProps<T>) {
  const options = column.menuOptions ?? defaultMenuOptions;
  const {
    filters,
    columnSearch,
    setColumnHidden,
    setOpenFilter,
    setOpenSearch,
    pinned,
    pinColumn,
    movePinned,
  } = useDataTableContext();
  const side = pinned.left.includes(column.dataIndex)
    ? 'left'
    : pinned.right.includes(column.dataIndex)
      ? 'right'
      : null;
  const sideFields = side ? pinned[side] : [];
  const pinIndex = sideFields.indexOf(column.dataIndex);
  const activeFilter = filters.some(
    (filter) => filter.field === column.dataIndex,
  );
  const activeSearch = columnSearch.some(
    (search) => search.searchField === column.dataIndex,
  );
  const [opened, setOpened] = useState(false);
  const [filterSubOpen, setFilterSubOpen] = useState(false);
  const [searchSubOpen, setSearchSubOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  return (
    <Menu
      position='bottom-end'
      offset={0}
      withinPortal
      opened={opened}
      onChange={(next) => {
        setOpened(next);
        if (next) {
          setOpenFilter(null);
          setOpenSearch(null);
          setOpenCount((count) => count + 1);
        } else {
          setFilterSubOpen(false);
          setSearchSubOpen(false);
        }
      }}
    >
      <Menu.Target>
        <ActionIcon
          variant='transparent'
          size='sm'
          color='var(--mantine-color-gray-6)'
          ml='auto'
          aria-label={`${columnLabel(column)} menu`}
        >
          <Icon name='menu' size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option) => {
          if (option === 'filter') {
            return column.filterable ? (
              <Menu.Sub
                key='filter'
                offset={6}
                opened={filterSubOpen}
                onChange={(next) => {
                  if (next) setFilterSubOpen(true);
                }}
              >
                <Menu.Sub.Target>
                  <Menu.Sub.Item
                    py={3}
                    px={6}
                    fz='xs'
                    onMouseEnter={() => setSearchSubOpen(false)}
                    leftSection={
                      <Icon
                        name='filter'
                        size={14}
                        fill={activeFilter ? 'currentColor' : undefined}
                      />
                    }
                  >
                    Filter
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
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
              <Menu.Item
                key='filter'
                disabled
                py={3}
                px={6}
                fz='xs'
                leftSection={<Icon name='filter' size={14} />}
              >
                Filter
              </Menu.Item>
            );
          }
          if (option === 'search') {
            return column.searchable === true ? (
              <Menu.Sub
                key='search'
                offset={6}
                opened={searchSubOpen}
                onChange={(next) => {
                  if (next) setSearchSubOpen(true);
                }}
              >
                <Menu.Sub.Target>
                  <Menu.Sub.Item
                    py={3}
                    px={6}
                    fz='xs'
                    onMouseEnter={() => setFilterSubOpen(false)}
                    color={
                      activeSearch
                        ? 'var(--mantine-primary-color-filled)'
                        : undefined
                    }
                    leftSection={<Icon name='search' size={14} />}
                  >
                    Search
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown p={0}>
                  <SearchControls
                    key={openCount}
                    column={column}
                    onDone={() => setOpened(false)}
                  />
                </Menu.Sub.Dropdown>
              </Menu.Sub>
            ) : (
              <Menu.Item
                key='search'
                disabled
                py={3}
                px={6}
                fz='xs'
                leftSection={<Icon name='search' size={14} />}
              >
                Search
              </Menu.Item>
            );
          }
          if (option === 'display') {
            return (
              <Menu.Item
                key='display'
                py={3}
                px={6}
                fz='xs'
                disabled={!canHide || column.hideable === false}
                leftSection={<Icon name='hide' size={14} />}
                onClick={() => setColumnHidden(column.dataIndex, true)}
              >
                Hide
              </Menu.Item>
            );
          }
          if (option === 'pin') {
            return column.pinnable !== false ? (
              <Menu.Sub key='pin' offset={6}>
                <Menu.Sub.Target>
                  <Menu.Sub.Item
                    py={3}
                    px={6}
                    fz='xs'
                    leftSection={<Icon name='pin' size={14} />}
                  >
                    Pin
                  </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown>
                  <Menu.Item
                    py={3}
                    px={6}
                    fz='xs'
                    disabled={side === 'left'}
                    leftSection={
                      <Icon
                        name='pin'
                        size={14}
                        style={{ transform: 'rotate(90deg)' }}
                      />
                    }
                    onClick={() => pinColumn(column.dataIndex, 'left')}
                  >
                    Pin to left
                  </Menu.Item>
                  <Menu.Item
                    py={3}
                    px={6}
                    fz='xs'
                    disabled={side === 'right'}
                    leftSection={
                      <Icon
                        name='pin'
                        size={14}
                        style={{ transform: 'rotate(-90deg)' }}
                      />
                    }
                    onClick={() => pinColumn(column.dataIndex, 'right')}
                  >
                    Pin to right
                  </Menu.Item>
                  {side && (
                    <>
                      <Menu.Item
                        py={3}
                        px={6}
                        fz='xs'
                        disabled={pinIndex === 0}
                        leftSection={<Icon name='prevPage' size={14} />}
                        onClick={() => movePinned(column.dataIndex, -1)}
                      >
                        Move left
                      </Menu.Item>
                      <Menu.Item
                        py={3}
                        px={6}
                        fz='xs'
                        disabled={pinIndex === sideFields.length - 1}
                        leftSection={<Icon name='nextPage' size={14} />}
                        onClick={() => movePinned(column.dataIndex, 1)}
                      >
                        Move right
                      </Menu.Item>
                      <Menu.Item
                        py={3}
                        px={6}
                        fz='xs'
                        onClick={() => pinColumn(column.dataIndex, null)}
                      >
                        Unpin
                      </Menu.Item>
                    </>
                  )}
                </Menu.Sub.Dropdown>
              </Menu.Sub>
            ) : null;
          }
          if (option !== 'sort') {
            return null;
          }

          return column.sortable ? (
            <Menu.Sub key='sort' offset={6}>
              <Menu.Sub.Target>
                <Menu.Sub.Item
                  onMouseEnter={() => {
                    setFilterSubOpen(false);
                    setSearchSubOpen(false);
                  }}
                  onFocus={() => {
                    setFilterSubOpen(false);
                    setSearchSubOpen(false);
                  }}
                  onClick={() => {
                    setFilterSubOpen(false);
                    setSearchSubOpen(false);
                  }}
                  py={3}
                  px={6}
                  fz='xs'
                  leftSection={<Icon name='sort' size={14} />}
                >
                  Sort
                </Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                <Menu.Item
                  py={3}
                  px={6}
                  fz='xs'
                  disabled={order === 'asc'}
                  onClick={() => setSort(column.dataIndex, 'asc')}
                >
                  Sort Ascending
                </Menu.Item>
                <Menu.Item
                  py={3}
                  px={6}
                  fz='xs'
                  disabled={order === 'desc'}
                  onClick={() => setSort(column.dataIndex, 'desc')}
                >
                  Sort Descending
                </Menu.Item>
                <Menu.Item
                  py={3}
                  px={6}
                  fz='xs'
                  color='red'
                  disabled={!order}
                  onClick={() => setSort(column.dataIndex, null)}
                >
                  Clear Sorting
                </Menu.Item>
              </Menu.Sub.Dropdown>
            </Menu.Sub>
          ) : (
            <Menu.Item
              key='sort'
              disabled
              py={3}
              px={6}
              fz='xs'
              leftSection={<Icon name='sort' size={14} />}
            >
              Sort
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
