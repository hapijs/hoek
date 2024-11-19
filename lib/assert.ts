/* eslint-disable @typescript-eslint/no-explicit-any */

import { stringify } from './stringify';
import { AssertError } from './assertError';

// eslint-disable-next-line func-style -- https://github.com/microsoft/TypeScript/issues/34523
export function assert <T>(condition: T, ...args: (string | Error)[]): asserts condition {

    if (condition) {
        return;
    }

    if (args.length === 1 &&
      args[0] instanceof Error) {

        throw args[0];
    }

    const msgs = args
        .filter((arg) => arg !== '')
        .map((arg) => {

            return typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : stringify(arg);
        });

    throw new AssertError(msgs.join(' '), assert);
}

export default assert;