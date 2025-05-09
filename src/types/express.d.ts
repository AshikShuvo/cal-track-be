import 'express-session';

declare module 'express-session' {
  interface ISessionData {
    userId: string;
  }
} 