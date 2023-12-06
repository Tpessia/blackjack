import { BettingSystem, SimulationState, Winner } from './types';

// Double on every win, reset on 3 consecutive win or on loss
export const paroliBettingSystem: BettingSystem = (simulation: SimulationState) => {
  // if (simulation.balance / simulation.initBalance > 1.4) return 0;
  let consecutiveWins = [...simulation.bets].reverse()
    .filter(b => b.result.winner.winner !== Winner.Draw)
    .reduceRight((wins, bet) => bet.result.winner.winner === Winner.Player ? wins + 1 : 0, 0);
  let newBet = simulation.baseBet * Math.pow(2, consecutiveWins % 3);
  newBet = Math.min(newBet, simulation.maxBet, simulation.balance);
  return newBet;
};

// Double on every loss, reset on win
export const martingaleBettingSystem: BettingSystem = (simulation: SimulationState) => {
  // if (simulation.balance / simulation.initBalance > 1.4) return 0;
  let consecutiveLosses = [...simulation.bets].reverse()
  .filter(b => b.result.winner.winner !== Winner.Draw)
  .reduceRight((losses, bet) => bet.result.winner.winner === Winner.Dealer ? losses + 1 : 0, 0);
  let newBet = simulation.baseBet * Math.pow(2, consecutiveLosses);
  newBet = Math.min(newBet, simulation.maxBet, simulation.balance);
  return newBet;
};
