#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/29942b5afae9a0023b71058472d0891c671f3bceb646fbe7982281f249bcf886/contract';
import endContract from '../../snapshots/29942b5afae9a0023b71058472d0891c671f3bceb646fbe7982281f249bcf886/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'character',
        columns: [
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('gender', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'character_gender_check_f90b1c49',
            sql`"gender" IN ('male', 'female', 'other')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'game_session',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('level_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('player_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('rounds_completed', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('won', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('game_session_level_positive_c5796794', sql`level_id >= 1`),
          checkExpression('game_session_rounds_not_negative_0c4bee96', sql`rounds_completed >= 0`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'player',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('female_character_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('male_character_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('username', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'player_level_progress',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('is_completed', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('level_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('max_round_reached', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('player_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('progress_level_positive_c5796794', sql`level_id >= 1`),
          checkExpression('progress_max_round_not_negative_43c41a08', sql`max_round_reached >= 0`),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'character',
        constraint: 'character_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'player',
        constraint: 'player_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'player_level_progress',
        constraint: 'player_level_progress_player_id_level_id_key',
        columns: ['player_id', 'level_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'game_session',
        index: 'game_session_player_id_idx_9eca16c7',
        columns: ['player_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'game_session',
        index: 'game_session_player_id_level_id_idx_02d62edd',
        columns: ['player_id', 'level_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player',
        index: 'player_female_character_id_idx_b29679a6',
        columns: ['female_character_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player',
        index: 'player_male_character_id_idx_5efe68c1',
        columns: ['male_character_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player_level_progress',
        index: 'player_level_progress_player_id_idx_9eca16c7',
        columns: ['player_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'game_session',
        foreignKey: {
          name: 'game_session_player_id_fkey',
          columns: ['player_id'],
          references: { schema: 'public', table: 'player', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player',
        foreignKey: {
          name: 'player_male_character_id_fkey',
          columns: ['male_character_id'],
          references: { schema: 'public', table: 'character', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player',
        foreignKey: {
          name: 'player_female_character_id_fkey',
          columns: ['female_character_id'],
          references: { schema: 'public', table: 'character', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player_level_progress',
        foreignKey: {
          name: 'player_level_progress_player_id_fkey',
          columns: ['player_id'],
          references: { schema: 'public', table: 'player', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
