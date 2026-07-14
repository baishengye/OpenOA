# @itc/db 模块规范

## 概述

**@itc/db** 是 OpenOA 项目的本地 SQLite 基础设施层，封装 op-sqlite 三端实现。只提供业务无关的基础能力：打开/加密数据库、版本化迁移、查询执行、事务支持。

**核心职责：**
- 封装 op-sqlite 底层引擎（三端统一 API）
- 提供数据库打开与加密能力
- 实现版本化迁移 runner（幂等）
- 提供事务支持（嵌套事务不支持）
- 可选集成 drizzle-orm（懒加载）

**设计原则：**
- 零业务：业务表 schema、repository、加密 key 来源均由上层定义
- 懒加载 drizzle-orm：要使用 ORM 在业务层安装依赖
- 依赖单向：业务层依赖 @itc/db，@itc/db 不依赖业务层

---

## 2. 核心类型

### 2.1 ItcDatabase 接口

```typescript
interface ItcDatabase {
  /** 取多行 */
  query<T = Row>(sql: string, params?: Scalar[]): Promise<T[]>;

  /** 取首行，无则 null */
  queryOne<T = Row>(sql: string, params?: Scalar[]): Promise<T | null>;

  /** 执行写入（INSERT/UPDATE/DELETE/DDL），返回影响行数与 insertId */
  run(sql: string, params?: Scalar[]): Promise<{ rowsAffected: number; insertId?: number }>;

  /** 事务：fn 抛错则整体回滚。不支持嵌套 */
  transaction(fn: (tx: ItcDatabase) => Promise<void>): Promise<void>;

  /** 逃生舱：底层 op-sqlite DB */
  readonly raw: OpSqliteDB;

  /** 关闭连接 */
  close(): void;

  /** 当前 schema 版本（无迁移表则 0） */
  getVersion(): Promise<number>;
}
```

### 2.2 配置类型

```typescript
interface OpenOptions {
  /** 数据库文件名 */
  name: string;

  /**
   * SQLCipher 加密 key。透传 op-sqlite；
   * 需 app 端 package.json 的 op-sqlite.sqlcipher=true 才生效。
   * key 来源（生物门控/Keychain/HUKS）由业务层负责。
   */
  encryptionKey?: string;

  /** 库文件目录（默认 op-sqlite 默认目录） */
  location?: string;

  /** 打开时自动应用的迁移列表 */
  migrations?: Migration[];
}

interface Migration {
  version: number;        // 单调递增，从 1 起
  name?: string;          // 可选迁移名称
  up: string | string[] | ((db: ItcDatabase) => Promise<void>);
}
```

### 2.3 基础类型

```typescript
/** 一行：列名 → 标量值 */
type Row = Record<string, Scalar>;

/** op-sqlite 底层 DB 句柄（逃生舱） */
type OpSqliteDB = DB;

/** op-sqlite 查询结果 */
type QueryResult = {
  rows?: Row[];
  rowsAffected?: number;
  insertId?: number;
};
```

---

## 3. 导出 API

### 3.1 打开数据库

```typescript
/**
 * 打开（可加密的）SQLite 库，并按需应用迁移。
 * @example
 *   const db = await openDatabase({
 *     name: 'oa.db',
 *     migrations: [{ version: 1, up: 'CREATE TABLE setting(k TEXT PRIMARY KEY, v TEXT)' }],
 *   });
 */
export async function openDatabase(opts: OpenOptions): Promise<ItcDatabase>;
```

### 3.2 迁移运行器

```typescript
/**
 * 版本化迁移 runner（幂等）。
 * 建元表 __itc_migrations，按 version 升序应用尚未应用的迁移。
 * 全部在一个事务里执行，任一失败回滚。
 */
export async function runMigrations(
  db: ItcDatabase,
  migrations: Migration[]
): Promise<void>;
```

### 3.3 Drizzle ORM 集成

