import { ValidationError } from "../services/progressService.ts";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidUuid(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !UUID_REGEX.test(value.trim())) {
    throw new ValidationError(`invalid ${fieldName}`);
  }
  return value.trim();
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export function validateRegisterInput(input:unknown): RegisterInput {
    const body = (input && typeof input === "object" ? input : {}) as Record<string,unknown>;
    const rawUsername = typeof body.username === "string" ? body.username.trim() : "";
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (rawUsername.length < 2 || rawUsername.length > 50) {
        throw new ValidationError("username must be between 2 and 50 characters");
    }
    if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 255) {
    throw new ValidationError("invalid email");
  }
  if (password.length < 6 || password.length > 128) {
    throw new ValidationError("password must be between 6 and 128 characters");
  }

  return {
    username: rawUsername,
    email: rawEmail,
    password,
  };
}

export interface LoginInput {
  email: string;
  password: string;
}


export function validateLoginInput(input: unknown): LoginInput {
  const body = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new ValidationError("invalid email");
  }
  if (!password) {
    throw new ValidationError("password is required");
  }

  return { email, password };
}

export interface UpdateCharactersInput {
  playerId: string;
  maleCharacterId: string;
  femaleCharacterId: string;
}

export function validateUpdateCharactersInput(
  playerId: unknown,
  bodyInput: unknown,
): UpdateCharactersInput {
  const validPlayerId = assertValidUuid(playerId, "playerId");
  const body = (
    bodyInput && typeof bodyInput === "object" ? bodyInput : {}
  ) as Record<string, unknown>;

  const maleCharacterId = assertValidUuid(
    body.maleCharacterId,
    "maleCharacterId",
  );
  const femaleCharacterId = assertValidUuid(
    body.femaleCharacterId,
    "femaleCharacterId",
  );

  return {
    playerId: validPlayerId,
    maleCharacterId,
    femaleCharacterId,
  };
}

export interface PaginationInput {
  limit: number;
  offset: number;
}

export function validatePaginationInput(
  limitParam: unknown,
  offsetParam: unknown = 0,
): PaginationInput {
  const rawLimit =
    limitParam === undefined || limitParam === "" ? 10 : Number(limitParam);
  const rawOffset =
    offsetParam === undefined || offsetParam === "" ? 0 : Number(offsetParam);

  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
    throw new ValidationError("limit must be an integer between 1 and 100");
  }
  if (!Number.isInteger(rawOffset) || rawOffset < 0) {
    throw new ValidationError("offset must be a non-negative integer");
  }

  return { limit: rawLimit, offset: rawOffset };
}