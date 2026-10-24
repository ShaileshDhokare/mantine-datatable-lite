import { notifications } from '@mantine/notifications';
import { NOTIFICATION_AUTO_CLOSE_MS } from '../constants/app';

/** Closes itself after a few seconds. */
export function notifySuccess(message: string) {
  notifications.show({
    color: 'teal',
    title: 'Done',
    message,
    autoClose: NOTIFICATION_AUTO_CLOSE_MS,
  });
}

/** Stays until dismissed. */
export function notifyError(message: string) {
  notifications.show({
    color: 'red',
    title: 'Something went wrong',
    message,
    autoClose: false,
  });
}
