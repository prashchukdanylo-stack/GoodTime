#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/02320f6e50f94a4dc2d2df06002272d39a4d039ff779222fd7945542e6f81fd3/contract';
import endContract from '../../snapshots/02320f6e50f94a4dc2d2df06002272d39a4d039ff779222fd7945542e6f81fd3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f23b18f6f60db501b460a0be275245751c818b793d12fdd340210442f48a337f/contract';
import startContract from '../../snapshots/f23b18f6f60db501b460a0be275245751c818b793d12fdd340210442f48a337f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'player',
        column: 'password',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
