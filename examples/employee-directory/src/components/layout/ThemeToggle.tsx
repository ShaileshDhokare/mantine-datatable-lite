import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.75}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      {dark ? (
        <>
          <circle cx='12' cy='12' r='4' />
          <path d='M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
        </>
      ) : (
        <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
      )}
    </svg>
  );
}

/** Switches between light and dark mode. Starts from the system setting. */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const dark = useComputedColorScheme('light', { getInitialValueInEffect: true }) === 'dark';

  return (
    <Tooltip label={dark ? 'Light mode' : 'Dark mode'} withArrow>
      <ActionIcon
        variant='default'
        size={36}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setColorScheme(dark ? 'light' : 'dark')}
      >
        <ThemeIcon dark={dark} />
      </ActionIcon>
    </Tooltip>
  );
}
