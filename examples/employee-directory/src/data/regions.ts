// Office regions. The client-side table filters its City column by region with
// a custom `filterFn`.

export const REGIONS = ['Africa', 'Americas', 'Asia-Pacific', 'Europe'] as const;
export type Region = (typeof REGIONS)[number];

export const CITY_REGIONS: Record<string, Region> = {
  Nairobi: 'Africa',
  Austin: 'Americas',
  'São Paulo': 'Americas',
  Toronto: 'Americas',
  Pune: 'Asia-Pacific',
  Singapore: 'Asia-Pacific',
  Sydney: 'Asia-Pacific',
  Tokyo: 'Asia-Pacific',
  Berlin: 'Europe',
  Lisbon: 'Europe',
  London: 'Europe',
  Stockholm: 'Europe',
};

export const regionOf = (city: string): Region | undefined => CITY_REGIONS[city];
