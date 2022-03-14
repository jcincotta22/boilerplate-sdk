import * as t from 'io-ts';

export const Deck = t.type({
  deck_id: t.string,
  shuffled: t.boolean,
  remaining: t.number
});

export type Deck = t.TypeOf<typeof Deck>;

export const Card = t.type({
  image: t.string,
  value: t.string,
  suit: t.string, // can be enum
  code: t.string // can be enum
});

export type Card = t.TypeOf<typeof Card>;

export const DrawnCards = t.type({
  cards: t.array(Card),
  deck_id: t.string,
  remaining: t.number
});

export type DrawnCards = t.TypeOf<typeof DrawnCards>;
