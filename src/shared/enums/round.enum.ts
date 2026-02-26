export enum Round {
  R128 = 'R128',
  R64 = 'R64',
  R32 = 'R32',
  R16 = 'R16',
  QF = 'QF',
  SF = 'SF',
  F = 'F',
  W = 'W',
}

type RoundValue = (typeof Round)[keyof typeof Round];

export function sortByOrdinal(r1: Round, r2: Round) {
  const keys = Object.values(Round);
  return keys.indexOf(r1) - keys.indexOf(r2);
}

export function getOrderedFrom(round: Round): Round[] {
  const rounds = Object.values(Round) as RoundValue[];

  return rounds
    .slice(rounds.indexOf(round), rounds.length)
    .map((roundStr) => Round[roundStr]);
}
