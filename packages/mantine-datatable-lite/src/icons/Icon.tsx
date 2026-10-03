import type { SVGProps } from 'react';
import type { IconName } from '../types';
import React from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  name: IconName;
  size?: number;
  fill?: string;
  color?: string;
};

const iconPaths: Partial<Record<IconName, string[]>> = {
  sort: ['m21 16-4 4-4-4', 'M17 20V4', 'm3 8 4-4 4 4', 'M7 4v16'],
  sortAsc: ['m3 8 4-4 4 4', 'M7 4v16', 'M11 12h4', 'M11 16h7', 'M11 20h10'],
  sortDesc: ['m3 16 4 4 4-4', 'M7 20V4', 'M11 4h10', 'M11 8h7', 'M11 12h4'],
  filter: [
    'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
  ],
  delete: [
    'M10 11v6',
    'M14 11v6',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
    'M3 6h18',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  ],
  clear: ['M18 6 6 18', 'm6 6 12 12'],
  nextPage: ['m9 18 6-6-6-6'],
  prevPage: ['m15 18-6-6 6-6'],
  firstPage: ['m11 17-5-5 5-5', 'm18 17-5-5 5-5'],
  lastPage: ['m6 17 5-5-5-5', 'm13 17 5-5-5-5'],
  pin: [
    'M12 17v5',
    'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
  ],
  hide: [
    'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
    'M14.084 14.158a3 3 0 0 1-4.242-4.242',
    'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
    'm2 2 20 20',
  ],
};

const additionalIconPaths: Partial<Record<IconName, React.JSX.Element[]>> = {
  search: [<path d='m21 21-4.34-4.34' />, <circle cx='11' cy='11' r='8' />],
  show: [
    <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' />,
    <circle cx='12' cy='12' r='3' />,
  ],
  collapse: [
    <rect width='18' height='18' x='3' y='3' rx='2' />,
    <path d='M8 12h8' />,
  ],
  expand: [
    <rect width='18' height='18' x='3' y='3' rx='2' />,
    <path d='M8 12h8' />,
    <path d='M12 8v8' />,
  ],
  menu: [
    <circle cx='12' cy='12' r='1' />,
    <circle cx='12' cy='5' r='1' />,
    <circle cx='12' cy='19' r='1' />,
  ],
  empty: [
    <polyline points='22 12 16 12 14 15 10 15 8 12 2 12' />,
    <path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />,
  ],
};

const Icon = ({
  name,
  size = 24,
  strokeWidth = 2,
  fill = 'none',
  color = 'currentColor',
  ...props
}: IconProps) => {
  const icon = iconPaths[name];

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      {icon
        ? icon.map((path, index) => <path key={index} d={path} />)
        : additionalIconPaths[name]?.map((element, index) =>
            React.cloneElement(element, { key: index }),
          )}
    </svg>
  );
};

export { Icon };
