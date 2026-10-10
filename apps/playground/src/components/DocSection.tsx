import type { ReactNode } from 'react';
import { Title } from '@mantine/core';
import classes from '../App.module.css';
export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className={classes.section}><Title order={2} mb='md'>{title}</Title>{children}</section>;
}
