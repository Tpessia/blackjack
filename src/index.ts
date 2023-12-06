import { martingaleBettingSystem, paroliBettingSystem } from './betting-systems';
import { BetResult, BettingSystem, Card, PlayResult, Rank, SimulationState, Suit, Winner, WinnerResult, WinnerType, cardsValue } from './types';

const debug = 0; // 0, 1, 2

start();

function start() {
  // Take aways:
  // Bet between 2.5% to 5% of initBalance
  // Stop between 30% and 50% of profit on initBalance

  const nSimulations = 10000; // 10000
  const maxTurns = 50; // 50
  const initBalance = 1000; // 1000
  const baseBet = 50; // 50
  const maxBet = baseBet * 10;

  console.log('nSimulations', nSimulations, 'maxTurns', maxTurns, 'initBalance', initBalance, 'baseBet', baseBet, 'maxBet', maxBet);

  console.log('Default');
  test(nSimulations, maxTurns, initBalance, baseBet, maxBet);

  console.log('Paroli');
  test(nSimulations, maxTurns, initBalance, baseBet, maxBet, paroliBettingSystem);

  console.log('Martingale');
  test(nSimulations, maxTurns, initBalance, baseBet, maxBet, martingaleBettingSystem);
}

function test(nSimulations: number, maxTurns: number, initBalance: number, baseBet: number, maxBet: number, bettingSystem?: BettingSystem) {
  const simulations: SimulationState[] = [];

  for (let i = 0; i < nSimulations; i++) {
    const result = simulate(maxTurns, initBalance, baseBet, maxBet, bettingSystem);
    simulations.push(result);
  }

  const report1 = simulations.reduce((acc, val) => [...acc, {
    balance: val.balance,
    turns: val.bets.length,
    max: Math.max(...val.bets.map(e => e.balance)),
  }], [] as { balance: number, turns: number, max: number }[]);

  const report2 = report1.reduce((acc, val, i) => ({
    avgBalance: (acc.avgBalance * i + val.balance) / (i + 1),
    avgTurns: (acc.avgTurns * i + val.turns) / (i + 1),
    avgMax: (acc.avgMax * i + val.max) / (i + 1),
    max: Math.max(acc.max, val.balance),
    wins: (acc.wins * i + (val.balance >= initBalance ? 1 : 0)) / (i + 1),
  }), { avgBalance: 0, avgTurns: 0, avgMax: 0, max: 0, wins: 0 });

  if (debug >= 1) console.log(JSON.stringify(report1));
  console.log(JSON.stringify(report2));
}

function simulate(maxTurns: number, initBalance: number, baseBet: number, maxBet: number, bettingSystem?: BettingSystem): SimulationState {
  const prize: Record<Winner, Record<WinnerType, number>> = {
    Dealer: {
      Normal: -1,
      BlackJack: -1,
    },
    Player: {
      Normal: 1,
      BlackJack: 1.5,
    },
    Draw: {
      Normal: 0,
      BlackJack: 0,
    }
  };

  const bets: BetResult[] = [];
  let balance = initBalance;
  let bet = baseBet;

  for (let i = 0; i < maxTurns; i++) {
    if (bet > maxBet) throw new Error("bet can't be bigger than maxBet!");
    if (balance < bet) break;

    if (debug >= 2) console.log(`\n--- #${i+1}---`)

    const result = play();

    const newBalance = balance + bet * prize[result.winner.winner][result.winner.type];
    const betResult: BetResult = {
      bet,
      balance,
      newBalance,
      result,
    };
    bets.push(betResult);

    if (debug >= 2) console.log(JSON.stringify(betResult));

    balance = newBalance;
    bet = bettingSystem ? bettingSystem({ initBalance, baseBet, maxBet, balance, bets }) : bet;
  }

  return { initBalance, baseBet, maxBet, balance, bets };
}

function play(): PlayResult {
  const deck = generateDeck();
  const initPlayerHand = getRandomCards(deck, 2);
  const initDealerHand = getRandomCards(deck, 2);

  const playerHand = playPlayer([...initPlayerHand], initDealerHand[0], deck);
  const dealerHand = playDealer([...initDealerHand], deck);

  const result = getResult(playerHand, dealerHand);

  return {
    winner: result,
    dealerHand,
    playerHand,
  };
}

function generateDeck(): Card[] {
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);

  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

function getRandomCard(deck: Card[]): Card {
  const randomIndex = Math.floor(Math.random() * deck.length);
  const randomCard = deck.splice(randomIndex, 1)[0];
  if (randomCard == null) throw new Error('Deck is empty!');
  return randomCard;
}

function getRandomCards(deck: Card[], amount: number): Card[] {
  const cards: Card[] = [];
  
  for (let i = 0; i < amount; i++) {
    const randomCard = getRandomCard(deck);
    if (randomCard) cards.push(randomCard);
  }

  return cards;
}

function playPlayer(playerHand: Card[], dealerHand: Card, deck: Card[]) {
  const cardsSum = sumHand(playerHand);
  if (cardsSum > 21) return playerHand;

  const hasAce = playerHand.some(c => c.rank === Rank.Ace);
  const dealerValue = cardsValue[dealerHand.rank];

  const shouldHit = (dealerValue < 7 && cardsSum < 13) || (dealerValue >= 7 && cardsSum < 17) || (hasAce && cardsSum <= 17);
  if (shouldHit) {
    const card = getRandomCard(deck);
    playerHand.push(card);
    playPlayer(playerHand, dealerHand, deck);
  }

  return playerHand;
}

function playDealer(dealerHand: Card[], deck: Card[]) {
  const cardsSum = sumHand(dealerHand);
  if (cardsSum > 21) return dealerHand;

  const shouldHit = cardsSum < 17;
  if (shouldHit) {
    const card = getRandomCard(deck);
    dealerHand.push(card);
    playDealer(dealerHand, deck);
  }

  return dealerHand;
}

function sumHand(hand: Card[]) {
  return hand.reduce((acc, val) => acc + cardsValue[val.rank], 0);
}

function getResult(playerHand: Card[], dealerHand: Card[]): WinnerResult {
  const playerSum = sumHand(playerHand);
  const dealerSum = sumHand(dealerHand);
  if (playerSum > 21) return { winner: Winner.Dealer, type: WinnerType.Normal };
  else if (dealerSum > 21) return { winner: Winner.Player, type: WinnerType.Normal };
  else if (playerSum == dealerSum) return { winner: Winner.Draw, type: WinnerType.Normal };
  else if (playerSum == 21) return { winner: Winner.Player, type: WinnerType.BlackJack };
  else if (dealerSum == 21) return { winner: Winner.Dealer, type: WinnerType.BlackJack };
  else if (playerSum > dealerSum) return { winner: Winner.Player, type: WinnerType.Normal };
  else if (dealerSum > playerSum) return { winner: Winner.Dealer, type: WinnerType.Normal };
  else throw new Error(`Invalid result! P:${playerSum} D:${dealerSum}`);
}
