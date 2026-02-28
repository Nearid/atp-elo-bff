import {
  getOrderedFrom,
  Round,
  sortByOrdinal,
} from '../../shared/enums/round.enum';
import { TournamentDraw } from '../entities/tournament-draw.entity';
import { DrawPrediction } from '../models/draw-prediction.model';
import { TournamentDrawMatch } from '../entities/tournament-draw-match.entity';
import { PlayerDrawPrediction } from '../models/player-draw-prediction.model';

export class DrawPredictionCalculator {
  private readonly BYE_PLAYER = 'BYE';
  private readonly ELO_KFACTOR = 40;

  private readonly reachRoundProbMap = new Map<string, number>();
  private readonly winRoundProbMap = new Map<string, number>();
  private readonly roundEloMap = new Map<string, number>();
  private readonly defeatedPlayers = new Map<string, Round>();

  private readonly baseElos = new Map<string, number>();
  private readonly tournamentDraw: TournamentDraw;

  private rounds: Round[];
  private players: string[];
  private elos: Map<string, number>;

  constructor(
    draw: TournamentDraw,
    globalElos: Map<string, number>,
    surfaceElo: Map<string, number>,
  ) {
    this.tournamentDraw = draw;

    const tournamentPlayers = draw.matches
      .filter((m) => m.round === draw.firstRound)
      .toSorted((m1, m2) => m1.matchNumber - m2.matchNumber)
      .flatMap((match) => [
        match.player1Id,
        match.player2Id ?? this.BYE_PLAYER,
      ]);

    tournamentPlayers
      .filter((player) => player !== this.BYE_PLAYER)
      .forEach((playerId) =>
        this.baseElos.set(
          playerId,
          this.computeElo(globalElos.get(playerId)!, surfaceElo.get(playerId)!),
        ),
      );

    this.elos = new Map(this.baseElos);
  }

  public computeDrawPredictions(): DrawPrediction[] {
    this.clearCache();

    const definedRounds = this.getDefinedRounds();

    const preds: DrawPrediction[] = [];

    definedRounds.forEach((round) => {
      preds.push({
        fromRound: round,
        playerPredictions: this.computeDrawPredictionsForRound(round),
      });
      this.clearCache();
    });
    return preds;
  }

  public computeLatest(): PlayerDrawPrediction[] {
    this.clearCache();

    const latestDefinedRound = this.getDefinedRounds().pop()!;
    this.rounds = getOrderedFrom(latestDefinedRound);
    this.loadPlayers(latestDefinedRound);
    this.updateElo();
    this.setDefeatedPlayers();

    const preds: PlayerDrawPrediction[] = [];
    this.players.forEach((playerId) =>
      preds.push({
        playerId,
        prediction: this.computeDrawPredictionsForPlayer(playerId),
      }),
    );
    return preds;
  }

  private computeDrawPredictionsForRound(
    fromRound: Round,
  ): PlayerDrawPrediction[] {
    this.rounds = getOrderedFrom(fromRound);
    this.loadPlayers(fromRound);
    this.updateEloFromRound(fromRound);

    const preds: PlayerDrawPrediction[] = [];
    this.players.forEach((playerId) =>
      preds.push({
        playerId,
        prediction: this.computeDrawPredictionsForPlayer(playerId),
      }),
    );

    return preds;
  }

  private computeDrawPredictionsForPlayer(
    playerId: string,
  ): Record<Round, number> {
    let roundReachProbs = {} as Record<Round, number>;
    this.rounds.slice(1).forEach(
      (round) =>
        (roundReachProbs = {
          ...roundReachProbs,
          [round]: this.computeReachRoundProb(playerId, round),
        }),
    );
    return roundReachProbs;
  }

  private computeReachRoundProb(playerId: string, round: Round) {
    if (round === this.rounds[0]) {
      return 1;
    }
    const roundIdx = this.rounds.indexOf(round);
    const prevRound = this.rounds[roundIdx - 1];

    return (
      this.getReachRoundProb(playerId, prevRound) *
      this.getWinRoundProb(playerId, prevRound)
    );
  }

  private getWinRoundProb(playerId: string, round: Round): number {
    const playerRound = playerId + round.valueOf();
    let prob = this.winRoundProbMap.get(playerRound);
    if (!prob) {
      prob = this.computeWinRoundProb(playerId, round);
      this.winRoundProbMap.set(playerRound, prob);
    }
    return prob;
  }

  private computeWinRoundProb(playerId: string, round: Round): number {
    return this.opponentReachableInRound(playerId, round)
      .map(
        (potentialOpponent) =>
          this.getReachRoundProb(potentialOpponent, round) *
          this.winProb(playerId, potentialOpponent, round),
      )
      .reduce((prev, next) => prev + next, 0);
  }

  private winProb(playerId: string, opponentId: string, round: Round): number {
    if (this.isDefeated(opponentId, round) || this.BYE_PLAYER === opponentId) {
      return 1;
    }
    if (this.isDefeated(playerId, round) || this.BYE_PLAYER === playerId) {
      return 0;
    }

    const playerElo = this.getExpectedEloOfRound(playerId, round);
    const opponentElo = this.getExpectedEloOfRound(opponentId, round);
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  }