```typescript
/**
 * 可选：用 drizzle-orm 的 op-sqlite 驱动，基于 ItcDatabase 构造 Drizzle 实例。
 * - @itc/db 不硬依赖 drizzle-orm（懒 require）
 * - schema 由业务层提供
 * @example
 *   import { drizzle } from 'drizzle-orm/op-sqlite';
 *   const d = createDrizzle(db, schema) as OPSqliteDatabase<typeof schema>;
 */
export function createDrizzle<TSchema extends Record<string, unknown>>(
  db: ItcDatabase,
  schema: TSchema
): unknown;
```

---

## 4. 内部实现

### 4.1 目录结构

```
packages/db/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           # 主入口：导出全部公开 API
    ├── database.ts        # openDatabase + ItcDatabaseImpl
    ├── migrations.ts      # runMigrations（版本化迁移 runner）
    ├── drizzle.ts         # createDrizzle（可选 ORM）
    ├── types.ts           # 类型定义（ItcDatabase / Migration / Row 等）
    ├── opsqlite.ts        # Android/iOS：@op-engineering/op-sqlite
    └── opsqlite.harmony.ts # 鸿蒙：@react-native-ohos/op-sqlite
```

### 4.2 ItcDatabaseImpl 类

```typescript
class ItcDatabaseImpl implements ItcDatabase {
  constructor(
    private readonly exec: Executor,   // DB 或 Transaction
    private readonly db: OpSqliteDB | null  // 顶层为真实 DB，事务内为 null
  ) {}

  get raw(): OpSqliteDB {
    // 顶层返回真实 DB；事务内返回 Transaction 的结构兼容视图
    return (this.db ?? this.exec) as unknown as OpSqliteDB;
  }

  async query<T = Row>(sql: string, params?: Scalar[]): Promise<T[]>;
  async queryOne<T = Row>(sql: string, params?: Scalar[]): Promise<T | null>;
  async run(sql: string, params?: Scalar[]): Promise<{ rowsAffected: number; insertId?: number }>;
  async transaction(fn: (tx: ItcDatabase) => Promise<void>): Promise<void>;
  close(): void;
  async getVersion(): Promise<number>;
}
```

### 4.3 迁移元表

- 表名：`__itc_migrations`
- 结构：`version INTEGER PRIMARY KEY, name TEXT, applied_at INTEGER`
- 版本查询：`SELECT COALESCE(MAX(version), 0) AS v FROM __itc_migrations`

### 4.4 错误处理

| 场景 | ErrorCode | 抛出时机 |
|------|-----------|----------|
| 打开数据库失败 | `DB_OPEN_FAILED` | op-sqlite open() 抛错 |
| 查询/执行失败 | `DB_QUERY_FAILED` | query/run/transaction 抛错 |
| 迁移版本非法 | `DB_MIGRATION_FAILED` | version 非正整数或重复 |
| 嵌套事务 | `DB_QUERY_FAILED` | transaction 内再调用 transaction |

---

## 5. 平台差异

### 5.1 op-sqlite 包映射

| 平台 | npm 包 | 入口文件 |
|------|--------|----------|
| Android | `@op-engineering/op-sqlite` | `src/opsqlite.ts` |
| iOS | `@op-engineering/op-sqlite` | `src/opsqlite.ts` |
| 鸿蒙 NEXT | `@react-native-ohos/op-sqlite` | `src/opsqlite.harmony.ts` |

**Metro 平台选择机制：**
- `.harmony.ts` 后缀在 `platform=harmony` 时优先
- 类型检查走 `opsqlite.ts`（基于 @op-engineering/op-sqlite）

### 5.2 加密支持

- 需要 app 层在 `package.json` 中声明 `"op-sqlite.sqlcipher": true`
- 加密 key 通过 `encryptionKey` 透传给 op-sqlite
- key 的来源策略（生物门控 / Keychain / HUKS）由业务层决定

---

## 6. 依赖关系

**peerDependencies：**
- `@itc/base`：依赖 `ItcError`、`ErrorCode`
- `@op-engineering/op-sqlite`：>= 14.0.0（Android/iOS）
- `@react-native-ohos/op-sqlite`：>= 14.0.0（鸿蒙，可选）
- `drizzle-orm`：*（可选，懒加载）
- `react-native`：>= 0.77.0

**peerDependenciesMeta：**
- `drizzle-orm`：{ optional: true }
- `@react-native-ohos/op-sqlite`：{ optional: true }

