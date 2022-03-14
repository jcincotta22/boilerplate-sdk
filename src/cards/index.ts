import { FetchCache } from '../util/cache';
import { Logger } from 'winston';
import { decodeResponse } from '../util/codecHelpers';
import { Deck } from './codecs';
import { DrawnCards } from '..';

export type SDKOptions = {
  ttlMins?: number;
  cache?: FetchCache;
  logger?: Logger;
};

/**
 * The top-level SDK for deck of cards api
 * https://deckofcardsapi.com/
 */
export class DeckOfCardsSDK {
  key: string; // dont need this for this api but would for other apis that require a an auth key
  cache: FetchCache;
  logger?: Logger;

  constructor(key: string, options: SDKOptions = {}) {
    this.key = key; // auth key if needed
    this.logger = options.logger;
    const { cache = new FetchCache({ logger: options.logger }) } = options;
    this.cache = cache;
  }

  private shuffleNewDeck = (count?: number): string => {
    if (count) {
      return `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${count}`;
    }
    return `https://deckofcardsapi.com/api/deck/new/shuffle`;
  };

  private getNewDeck = (): string => {
    return `https://deckofcardsapi.com/api/deck/new/`;
  };

  private drawFromDeck = (deckId: string, count: number): string => {
    return `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`;
  };

  private reshuffleDeck = (deckId: string, remaining: boolean): string => {
    if (remaining) {
      return `https://deckofcardsapi.com/api/deck/${deckId}/shuffle?remaining=true`;
    }
    return `https://deckofcardsapi.com/api/deck/${deckId}/shuffle`;
  };

  private getTypedNewDeck = async (callback?: (data: any) => Promise<void>): Promise<Deck | null> => {
    try {
      const url = this.getNewDeck();
      const result = await this.cache.get(url);
      const body = result.data;

      if (callback) {
        await callback(body);
      }

      return decodeResponse(body, Deck, 'Deck', this.logger);
    } catch (e) {
      const log = this.logger ? this.logger.error : console.log;
      log(e);
      return null;
    }
  };

  private getTypedDrawCards = async (
    deck_id: string,
    count: number,
    callback?: (data: any) => Promise<void>
  ): Promise<DrawnCards | null> => {
    try {
      const url = this.drawFromDeck(deck_id, count);
      const result = await this.cache.get(url);
      const body = result.data;

      if (callback) {
        await callback(body);
      }

      return decodeResponse(body, DrawnCards, 'DrawnCards', this.logger);
    } catch (e) {
      const log = this.logger ? this.logger.error : console.log;
      log(e);
      return null;
    }
  };

  getNewShuffledDeck = async (callback?: (data: any) => Promise<void>): Promise<Deck | null> => {
    const response = await this.getTypedNewDeck(callback);

    return response;
  };

  drawCards = async (
    deck_id: string,
    count: number,
    callback?: (data: any) => Promise<void>
  ): Promise<DrawnCards | null> => {
    const response = await this.getTypedDrawCards(deck_id, count, callback);

    return response;
  };
}
