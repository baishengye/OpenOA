import { ItcError, ErrorCode } from '@itc/base';
import type { ItcDatabase, Migration } from './types';

const MODULE = 'db';

/**
 * 版本化迁移 runner（幂等）。建元表 __itc_migrations，按 version 升序应用尚未应用的迁移，
 * 全部在一个事务里执行（任一失败回滚）。重复调用只应用新增的。
 */
export async function runMigrations(
  db: ItcDatabase,
  migrations: Migration[]
): Promise<void> {
  // 校验 version 唯一且为正整数。
  const seen = new Set<number>();
  for (const m of migrations) {
    if (!Number.isInteger(m.version) || m.version < 1) {
      throw new ItcError(
        ErrorCode.DB_MIGRATION_FAILED,
        `迁移 version 必须为 >=1 的整数，得到 ${m.version}`,
        { module: MODULE }
      );
    }
    if (seen.has(m.version)) {
      throw new ItcError(
        ErrorCode.DB_MIGRATION_FAILED,
        `迁移 version 重复：${m.version}`,
        { module: MODULE }
      );
    }
    seen.add(m.version);
  }

  try {
    await db.run(
      'CREATE TABLE IF NOT EXISTS __itc_migrations (version INTEGER PRIMARY KEY, name TEXT, applied_at INTEGER)'
    );
    const current = await db.getVersion();
    const pending = migrations
      .filter((m) => m.version > current)
      .sort((a, b) => a.version - b.version);
    if (pending.length === 0) return;

    await db.transaction(async (tx) => {
      for (const m of pending) {
        await applyUp(tx, m);
        await tx.run(
          'INSERT INTO __itc_migrations (version, name, applied_at) VALUES (?, ?, ?)',
          [m.version, m.name ?? '', Date.now()]
        );
      }
    });
  } catch (e) {
    if (e instanceof ItcError) throw e;
    throw new ItcError(ErrorCode.DB_MIGRATION_FAILED, '迁移执行失败', {
      module: MODULE,
      cause: e,
    });
  }
}

async function applyUp(tx: ItcDatabase, m: Migration): Promise<void> {
  const up = m.up;
  if (typeof up === 'function') {
    await up(tx);
    return;
  }
  const stmts = Array.isArray(up) ? up : [up];
  for (const sql of stmts) {
    await tx.run(sql);
  }
}
