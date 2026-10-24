import {
  Group,
  Pagination as MantinePagination,
  Select,
  Text,
} from '@mantine/core';
import type { SVGProps } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { Icon } from '../../icons/Icon';
import { DEFAULT_PAGE_SIZE_OPTIONS, resolvePage } from '../../utils/pagination';

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
  page,
  pageSize: requestedPageSize,
  total,
  pageSizeOptions,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[] | false;
  onChange: (page: number, pageSize: number) => void;
}) {
  const { labels } = useDataTableConfig();
  const { pageSize, pageCount, currentPage, from, to } = resolvePage(
    page,
    requestedPageSize,
    total,
  );
  const options =
    pageSizeOptions === false
      ? null
      : [
          ...new Set([
            ...(pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS),
            pageSize,
          ]),
        ].sort((a, b) => a - b);

  return (
    <Group justify='space-between' align='center' gap='md' wrap='wrap' p='xs'>
      <Text size='sm' c='dimmed'>
        {labels.pageRange({ from, to, total })}
      </Text>
      <Group gap='sm' wrap='wrap' justify='flex-end'>
        <MantinePagination
          total={pageCount}
          value={currentPage}
          onChange={(next) => onChange(next, pageSize)}
          disabled={total === 0}
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
            aria-label={labels.rowsPerPage}
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
              label: labels.pageSize(size),
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
