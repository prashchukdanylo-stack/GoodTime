#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/29942b5afae9a0023b71058472d0891c671f3bceb646fbe7982281f249bcf886/contract';
import startContract from '../../snapshots/29942b5afae9a0023b71058472d0891c671f3bceb646fbe7982281f249bcf886/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ebfc90e3be3226a0da7ad14109aaf1343b46e367cc5409e872dd1f8a0635b643/contract';
import endContract from '../../snapshots/ebfc90e3be3226a0da7ad14109aaf1343b46e367cc5409e872dd1f8a0635b643/contract.json' with { type: 'json' };
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

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'game_session',
        constraint: 'game_session_player_id_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'player_level_progress',
        constraint: 'player_level_progress_player_id_fkey',
        kind: 'foreignKey',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'game_session',
        constraint: 'game_session_level_positive_c5796794',
      }),
      this.dropCheckConstraint({
        schema: 'public',
        table: 'player_level_progress',
        constraint: 'progress_level_positive_c5796794',
      }),
      this.createTable({
        schema: 'public',
        table: 'item',
        columns: [
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('level_id', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'level',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('district', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('total_rounds', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('level_total_rounds_positive_743fb9cf', sql`total_rounds >= 1`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'player_item',
        columns: [
          col('acquired_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('item_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('player_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('quantity', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('player_item_quantity_positive_4402679f', sql`quantity > 0`),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'game_session',
        column: col('status', 'text', {
          notNull: true,
          default: lit('in_progress'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'player',
        column: col('deleted_at', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'game_session',
        column: col('rounds_completed', 'int4', {
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'game_session',
        column: col('won', 'bool', { default: lit(false), codecRef: { codecId: 'pg/bool@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'game_session',
        constraint: 'game_session_status_check_e1e5f308',
        expression: sql`"status" IN ('in_progress', 'completed', 'abandoned')`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'item',
        constraint: 'item_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'level',
        constraint: 'level_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'player_item',
        constraint: 'player_item_player_id_item_id_key',
        columns: ['player_id', 'item_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'game_session',
        index: 'game_session_level_id_created_at_idx_a88f0339',
        columns: ['level_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'game_session',
        index: 'game_session_level_id_idx_9ce36ea1',
        columns: ['level_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'item',
        index: 'item_level_id_idx_9ce36ea1',
        columns: ['level_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player',
        index: 'player_deleted_at_idx_4179a3b2',
        columns: ['deleted_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player_item',
        index: 'player_item_item_id_idx_4b8ce5fb',
        columns: ['item_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player_item',
        index: 'player_item_player_id_idx_9eca16c7',
        columns: ['player_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'player_level_progress',
        index: 'player_level_progress_level_id_idx_9ce36ea1',
        columns: ['level_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'game_session',
        foreignKey: {
          name: 'game_session_player_id_fkey',
          columns: ['player_id'],
          references: { schema: 'public', table: 'player', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'item',
        foreignKey: {
          name: 'item_level_id_fkey',
          columns: ['level_id'],
          references: { schema: 'public', table: 'level', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'game_session',
        foreignKey: {
          name: 'game_session_level_id_fkey',
          columns: ['level_id'],
          references: { schema: 'public', table: 'level', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player_item',
        foreignKey: {
          name: 'player_item_player_id_fkey',
          columns: ['player_id'],
          references: { schema: 'public', table: 'player', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player_item',
        foreignKey: {
          name: 'player_item_item_id_fkey',
          columns: ['item_id'],
          references: { schema: 'public', table: 'item', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player_level_progress',
        foreignKey: {
          name: 'player_level_progress_level_id_fkey',
          columns: ['level_id'],
          references: { schema: 'public', table: 'level', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'player_level_progress',
        foreignKey: {
          name: 'player_level_progress_player_id_fkey',
          columns: ['player_id'],
          references: { schema: 'public', table: 'player', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
