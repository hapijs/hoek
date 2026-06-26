import { ignore } from './ignore.ts';

export const block = (): Promise<void> => new Promise<void>(ignore);
