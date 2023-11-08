import { ignore } from './ignore.js';

export const block = (): Promise<void> => new Promise<void>(ignore);
