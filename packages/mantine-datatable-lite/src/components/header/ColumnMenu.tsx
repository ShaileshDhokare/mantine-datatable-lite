import { ActionIcon, Menu } from '@mantine/core';
import { Icon } from '../../icons/Icon';
import type { DataTableColumn, MenuOption, SortOrder } from '../../types';

const defaultMenuOptions: MenuOption[] = ['sort', 'filter', 'search', 'pin', 'display'];
const pendingOptions = {
  filter: { label: 'Filter', icon: 'filter' },
  search: { label: 'Search', icon: 'search' },
  pin: { label: 'Pin', icon: 'pin' },
  display: { label: 'Display', icon: 'show' },
} as const;

type ColumnMenuProps<T> = {
  column: DataTableColumn<T>;
  order?: SortOrder;
  setSort: (field: string, order?: SortOrder | null) => void;
};

export function ColumnMenu<T>({ column, order, setSort }: ColumnMenuProps<T>) {
  const options = column.menuOptions ?? defaultMenuOptions;

  return (
    <Menu position='bottom-end' withArrow offset={0} withinPortal>
      <Menu.Target>
        <ActionIcon
          variant='transparent'
          size='sm'
          color='var(--mantine-color-gray-6)'
          ml='auto'
          aria-label={`${String(column.header)} menu`}
        >
          <Icon name='menu' size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((option) => {
          if (option !== 'sort') {
            const { label, icon } = pendingOptions[option];
            return <Menu.Item key={option} disabled py={3} px={6} fz='xs' leftSection={<Icon name={icon} size={14} />}>{label}</Menu.Item>;
          }

          return column.sortable ? (
            <Menu.Sub key='sort'>
              <Menu.Sub.Target>
                <Menu.Sub.Item py={3} px={6} fz='xs' leftSection={<Icon name='sort' size={14} />}>Sort</Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                <Menu.Item py={3} px={6} fz='xs' disabled={order === 'asc'} onClick={() => setSort(column.dataIndex, 'asc')}>Sort Ascending</Menu.Item>
                <Menu.Item py={3} px={6} fz='xs' disabled={order === 'desc'} onClick={() => setSort(column.dataIndex, 'desc')}>Sort Descending</Menu.Item>
                <Menu.Item py={3} px={6} fz='xs' color='red' disabled={!order} onClick={() => setSort(column.dataIndex, null)}>Clear Sorting</Menu.Item>
              </Menu.Sub.Dropdown>
            </Menu.Sub>
          ) : (
            <Menu.Item key='sort' disabled py={3} px={6} fz='xs' leftSection={<Icon name='sort' size={14} />}>Sort</Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
