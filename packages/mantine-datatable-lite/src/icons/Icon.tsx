import { createElement, type SVGProps } from 'react';
import type { IconName } from '../types';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  name: IconName;
  size?: number;
  fill?: string;
  color?: string;
};

type IconNode = [
  tag: 'path' | 'circle' | 'rect' | 'polyline',
  attributes: Record<string, string>,
];

const path = (d: string): IconNode => ['path', { d }];

const icons: Record<IconName, IconNode[]> = {
  sort: [
    path('m21 16-4 4-4-4'),
    path('M17 20V4'),
    path('m3 8 4-4 4 4'),
    path('M7 4v16'),
  ],
  sortAsc: [
    path('m3 8 4-4 4 4'),
    path('M7 4v16'),
    path('M11 12h4'),
    path('M11 16h7'),
    path('M11 20h10'),
  ],
  sortDesc: [
    path('m3 16 4 4 4-4'),
    path('M7 20V4'),
    path('M11 4h10'),
    path('M11 8h7'),
    path('M11 12h4'),
  ],
  filter: [
    path(
      'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
    ),
  ],
  search: [
    path('m21 21-4.34-4.34'),
    ['circle', { cx: '11', cy: '11', r: '8' }],
  ],
  clear: [path('M18 6 6 18'), path('m6 6 12 12')],
  delete: [
    path('M10 11v6'),
    path('M14 11v6'),
    path('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'),
    path('M3 6h18'),
    path('M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'),
  ],
  nextPage: [path('m9 18 6-6-6-6')],
  prevPage: [path('m15 18-6-6 6-6')],
  firstPage: [path('m11 17-5-5 5-5'), path('m18 17-5-5 5-5')],
  lastPage: [path('m6 17 5-5-5-5'), path('m13 17 5-5-5-5')],
  pin: [
    path('M12 17v5'),
    path(
      'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
    ),
  ],
  show: [
    path(
      'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
    ),
    ['circle', { cx: '12', cy: '12', r: '3' }],
  ],
  hide: [
    path(
      'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
    ),
    path('M14.084 14.158a3 3 0 0 1-4.242-4.242'),
    path(
      'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
    ),
    path('m2 2 20 20'),
  ],
  collapse: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    path('M8 12h8'),
  ],
  expand: [
    ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }],
    path('M8 12h8'),
    path('M12 8v8'),
  ],
  menu: [
    ['circle', { cx: '12', cy: '12', r: '1' }],
    ['circle', { cx: '12', cy: '5', r: '1' }],
    ['circle', { cx: '12', cy: '19', r: '1' }],
  ],
  empty: [
    ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }],
    path(
      'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    ),
  ],
  error: [
    path(
      'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    ),
    path('M12 9v4'),
    path('M12 17h.01'),
  ],
};

/** Inline SVG icon. Decorative by default; pass `aria-hidden={false}` and a title to expose it. */
export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  fill = 'none',
  color = 'currentColor',
  ...props
}: IconProps) {
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
      aria-hidden
      focusable='false'
      {...props}
    >
      {icons[name].map(([tag, attributes], index) =>
        createElement(tag, { key: index, ...attributes }),
      )}
    </svg>
  );
}
