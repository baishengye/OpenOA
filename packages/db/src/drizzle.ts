import type { ItcDatabase } from './types';

// 不引入 @types/node：本模块只在 RN/Metro 运行时用 require 做懒加载。
declare const require: (id: string) => unknown;

/**
 * 可选：用 drizzle-orm 的 op-sqlite 驱动，基于一个已打开的 {@link ItcDatabase} 构造 Drizzle 实例。
 *
 * - @itc/db **不硬依赖** drizzle-orm（懒 require）：要用 ORM 就在业务层装 `drizzle-orm`，
 *   要裸 SQL 直接用 db.query / db.run。
 * - schema 由**业务层**提供（业务表定义不进 @itc/db）。
 * - 返回 unknown：调用方用自己 import 的 drizzle 类型收窄，例如
 *   `const d = createDrizzle(db, schema) as OPSQLiteDatabase<typeof schema>;`
 *
 * @example
 *   import { drizzle } from 'drizzle-orm/op-sqlite';  // 或用本函数
 *   const d = createDrizzle(db, schema) as ReturnType<typeof drizzle>;
 */
export function createDrizzle<TSchema extends Record<string, unknown>>(
  db: ItcDatabase,
  schema: TSchema
): unknown {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('drizzle-orm/op-sqlite') as {
    drizzle: (db: unknown, config: { schema: TSchema }) => unknown;
  };
  return mod.drizzle(db.raw, { schema });
}
