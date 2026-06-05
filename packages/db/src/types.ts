import type { DB, QueryResult, Scalar } from './opsqlite';

/** op-sqlite 的底层 DB 句柄类型（逃生舱用）。 */
export type OpSqliteDB = DB;
export type { Scalar, QueryResult };

/** 一行：列名 → 标量值。 */
export type Row = Record<string, Scalar>;

/**
 * 一次版本化迁移。version 单调递增（从 1 起），打开库时按序应用未应用的迁移。
 * up 支持单条 SQL / 多条 SQL / 函数（复杂迁移，可用事务内的 db 跑任意逻辑）。
 */
export interface Migration {
  version: number;
  name?: string;
  up: string | string[] | ((db: ItcDatabase) => Promise<void>);
}

/** openDatabase 入参。 */
export interface OpenOptions {
  /** 数据库文件名。 */
  name: string;
  /**
   * SQLCipher 加密 key。透传 op-sqlite；**需 app 端 package.json 的 op-sqlite.sqlcipher=true** 才生效，
   * 否则忽略/报错。key 的来源（生物门控/Keychain/HUKS）由业务层负责，@itc/db 不管理。
   */
  encryptionKey?: string;
  /** 库文件目录（默认 op-sqlite 的默认目录）。 */
  location?: string;
  /** 打开时自动应用的迁移列表（按 version 升序应用未应用的）。 */
  migrations?: Migration[];
}

/**
 * 业务无关的数据库句柄。query/run 是常用读写；raw 是逃生舱（prepareStatement/executeBatch/
 * reactiveExecute/attach 等高级能力）。所有方法异步（op-sqlite execute 异步）。
 */
export interface ItcDatabase {
  /** 取多行。 */
  query<T = Row>(sql: string, params?: Scalar[]): Promise<T[]>;
  /** 取首行，无则 null。 */
  queryOne<T = Row>(sql: string, params?: Scalar[]): Promise<T | null>;
  /** 执行写入（INSERT/UPDATE/DELETE/DDL），返回影响行数与 insertId。 */
  run(sql: string, params?: Scalar[]): Promise<{ rowsAffected: number; insertId?: number }>;
  /** 事务：fn 内用传入的 tx 句柄执行；fn 抛错则整体回滚。不支持嵌套。 */
  transaction(fn: (tx: ItcDatabase) => Promise<void>): Promise<void>;
  /** 逃生舱：底层 op-sqlite DB（顶层为真实 DB，事务内为 Transaction 的结构兼容视图）。 */
  readonly raw: OpSqliteDB;
  /** 关闭连接。 */
  close(): void;
  /** 当前 schema 版本（已应用的最大迁移 version；无迁移表则 0）。 */
  getVersion(): Promise<number>;
}
