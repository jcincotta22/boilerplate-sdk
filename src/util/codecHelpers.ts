import * as t from 'io-ts';

import { pipe } from 'fp-ts/lib/pipeable';
import { fold, isLeft } from 'fp-ts/lib/Either';
import { Logger } from 'winston';

export const getPaths = <A>(v: t.Validation<A>): Array<string> => {
  return pipe(
    v,
    fold(
      errors =>
        errors.map((error: any) =>
          error.context
            .map((key: any) => {
              return key.key;
            })
            .join('.')
        ),
      () => ['no errors']
    )
  );
};

export const decodeResponse = <T, A>(response: any, decoder: t.Decoder<T, A>, typeName: string, logger?: Logger) => {
  const decoded = decoder.decode(response);
  if (isLeft(decoded)) {
    const log = logger ? logger.error : console.log;
    log(getPaths(decoded));
    throw new Error(`Response failed validation as ${typeName}`);
  }

  return decoded.right;
};
