import { describe, it, expect } from "vitest";
import {
  assertValidUuid,
  validateLoginInput,
  validatePaginationInput,
  validateRegisterInput,
  validateUpdateCharactersInput,
} from "../../src/validation/validators.ts";
import { ValidationError } from "../../src/services/progressService.ts";

describe("validateRegisterInput", () => {
  it("нормалізує та повертає валідні дані реєстрації", () => {
    const res = validateRegisterInput({
      username: "  Danylo  ",
      email: "  Player@Example.COM  ",
      password: "strong-password-123",
    });

    expect(res).toEqual({
      username: "Danylo",
      email: "player@example.com",
      password: "strong-password-123",
    });
  });

  it("кидає ValidationError при некоректному username, email або паролі", () => {
    expect(() =>
      validateRegisterInput({
        username: "A",
        email: "player@example.com",
        password: "strong-password-123",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateRegisterInput({
        username: "Danylo",
        email: "not-an-email",
        password: "strong-password-123",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateRegisterInput({
        username: "Danylo",
        email: "player@example.com",
        password: "123",
      }),
    ).toThrow(ValidationError);
  });
});

describe("validateLoginInput", () => {
  it("нормалізує email та приймає валідні дані входу", () => {
    expect(
      validateLoginInput({
        email: "  User@Mail.UA ",
        password: "my-password",
      }),
    ).toEqual({
      email: "user@mail.ua",
      password: "my-password",
    });
  });

  it("кидає ValidationError при невалідному email або порожньому паролі", () => {
    expect(() =>
      validateLoginInput({ email: "invalid-email", password: "pw" }),
    ).toThrow(ValidationError);

    expect(() =>
      validateLoginInput({ email: "user@mail.ua", password: "" }),
    ).toThrow(ValidationError);
  });
});

describe("validateUpdateCharactersInput та assertValidUuid", () => {
  const playerId = "01933e2a-1111-7000-8000-000000000001";
  const maleCharacterId = "01933e2a-1111-7000-8000-000000000002";
  const femaleCharacterId = "01933e2a-1111-7000-8000-000000000003";

  it("повертає валідні UUID для гравця та персонажів", () => {
    expect(
      validateUpdateCharactersInput(playerId, {
        maleCharacterId,
        femaleCharacterId,
      }),
    ).toEqual({
      playerId,
      maleCharacterId,
      femaleCharacterId,
    });
  });

  it("кидає ValidationError при некоректному UUID", () => {
    expect(() => assertValidUuid("not-a-uuid", "playerId")).toThrow(
      ValidationError,
    );

    expect(() =>
      validateUpdateCharactersInput("bad-id", {
        maleCharacterId,
        femaleCharacterId,
      }),
    ).toThrow(ValidationError);
  });
});

describe("validatePaginationInput", () => {
  it("повертає дефолтні або валідні limit та offset", () => {
    expect(validatePaginationInput(undefined, undefined)).toEqual({
      limit: 10,
      offset: 0,
    });

    expect(validatePaginationInput("25", "15")).toEqual({
      limit: 25,
      offset: 15,
    });
  });

  it("кидає ValidationError при виході за межі або нецілих значеннях", () => {
    expect(() => validatePaginationInput("0", "0")).toThrow(ValidationError);
    expect(() => validatePaginationInput("101", "0")).toThrow(ValidationError);
    expect(() => validatePaginationInput("10", "-1")).toThrow(ValidationError);
    expect(() => validatePaginationInput("abc", "0")).toThrow(ValidationError);
  });
});