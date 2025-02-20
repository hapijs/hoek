import { ignore } from './ignore.js';

export const block = () => new Promise<void>(ignore);
