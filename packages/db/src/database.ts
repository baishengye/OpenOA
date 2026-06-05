import { ItcError, ErrorCode } from '@itc/base';
import { open } from './opsqlite';
import type {
  ItcDatabase,
  OpenOptions,
  OpSqliteDB,
  QueryResult,
  Row,
  Scalar,
} from './types';
import { runMigrations } from './migrations';

const MODULE = 'db';

/** 任何带 execute 的执行体（op-sqlite 的 DB 与 Transaction 都满足）。 */
type Executor = {
  execute(sql: string, params?: Scalar[]): Promise<QueryResult>;
};

function dbError(code: ErrorCode, ctx: string, cause: unknown): ItcError {
  const msg = cause instanceof Error ? cause.message : String(cause);
  return new ItcError(code, `${ctx}: ${msg}`, { module: MODULE, cause });
}

class ItcDatabaseImpl implements ItcDatabase {
  /** @param exec 执行体（DB 或 Transaction）；@param db 顶层真实 DB，事务内为 null。 */
  constructor(
    private readonly exec: Executor,
    private readonly db: OpSqliteDB | null
  ) {}

  get raw(): OpSqliteDB {
    // 顶层返回真实 DB；事务内返回 Transaction 的结构兼容视图（有 execute）。
    return (this.db ?? this.exec) as unknown as OpSqliteDB;
  }

  async query<T = Row>(sql: string, params?: Scalar[]): Promise<T[]> {
    try {
      const r = await this.exec.execute(sql, params);
      return (r.rows ?? []) as T[];
    } catch (e) {
      throw dbError(ErrorCode.DB_QUERY_FAILED, sql, e);
    }
  }

  async queryOne<T = Row>(sql: string, params?: Scalar[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? (rows[0] as T) : null;
  }

  async run(
    sql: string,
    params?: Scalar[]
  ): Promise<{ rowsAffected: number; insertId?: number }> {
    try {
      const r = await this.exec.execute(sql, params);
      return { rowsAffected: r.rowsAffected, insertId: r.insertId };
    } catch (e) {
      throw dbError(ErrorCode.DB_QUERY_FAILED, sql, e);
    }
  }

  async transaction(fn: (tx: ItcDatabase) => Promise<void>): Promise<void> {
    if (!this.db) {
      throw new ItcError(ErrorCode.DB_QUERY_FAILED, '不支持嵌套事务', {
        module: MODULE,
      });
    }
    await this.db.transaction(async (tx) => {
      await fn(new ItcDatabaseImpl(tx, null));
    });
  }

  close(): void {
    this.db?.close();
  }

  async getVersion(): Promise<number> {
    try {
      const row = await this.queryOne<{ v: number }>(
        'SELECT COALESCE(MAX(version), 0) AS v FROM __itc_migrations'
      );
      return row?.v ?? 0;
    } catch {
      // 迁移元表尚未建立 → 版本 0。
      return 0;
    }
  }
}

/**
 * 打开（可加密的）SQLite 库，并按需应用迁移。失败抛 {@link ItcError}。
 *
 * @example
 *   const db = await openDatabase({
 *     name: 'oa.db',
 *     migrations: [{ version: 1, up: 'CREATE TABLE setting(k TEXT PRIMARY KEY, v TEXT)' }],
 *   });
 *   await db.run('INSERT OR REPLACE INTO setting VALUES (?, ?)', ['theme', 'dark']);
 *   const row = await db.queryOne<{ v: string }>('SELECT v FROM setting WHERE k = ?', ['theme']);
 */
export async function openDatabase(opts: OpenOptions): Promise<ItcDatabase> {
  if (!opts.name?.trim()) {
    throw new ItcError(ErrorCode.INVALID_ARGUMENT, 'openDatabase 需要非空 name', {
      module: MODULE,
    });
  }
  // op-sqlite 的 open 不接受值为 undefined 的可选键，故按需组装。
  const openOpts: { name: string; location?: string; encryptionKey?: string } = {
    name: opts.name,
  };
  if (opts.location !== undefined) openOpts.location = opts.location;
  if (opts.encryptionKey !== undefined) openOpts.encryptionKey = opts.encryptionKey;

  let raw: OpSqliteDB;
  try {
    raw = open(openOpts);
  } catch (e) {
    throw dbError(ErrorCode.DB_OPEN_FAILED, `打开数据库 ${opts.name}`, e);
  }
  const db = new ItcDatabaseImpl(raw, raw);
  if (opts.migrations && opts.migrations.length > 0) {
    await runMigrations(db, opts.migrations);
  }
  return db;
}
