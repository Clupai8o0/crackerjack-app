import * as Sentry from '@sentry/react-native';

export function initSentry() {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    // Never send PII
    beforeSend(event) {
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message, data, level: 'info' });
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class NotAuthorizedError extends Error {
  constructor(message = 'Not authorized') {
    super(message);
    this.name = 'NotAuthorizedError';
  }
}

export class BookingStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingStateError';
  }
}
