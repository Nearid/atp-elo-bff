import { DrawPredictionCalculator } from './draw-prediction-calculator';
import { TournamentDraw } from '../entities/tournament-draw.entity';
import { Round } from '../../shared/enums/round.enum';
import { PlayerDrawPrediction } from '../models/player-draw-prediction.model';

describe('DrawPredictionCalculator', () => {
  const PLAYER_A = 'A';
  const PLAYER_B = 'B';
  const PLAYER_C = 'C';
  const PLAYER_D = 'D';
  const PLAYER_E = 'E';
  const PLAYER_F = 'F';
  const PLAYER_G = 'G';

  const GLOBAL_ELOS = new Map<string, number>();
  GLOBAL_ELOS.set(PLAYER_A, 2000);
  GLOBAL_ELOS.set(PLAYER_B, 1950);
  GLOBAL_ELOS.set(PLAYER_C, 2050);
  GLOBAL_ELOS.set(PLAYER_D, 1900);
  GLOBAL_ELOS.set(PLAYER_E, 2010);
  GLOBAL_ELOS.set(PLAYER_F, 1800);
  GLOBAL_ELOS.set(PLAYER_G, 1750);

  const SURFACE_ELOS = new Map<string, number>();
  SURFACE_ELOS.set(PLAYER_A, 1950);
  SURFACE_ELOS.set(PLAYER_B, 1900);
  SURFACE_ELOS.set(PLAYER_C, 1800);
  SURFACE_ELOS.set(PLAYER_D, 1900);
  SURFACE_ELOS.set(PLAYER_E, 2000);
  SURFACE_ELOS.set(PLAYER_F, 1750);
  SURFACE_ELOS.set(PLAYER_G, 1740);

  const TOURNAMENT_DRAW = {
    firstRound: Round.QF,
    matches: [
      {
        matchNumber: 1,
        round: Round.QF,
        player1Id: PLAYER_A,
        player2Id: PLAYER_B,
        winnerId: PLAYER_A,
      },
      {
        matchNumber: 2,
        round: Round.QF,
        player1Id: PLAYER_C,
        player2Id: PLAYER_D,
        winnerId: PLAYER_D,
      },
      {
        matchNumber: 3,
        round: Round.QF,
        player1Id: PLAYER_E,
        player2Id: PLAYER_F,
        winnerId: PLAYER_E,
      },
      {
        matchNumber: 4,
        round: Round.QF,
        player1Id: PLAYER_G,
        player2Id: null,
        winnerId: PLAYER_G,
      },
      {
        matchNumber: 1,
        round: Round.SF,
        player1Id: PLAYER_A,
        player2Id: PLAYER_D,
        winnerId: PLAYER_A,
      },
      {
        matchNumber: 2,
        round: Round.SF,
        player1Id: PLAYER_E,
        player2Id: PLAYER_G,
        winnerId: null,
      },
    ],
  } as TournamentDraw;

  const drawPredictionCalculator = new DrawPredictionCalculator(
    TOURNAMENT_DRAW,
    GLOBAL_ELOS,
    SURFACE_ELOS,
  );

  it('should predict all rounds', () => {
    const preds = drawPredictionCalculator.computeDrawPredictions();
    expect(preds).toHaveLength(2);

    // A elo = 1975
    // B elo = 1925
    // A win prob = 0.5714631174083814
    // B win prob = 0.4285368825916186
    // A new elo = 1992.1414753036647
    // B new elo = 1947.8585246963353

    // C elo = 1925
    // D elo = 1900
    // C win prob = 0.5359159269451023
    // D win prob = 0.4640840730548977
    // D new elo = 1921.436637077804
    // C new elo = 1943.563362922196

    // A potential win prob against C = 0.5694574955163259 => new elo = 2009.3631754830117
    // A potential win prob against D = 0.6003706606267996 => new elo = 2008.1266488785927
    // A win SF = 0.5714631174083814 * (0.5359159269451023 * 0.5694574955163259 + 0.4640840730548977 * 0.6003706606267996) = 0.3336223412697163

    // B potential win prob against C = 0.5061809197959222 => new elo = 1967.6112879044983
    // B potential win prob against D = 0.5379510197641628 => new elo = 1966.3404839057687
    // B win SF = 0.4285368825916186 * (0.5359159269451023 * 0.5061809197959222 + 0.4640840730548977 * 0.5379510197641628) = 0.22323554007713303

    // C potential win prob against A = 0.4305425044836741 => new elo = 1966.341662742849
    // C potential win prob against B = 0.4938190802040778 => new elo = 1963.8105997140328
    // C win sf = 0.5359159269451023 * (0.5714631174083814 * 0.4305425044836741 + 0.4285368825916186 * 0.4938190802040778) = 0.24526666734970387

    // D potential win prob against A = 0.39962933937320044 => new elo = 1945.451463502876
    // D potential win prob against B = 0.4620489802358373 => new elo = 1942.9546778683707
    // D win SF = 0.4640840730548977 * (0.5714631174083814 * 0.39962933937320044 +  0.4285368825916186 * 0.4620489802358373) = 0.19787545130344675

    // E elo = 2005
    // F elo = 1775
    // E win prob = 0.7898441797581306
    // F win prob = 0.21015582024186943
    // E new elo = 2013.4062328096747
    // F new elo = 1806.5937671903253

    // Player G elo = 1745

    // E potential win prob against G = 0.824200614739844 => new elo = 2020.438208220081
    // E win SF = 0.7898441797581306 * 0.824200614739844 = 0.6509900585053391
    // E new elo = 2020.438208220081

    // F potential win prob against G = 0.58772346775752 => new elo = 1823.0848284800245
    // F win SF = 0.21015582024186943 * 0.58772346775752 = 0.12351350744197753
    // F new elo = 1823.0848284800245

    // G potential win prob against E = 0.175799385260156 => new elo = 1777.9680245895938
    // G potential win prob against F = 0.41227653224248 => new elo = 1768.5089387103008
    // G win SF = 0.7898441797581306 * 0.175799385260156 + 0.21015582024186943 * 0.41227653224248 = 0.22549643405268344
    // G potential elo = 0.7898441797581306 * 1777.9680245895938 + 0.21015582024186943 * 1768.5089387103008 = 1775.9801426378929

    // A potential elo in F = 0.5359159269451023 * 2009.3631754830117 + 0.4640840730548977 * 2008.1266488785927 = 2008.789323179992
    // A potential win prob against E = 0.48324218574978633
    // A potential win prob against F = 0.7444068878028428
    // A potential win prob against G = 0.7925158199464098
    // A win F = 0.3336223412697163 * (0.6509900585053391 * 0.48324218574978633 + 0.12351350744197753 * 0.7444068878028428 + 0.22549643405268344 * 0.7925158199464098)

    const qfPred = preds[0];
    expect(qfPred.fromRound).toEqual(Round.QF);

    const predsByPlayer = new Map<string, PlayerDrawPrediction>();
    qfPred.playerPredictions.forEach((pred) =>
      predsByPlayer.set(pred.playerId, pred),
    );

    expect(predsByPlayer.size).toBe(8);
    expect(predsByPlayer.get(PLAYER_A)!.prediction.SF).toBe(0.5714631174083814);
    expect(predsByPlayer.get(PLAYER_A)!.prediction.F).toBe(0.3336223412697163);
    expect(predsByPlayer.get(PLAYER_A)!.prediction.W).toBe(0.19524902416462298);

    expect(predsByPlayer.get(PLAYER_B)!.prediction.SF).toBe(0.4285368825916186);
    expect(predsByPlayer.get(PLAYER_B)!.prediction.F).toBe(0.22323554007713303);

    expect(predsByPlayer.get(PLAYER_C)!.prediction.SF).toBe(0.5359159269451023);
    expect(predsByPlayer.get(PLAYER_C)!.prediction.F).toBe(0.24526666734970387);

    expect(predsByPlayer.get(PLAYER_D)!.prediction.SF).toBe(0.4640840730548977);
    expect(predsByPlayer.get(PLAYER_D)!.prediction.F).toBe(0.19787545130344675);

    expect(predsByPlayer.get(PLAYER_E)!.prediction.SF).toBe(0.7898441797581306);
    expect(predsByPlayer.get(PLAYER_E)!.prediction.F).toBe(0.6509900585053391);

    expect(predsByPlayer.get(PLAYER_F)!.prediction.SF).toBe(
      0.21015582024186943,
    );
    expect(predsByPlayer.get(PLAYER_F)!.prediction.F).toBe(0.12351350744197753);

    expect(predsByPlayer.get(PLAYER_G)!.prediction.SF).toBe(1);
    expect(predsByPlayer.get(PLAYER_G)!.prediction.F).toBe(0.22549643405268344);

    // A elo = 1992.1414753036647
    // D elo = 1921.436637077804
    // A win prob = 0.6003706606267996 new elo => 2008.1266488785927
    // D win prob = 0.39962933937320044 new elo => 1945.451463502876

    // E elo = 2013.4062328096747
    // G elo = 1745
    // E win prob = 0.824200614739844 new elo => 2020.438208220081
    // G win prob = 0.175799385260156 new elo => 1777.9680245895938

    // A potential win prob against E = 0.48228965406519664
    // A potential win prob against G = 0.7899957078919312
    // A win tournament = 0.6003706606267996 * (0.824200614739844 * 0.48228965406519664 + 0.175799385260156 * 0.7899957078919312)

    // D potential win prob against E = 0.3937303902387849
    // D potential win prob against G = 0.7239443750709295
    // D win tournament = 0.39962933937320044 * (0.824200614739844 * 0.3937303902387849 + 0.175799385260156 * 0.7239443750709295)

    // E potential win prob against A = 0.5177103459348034
    // E potential win prob against D = 0.6062696097612151
    // E win tournament = 0.824200614739844 * (0.6003706606267996 * 0.5177103459348034 + 0.39962933937320044 * 0.6062696097612151)

    // G win prob against A = 0.21000429210806879
    // G win prob against D = 0.27605562492907043
    // G win tournament = 0.175799385260156 * (0.6003706606267996 * 0.21000429210806879 + 0.39962933937320044 * 0.27605562492907043)

    const sfPreds = preds.pop()!;
    expect(sfPreds.fromRound).toBe(Round.SF);

    sfPreds.playerPredictions.forEach((pred) =>
      predsByPlayer.set(pred.playerId, pred),
    );

    expect(predsByPlayer.get(PLAYER_A)!.prediction.F).toBe(0.6003706606267996);
    expect(predsByPlayer.get(PLAYER_A)!.prediction.W).toBe(0.3220293300010217);

    expect(predsByPlayer.get(PLAYER_D)!.prediction.F).toBe(0.39962933937320044);
    expect(predsByPlayer.get(PLAYER_D)!.prediction.W).toBe(0.1805452645833272);

    expect(predsByPlayer.get(PLAYER_E)!.prediction.F).toBe(0.824200614739844);
    expect(predsByPlayer.get(PLAYER_E)!.prediction.W).toBe(0.45586637050986656);

    expect(predsByPlayer.get(PLAYER_G)!.prediction.F).toBe(0.175799385260156);
    expect(predsByPlayer.get(PLAYER_G)!.prediction.W).toBe(0.04155903490578459);
  });

  it('should predict latest', () => {
    const preds = drawPredictionCalculator.computeLatest();
    expect(preds).toHaveLength(4);

    // A elo = 2008.1266488785927
    // A potential win prob against E = 0.48228965406519664
    // A potential win prob against G = 0.7899957078919312
    // A win tournament = 0.824200614739844 * 0.48228965406519664 + 0.175799385260156 * 0.7899957078919312

    // E elo = 2013.4062328096747
    // G elo = 1745
    // E win prob = 0.824200614739844 new elo => 2020.438208220081
    // G win prob = 0.175799385260156 new elo => 1777.9680245895938

    // E potential win prob against A = 0.5177103459348034
    // G win prob against A = 0.21000429210806879

    const predsByPlayer = new Map<string, PlayerDrawPrediction>();
    preds.forEach((pred) => predsByPlayer.set(pred.playerId, pred));

    expect(predsByPlayer.get(PLAYER_A)!.prediction.F).toBe(1);
    expect(predsByPlayer.get(PLAYER_A)!.prediction.W).toBe(0.5363841891687651);

    expect(predsByPlayer.get(PLAYER_D)!.prediction.F).toBe(0);
    expect(predsByPlayer.get(PLAYER_D)!.prediction.W).toBe(0);

    expect(predsByPlayer.get(PLAYER_E)!.prediction.F).toBe(0.824200614739844);
    expect(predsByPlayer.get(PLAYER_E)!.prediction.W).toBe(0.4266971853766422);

    expect(predsByPlayer.get(PLAYER_G)!.prediction.F).toBe(0.175799385260156);
    expect(predsByPlayer.get(PLAYER_G)!.prediction.W).toBe(0.03691862545459273);
  });
});
