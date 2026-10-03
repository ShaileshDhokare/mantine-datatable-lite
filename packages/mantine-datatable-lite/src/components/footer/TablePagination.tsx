import {
  Group,
  Pagination as MantinePagination,
  Select,
  Text,
} from '@mantine/core';
import type { SVGProps } from 'react';
import { Icon } from '../../icons/Icon';
import type { Pagination } from '../../types';
import { resolvePagination } from '../../utils/pagination';

const defaultPageSizeOptions = [10, 20, 50, 100];

const NextIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon size={18} {...props} name='nextPage' />
);
const PreviousIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon size={18} {...props} name='prevPage' />
);
const FirstIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon size={18} {...props} name='firstPage' />
);
const LastIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon size={18} {...props} name='lastPage' />
);
const DotsIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon
    size={18}
    {...props}
    name='menu'
    style={{ ...props.style, transform: 'rotate(90deg)' }}
  />
);

export function TablePagination({
  pagination,
  onChange,
}: {
  pagination: Pagination;
  onChange: (page: number, pageSize: number) => void;
}) {
  const { totalItems } = pagination;
  const { pageSize, pageCount, currentPage, from: firstItem, to: lastItem } = resolvePagination(pagination);
  const options =
    pagination.pageSizeOptions === false
      ? null
      : [
          ...new Set([
            ...(pagination.pageSizeOptions ?? defaultPageSizeOptions),
            pageSize,
          ]),
        ].sort((a, b) => a - b);

  return (
    <Group justify='space-between' align='center' gap='md' wrap='wrap' p='xs'>
      <Text size='sm' c='dimmed'>
        Showing {firstItem} - {lastItem} of {totalItems} items
      </Text>
      <Group gap='sm' wrap='wrap' justify='flex-end'>
        <MantinePagination
          total={pageCount}
          value={currentPage}
          onChange={(page) => onChange(page, pageSize)}
          disabled={totalItems === 0}
          withEdges
          getControlProps={(control) => ({ 'aria-label': `${control} page` })}
          nextIcon={NextIcon}
          previousIcon={PreviousIcon}
          firstIcon={FirstIcon}
          lastIcon={LastIcon}
          dotsIcon={DotsIcon}
        />
        {options && (
          <Select
            aria-label='Rows per page'
            size='sm'
            w={120}
            allowDeselect={false}
            checkIconPosition='right'
            rightSection={
              <Icon
                name='nextPage'
                size={16}
                style={{ transform: 'rotate(90deg)' }}
              />
            }
            value={String(pageSize)}
            data={options.map((size) => ({
              value: String(size),
              label: `${size} / page`,
            }))}
            onChange={(value) => {
              if (value) onChange(1, Number(value));
            }}
          />
        )}
      </Group>
    </Group>
  );
}
