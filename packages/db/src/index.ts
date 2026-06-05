/**
 * @itc/db —— 可剥离复用的本地 SQLite 基础设施层。
 *
 * 底层引擎 op-sqlite（三端：iOS/Android = @op-engineering，鸿蒙 = @react-native-ohos 移植）。
 * 只提供「打开/加密 / 迁移 / 查询 / 事务」等**业务无关**机制；业务表 schema、repository、
 * 加密 key 的取用策略都由上层（app / @itc-oa/data）定义，单向依赖本模块。
 */
export { openDatabase } from './database';
export { runMigrations } from './migrations';
export { createDrizzle } from './drizzle';
export type {
  ItcDatabase,
  OpenOptions,
  Migration,
  Row,
  Scalar,
  OpSqliteDB,
  QueryResult,
} from './types';
