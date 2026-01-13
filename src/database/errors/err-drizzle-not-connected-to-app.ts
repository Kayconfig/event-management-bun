export class ErrDrizzleDbNotConnectedToApp extends Error {
  constructor() {
    super('drizzleDb variable not attached to app');
  }

  static create(): ErrDrizzleDbNotConnectedToApp {
    return new ErrDrizzleDbNotConnectedToApp();
  }
}
