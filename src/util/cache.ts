import axios, { AxiosResponse } from 'axios';
import { Logger } from 'winston';
export class FetchCache {
  ttlMs: number;
  cache: Record<string, [Date, AxiosResponse<any>]> = {}; /* url, requested_at, response */
  response: any;
  logger?: Logger;

  constructor(options: { logger?: Logger }, ttlSec: number = 10) {
    this.ttlMs = ttlSec * 1000;
    this.response = {};
    this.logger = options.logger;
  }

  private trimCache = (): void => {
    const now = Date.now();

    /* keep URL in cache if insertion time plus ttl is after now */
    for (const [url, item] of Object.entries(this.cache)) {
      const shouldPurge = item[0].getTime() + this.ttlMs < now;
      if (shouldPurge) delete this.cache[url];
    }
  };

  get = async (url: string) => {
    /* trim the cache */
    this.trimCache();

    /* if there is a cache entry, return it */
    const hit = this.cache[url];

    if (hit) return hit[1];

    /* no hit, so make the request */
    const now = new Date();

    /* get the response */
    const response = await this.getURLWithRetry(url);

    /* add the response to the cache, then return */
    this.cache[url] = [now, response];
    return response;
  };

  private getURLWithRetry = async (url: string) => {
    let attempts = 0;
    let maxAttempts = 3;
    let backoffTimes = [10, 1000, 10000];

    while (attempts <= maxAttempts) {
      try {
        /* try to return the result of the promise */
        let response = await axios.get(url, {
          timeout: 15000
        });

        return response;
      } catch (error: any) {
        if (error.message.indexOf('Request failed with status code 403') > -1) {
          if (this.logger) {
            this.logger.warn('Request failed, retrying', error);
          }
          /* wait the backoff time */
          if (process.env.NODE_ENV !== 'test') {
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          attempts++;
        } else {
          if (this.logger) {
            this.logger.warn('Request failed, retrying', error);
          }
          /* wait the backoff time */
          if (process.env.NODE_ENV !== 'test') {
            await new Promise(resolve => setTimeout(resolve, backoffTimes[attempts]));
          } else {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          attempts++;
        }
      }
    }

    throw new Error(`Maximum attempts (${attempts}) made to the resource with no valid response`);
  };
}
