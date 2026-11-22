import { describe, it, expect } from "vitest";
import {
  validateLevelResultInput,
  computeNextProgress,
  ValidationError,
} from "../../src/services/progressService.ts";

const ALLOWED_LEVELS = [1, 2, 3, 4, 5];

describe("validateLevelResultInput", () => {
  it("returns valid data for correct input", () => {
    const result = validateLevelResultInput({
      playerId: "01933e2a-1111-7000-8000-000000000001",
      levelId: 2,
      roundsCompleted: 3,
      won: true,
      allowedLevelIds: ALLOWED_LEVELS,
    });

    expect(result).toEqual({
      playerId: "01933e2a-1111-7000-8000-000000000001",
      levelId: 2,
      roundsCompleted: 3,
      won: true,
    });
  });

  it("throws ValidationError, if playerId is empty or not string", () => {
    expect(() =>
      validateLevelResultInput({
        playerId: "   ",
        levelId: 1,
        roundsCompleted: 0,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).toThrow(ValidationError);
  });

  it("throws ValidationError, if levelId out of allowed levels array", () => {
    expect(() =>
      validateLevelResultInput({
        playerId: "player-1",
        levelId: 99,
        roundsCompleted: 1,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).toThrow(ValidationError);
  });

  it("throws ValidationError, if roundsCompleted < 0 or not integer", () => {
    expect(() =>
      validateLevelResultInput({
        playerId: "player-1",
        levelId: 1,
        roundsCompleted: -1,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateLevelResultInput({
        playerId: "player-1",
        levelId: 1,
        roundsCompleted: 1.5,
        won: false,
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).toThrow(ValidationError);
  });

  it("throws ValidationError, if won is not boolean", () => {
    expect(() =>
      validateLevelResultInput({
        playerId: "player-1",
        levelId: 1,
        roundsCompleted: 1,
        won: "true",
        allowedLevelIds: ALLOWED_LEVELS,
      }),
    ).toThrow(ValidationError);
  });
});

describe("computeNextProgress", () => {
  it("creates initial progress, if no query", () => {
    expect(computeNextProgress(null, 2, false)).toEqual({
      maxRoundReached: 2,
      isCompleted: false,
    });
  });

  it("increases maxRoundReached, when more rounds are completed", () => {
    expect(
      computeNextProgress({ maxRoundReached: 2, isCompleted: false }, 4, true),
    ).toEqual({
      maxRoundReached: 4,
      isCompleted: true,
    });
  });

  it("doesn't decrease maxRoundReached and doesn't drop isCompleted if played badly", () => {
    expect(
      computeNextProgress({ maxRoundReached: 5, isCompleted: true }, 1, false),
    ).toEqual({
      maxRoundReached: 5,
      isCompleted: true,
    });
  });
});