**内部依赖：**
- `@itc/base`（workspace）

---

## 7. 使用示例

### 7.1 基本使用（裸 SQL）

```typescript
import { openDatabase } from '@itc/db';

const db = await openDatabase({
  name: 'oa.db',
  migrations: [
    {
      version: 1,
      name: 'init_setting',
      up: 'CREATE TABLE setting(k TEXT PRIMARY KEY, v TEXT)',
    },
    {
      version: 2,
      name: 'init_user',
      up: [
        'CREATE TABLE user(id TEXT PRIMARY KEY, name TEXT)',
        'CREATE INDEX idx_user_name ON user(name)',
      ],
    },
  ],
});

// 查询
const rows = await db.query<{ k: string; v: string }>('SELECT * FROM setting');

// 单行查询
const row = await db.queryOne<{ k: string; v: string }>(
  'SELECT * FROM setting WHERE k = ?',
  ['theme']
);

// 写入
await db.run('INSERT OR REPLACE INTO setting VALUES (?, ?)', ['theme', 'dark']);

// 事务
await db.transaction(async (tx) => {
  await tx.run('INSERT INTO user VALUES (?, ?)', ['1', 'Alice']);
  await tx.run('INSERT INTO user VALUES (?, ?)', ['2', 'Bob']);
});

// 关闭
db.close();
```

### 7.2 复杂迁移（函数式）

```typescript
import { openDatabase } from '@itc/db';

const db = await openDatabase({
  name: 'oa.db',
  migrations: [
    {
      version: 1,
      name: 'data_migration',
      up: async (tx) => {
        // 复杂迁移逻辑
        const count = await tx.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM old_table');
        if (count && count.c > 0) {
          await tx.run(`INSERT INTO new_table SELECT * FROM old_table`);
          await tx.run('DROP TABLE old_table');
        }
      },
    },
  ],
});
```

### 7.3 Drizzle ORM（可选）

```typescript
import { openDatabase, createDrizzle } from '@itc/db';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const schema = {
  users: sqliteTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
  }),
};

const db = await openDatabase({ name: 'app.db' });
const drizzle = createDrizzle(db, schema) as ReturnType<typeof import('drizzle-orm/op-sqlite')['drizzle']>;

// 使用 Drizzle API
// await drizzle.insert(schema.users).values({ id: '1', name: 'Alice' });
```

### 7.4 逃生舱（raw）

```typescript
import { openDatabase } from '@itc/db';

const db = await openDatabase({ name: 'app.db' });

// 访问 op-sqlite 高级 API
const stmt = db.raw.prepareStatement('SELECT * FROM users WHERE id = ?');
const result = await stmt.execute(['1']);
```

---

## 8. 与业务层的关系

```
┌─────────────────────────────────────────────────────────────┐
│                        业务层 / app                          │
│  - 定义业务表 schema                                         │
│  - 定义 repository（仓储）                                   │
│  - 管理加密 key 来源（生物门控/Keychain/HUKS）               │
│  - 调用 openDatabase() 打开业务库                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       @itc/db                                │
│  - openDatabase() 打开数据库                                 │
│  - runMigrations() 版本化迁移                                │
│  - query/run/transaction 执行 SQL                            │
│  - createDrizzle() 可选 ORM                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       op-sqlite                              │
│  - Android/iOS: @op-engineering/op-sqlite                   │
│  - 鸿蒙: @react-native-ohos/op-sqlite                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. 注意事项

1. **零业务**：@itc/db 不定义任何业务表，业务表由业务层在仓库层面定义
2. **嵌套事务不支持**：事务内调用 transaction 会抛出 `DB_QUERY_FAILED` 错误
3. **懒加载 drizzle-orm**：不使用 ORM 时无需安装 drizzle-orm 依赖
4. **加密需 app 层配合**：需在 app 的 `package.json` 声明 `"op-sqlite.sqlcipher": true`
5. **版本号从 1 开始**：迁移 version 必须 >= 1
6. **幂等迁移**：重复调用 runMigrations 只会应用新增的迁移，已应用的不会重复执行
7. **迁移事务**：所有 pending 迁移在一个事务内执行，任一失败全部回滚
