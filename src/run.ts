import { DeckOfCardsSDK } from './';
(async () => {
  const sdk = new DeckOfCardsSDK('');
  const data = await sdk.getNewShuffledDeck();

  console.log(data);
})();
