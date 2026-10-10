import { useEffect, useState, type ReactNode } from 'react';
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Burger,
  Button,
  AppShell,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, NavLink as RouterLink, useLocation } from 'react-router';
import { allPages, navigation, npmUrl, repository } from '../docs/navigation';
import { version } from '../docs/generated/api.json';
import classes from '../App.module.css';

export type TocItem = { id: string; label: string };
export function DocsLayout({
  title,
  description,
  toc,
  children,
  scenarios = [],
  active,
}: {
  title: string;
  description: string;
  toc: TocItem[];
  children: ReactNode;
  scenarios?: readonly { id: string; label: string }[];
  active?: string;
}) {
  const [opened, { toggle, close }] = useDisclosure();
  const [currentHeading, setCurrentHeading] = useState(toc[0]?.id);
  const scheme = useComputedColorScheme('light');
  const { toggleColorScheme } = useMantineColorScheme();
  const location = useLocation();
  const page = location.pathname.slice(1);
  const tocSignature = toc.map((item) => item.id).join('|');
  useEffect(() => {
    document.title =
      title === 'Mantine DataTable Lite'
        ? `${title} — Documentation`
        : `${title} | Mantine DataTable Lite`;
    window.scrollTo({ top: 0 });
  }, [title, location.pathname, location.search]);
  useEffect(() => {
    const ids = tocSignature.split('|');
    setCurrentHeading(ids[0]);
    const update = () => {
      const visible = ids.filter(
        (id) =>
          (document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity) <= 150,
      );
      setCurrentHeading(visible[visible.length - 1] ?? ids[0]);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [tocSignature]);
  function goTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentHeading(id);
  }
  const index = allPages.findIndex((item) => item.id === page);
  const previous = allPages[index - 1];
  const next = allPages[index + 1];
  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header>
        <Group
          h='100%'
          px={{ base: 'md', sm: 'xl' }}
          justify='space-between'
          wrap='nowrap'
        >
          <Group gap='sm' wrap='nowrap'>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom='sm'
              size='sm'
              aria-label='Toggle navigation'
              aria-expanded={opened}
              aria-controls='docs-navigation'
            />
            <Anchor
              component={Link}
              to='/getting-started'
              underline='never'
              c='inherit'
            >
              <Group gap='sm' wrap='nowrap'>
                <span className={classes.logo} aria-hidden='true'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-table-2 preview-icon'
                  >
                    <path d='M3 9h18' />
                    <path d='M9 3v18' />
                    <rect x='3' y='3' width='18' height='18' rx='2' />
                  </svg>
                </span>
                <Text fw={750} size='lg' className={classes.brand}>
                  Mantine DataTable <span>Lite</span>
                </Text>
              </Group>
            </Anchor>
            <Badge variant='light' color='gray' visibleFrom='md'>
              {version}
            </Badge>
          </Group>
          <Group gap='xs' wrap='nowrap'>
            <Button
              component='a'
              href={npmUrl}
              target='_blank'
              rel='noreferrer'
              variant='default'
              size='compact-sm'
              visibleFrom='sm'
              rightSection={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                  <path d='m21 3-9 9' />
                  <path d='M15 3h6v6' />
                </svg>
              }
            >
              npm
            </Button>
            <Button
              component='a'
              href={repository}
              target='_blank'
              rel='noreferrer'
              variant='default'
              size='compact-sm'
              visibleFrom='sm'
              rightSection={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                  <path d='m21 3-9 9' />
                  <path d='M15 3h6v6' />
                </svg>
              }
            >
              GitHub
            </Button>
            <Button
              variant='transparent'
              size='compact-sm'
              onClick={toggleColorScheme}
              aria-label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {scheme === 'dark' ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <circle cx='12' cy='12' r='4' />
                  <path d='M12 2v2' />
                  <path d='M12 20v2' />
                  <path d='m4.93 4.93 1.41 1.41' />
                  <path d='m17.66 17.66 1.41 1.41' />
                  <path d='M2 12h2' />
                  <path d='M20 12h2' />
                  <path d='m6.34 17.66-1.41 1.41' />
                  <path d='m19.07 4.93-1.41 1.41' />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' />
                </svg>
              )}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar id='docs-navigation' p='md'>
        <AppShell.Section grow component={ScrollArea}>
          <nav aria-label='Documentation navigation'>
            {navigation.map((group) => (
              <div key={group.label}>
                <Text
                  size='sm'
                  fw={650}
                  c='dimmed'
                  tt='uppercase'
                  px='sm'
                  mt='lg'
                  mb='xs'
                >
                  {group.label}
                </Text>
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    component={RouterLink}
                    to={`/${item.id}`}
                    label={item.label}
                    active={page === item.id}
                    variant='light'
                    onClick={close}
                    defaultOpened={page === item.id}
                  >
                    {page === item.id &&
                      scenarios.length > 1 &&
                      scenarios.map((scenario) => (
                        <NavLink
                          key={scenario.id}
                          component={Link}
                          to={`/${page}?scenario=${scenario.id}`}
                          label={scenario.label}
                          active={active === scenario.id}
                          onClick={close}
                        />
                      ))}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </AppShell.Section>
        <AppShell.Section pt='md' mt='md' className={classes.navBottom}>
          <Text size='xs' c='dimmed'>
            Built for React & Mantine 9
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Anchor
          href='#main-content'
          className={classes.skipLink}
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById('main-content')
              ?.focus({ preventScroll: true });
            window.scrollTo({ top: 0 });
          }}
        >
          Skip to content
        </Anchor>
        <div className={classes.documentGrid}>
          <main id='main-content' className={classes.content} tabIndex={-1}>
            <Breadcrumbs mb='lg'>
              <Anchor component={Link} to='/getting-started' size='sm'>
                Docs
              </Anchor>
              <Text size='sm'>{title}</Text>
            </Breadcrumbs>
            <Title order={1} className={classes.pageTitle}>
              {title}
            </Title>
            <Text size='lg' c='dimmed' mt='sm' mb='xl' lh={1.6}>
              {description}
            </Text>
            {children}
            <Group
              justify='space-between'
              mt={60}
              pt='xl'
              className={classes.pageNavigation}
            >
              {previous ? (
                <Anchor component={Link} to={`/${previous.id}`}>
                  ← {previous.label}
                </Anchor>
              ) : (
                <span />
              )}
              {next && (
                <Anchor component={Link} to={`/${next.id}`}>
                  {next.label} →
                </Anchor>
              )}
            </Group>
            <footer className={classes.footer}>
              <Group justify='space-between' gap='sm'>
                <Text size='sm' c='dimmed'>
                  Mantine DataTable Lite · MIT license
                </Text>
                <Anchor
                  size='sm'
                  href={`${repository}/issues`}
                  target='_blank'
                  rel='noreferrer'
                >
                  Feedback & issues ↗
                </Anchor>
              </Group>
            </footer>
          </main>
          <aside className={classes.toc} aria-label='Table of contents'>
            <Text fw={600} size='sm' mb='md'>
              On this page
            </Text>
            <Stack gap={2}>
              {toc.map((item) => (
                <NavLink
                  component='button'
                  key={item.id}
                  label={item.label}
                  active={currentHeading === item.id}
                  onClick={() => goTo(item.id)}
                  variant='light'
                />
              ))}
            </Stack>
          </aside>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
