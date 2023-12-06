export interface WinnerResult {
  winner: Winner;
  type: WinnerType;
}

export enum Winner {
  Player = 'Player',
  Dealer = 'Dealer',
  Draw = 'Draw',
}

export enum WinnerType {
  Normal = 'Normal',
  BlackJack = 'BlackJack',
}

export enum Suit {
  Hearts = 'Hearts',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
  Spades = 'Spades',
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'Jack',
  Queen = 'Queen',
  King = 'King',
  Ace = 'Ace',
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export const cardsValue: Record<Rank, number> = {
  [Rank.Two]: 2,
  [Rank.Three]: 3,
  [Rank.Four]: 4,
  [Rank.Five]: 5,
  [Rank.Six]: 6,
  [Rank.Seven]: 7,
  [Rank.Eight]: 8,
  [Rank.Nine]: 9,
  [Rank.Ten]: 10,
  [Rank.Jack]: 10,
  [Rank.Queen]: 10,
  [Rank.King]: 10,
  [Rank.Ace]: 11,
};

export interface PlayResult {
  playerHand: Card[];
  dealerHand: Card[];
  winner: WinnerResult;
}

export interface BetResult {
  bet: number;
  balance: number;
  newBalance: number;
  result: PlayResult;
}

export interface SimulationState {
  initBalance: number;
  baseBet: number;
  maxBet: number;
  balance: number;
  bets: BetResult[];
}

export type BettingSystem = (simulation: SimulationState) => number;