  private computeExpectedEloOfRound(playerId: string, round: Round): number {
    if (round === this.rounds[0]) {
      return this.elos.get(playerId)!;
    }

    const roundIdx = this.rounds.indexOf(round);
    const prevRound = this.rounds[roundIdx - 1];
    const elo = this.getExpectedEloOfRound(playerId, prevRound);

    return this.opponentReachableInRound(playerId, prevRound)
      .map((opponent) => {
        const p = this.winProb(playerId, opponent, prevRound);
        const eloIfBeatingOpponent = elo + this.ELO_KFACTOR * (1 - p);
        return (
          eloIfBeatingOpponent * this.getReachRoundProb(opponent, prevRound)
        ); // warning : java use computeReach instead of getReach
      })
      .reduce((prev, next) => prev + next, 0);
  }

  private getExpectedEloOfRound(playerId: string, round: Round): number {
    const playerRound = playerId + round.valueOf();
    let prob = this.roundEloMap.get(playerRound);
    if (!prob) {
      prob = this.computeExpectedEloOfRound(playerId, round);
      this.roundEloMap.set(playerRound, prob);
    }
    return prob;
  }

  private isDefeated(playerId: string, round: Round) {
    if (!this.defeatedPlayers.has(playerId)) {
      return false;
    }

    const rounds = Object.values(Round);
    return (
      rounds.indexOf(this.defeatedPlayers.get(playerId)!) <=
      rounds.indexOf(round)
    );
  }

  private opponentReachableInRound(playerId: string, round: Round): string[] {
    const roundIndex = this.rounds.indexOf(round);
    let draw = this.players;
    let opponents: string[] = [];

    for (let i = 0; i < this.rounds.length - roundIndex - 1; i++) {
      const split = draw.length / 2;
      const subDraw1 = draw.slice(0, split);
      const subDraw2 = draw.slice(split, draw.length);

      const playerIsInDraw1 = subDraw1.includes(playerId);
      if (playerIsInDraw1) {
        draw = subDraw1;
        opponents = subDraw2;
      } else {
        draw = subDraw2;
        opponents = subDraw1;
      }
    }

    return opponents;
  }

  private getReachRoundProb(playerId: string, round: Round): number {
    const playerRound = playerId + round.valueOf();
    let prob = this.reachRoundProbMap.get(playerRound);
    if (!prob) {
      prob = this.computeReachRoundProb(playerId, round);
      this.reachRoundProbMap.set(playerRound, prob);
    }
    return prob;
  }

  private loadPlayers(fromRound: Round): void {
    this.players = this.tournamentDraw.matches
      .filter((match) => match.round === fromRound)
      .toSorted((m1, m2) => m1.matchNumber - m2.matchNumber)
      .flatMap((match) => [
        match.player1Id,
        match.player2Id ?? this.BYE_PLAYER,
      ]);
  }

  private setDefeatedPlayers(): void {
    this.tournamentDraw.matches
      .filter((match) => !!match.winnerId)
      .forEach((match) => {
        const loser = this.getLoser(match);
        if (loser) {
          this.defeatedPlayers.set(loser, match.round);
        }
      });
  }

  private updateElo(): void {
    this.tournamentDraw.matches
      .filter((match) => !!match.winnerId)
      .toSorted(
        (m1, m2) =>
          this.rounds.indexOf(m1.round) - this.rounds.indexOf(m2.round),
      )
      .forEach((match) => this.updatePlayerElo(match));
  }

  private updateEloFromRound(tillRound: Round): void {
    this.tournamentDraw.matches
      .filter((match) => !!match.winnerId)
      .filter(
        (match) =>
          this.rounds.indexOf(match.round) < this.rounds.indexOf(tillRound),
      )
      .toSorted(
        (m1, m2) =>
          this.rounds.indexOf(m1.round) - this.rounds.indexOf(m2.round),
      )
      .forEach((match) => this.updatePlayerElo(match));
  }

  private updatePlayerElo(match: TournamentDrawMatch) {
    const winner = match.winnerId;
    const loser = this.getLoser(match);
    if (!loser || loser === this.BYE_PLAYER) {
      return;
    }

    this.elos.set(
      winner,
      this.computeNewRating(this.elos.get(winner)!, this.elos.get(loser)!),
    );
  }

  private computeNewRating(
    playerRating: number,
    opponentRating: number,
  ): number {
    const expectedScore =
      1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return playerRating + this.ELO_KFACTOR * (1 - expectedScore);
  }

  private computeElo(globalElo: number, surfaceElo: number) {
    return (globalElo + surfaceElo) / 2;
  }

  private getLoser(match: TournamentDrawMatch): string | null {
    if (!match.winnerId) {
      return null;
    }
    const winner = match.winnerId;
    if (match.player1Id && match.player1Id !== winner) {
      return match.player1Id;
    }
    return match.player2Id ?? this.BYE_PLAYER;
  }

  private getDefinedRounds(): Round[] {
    const matchesByRound = Map.groupBy(
      this.tournamentDraw.matches,
      (match) => match.round,
    );

    return Array.from(matchesByRound.entries())
      .filter((entry) => entry[1].every((match) => this.isMatchDefined(match)))
      .map((entry) => entry[0])
      .toSorted(sortByOrdinal);
  }

  private isMatchDefined(match: TournamentDrawMatch): boolean {
    return (!!match.player1Id && !!match.player2Id) || !!match.winnerId;
  }

  private clearCache() {
    this.winRoundProbMap.clear();
    this.reachRoundProbMap.clear();
    this.roundEloMap.clear();
    this.defeatedPlayers.clear();
    this.elos = new Map(this.baseElos);
  }
}
