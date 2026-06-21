# @itc/db

可剥离复用的**本地 SQLite 基础设施层**。底层引擎 **op-sqlite**，三端：iOS/Android = `@op-engineering/op-sqlite`，鸿蒙 = `@react-native-ohos/op-sqlite`（移植）。

> 只提供「打开/加密 / 迁移 / 查询 / 事务」等**业务无关**机制；业务表 schema、repository、加密 key 的取用策略都由上层（app / `@itc-oa/data`）定义，单向依赖本模块。

## 在其他 app 中引入

**1. 加依赖**（op-sqlite / drizzle 由 app 直接持有，autolink 才扫得到）
```jsonc
// app/package.json
{
  "dependencies": {
    "@itc/base": "workspace:*",
    "@itc/db": "workspace:*",
    "@op-engineering/op-sqlite": "^...",
    "drizzle-orm": "^..."
  }
}
```

**2. 用法**
```ts
import { openDatabase, runMigrations, createDrizzle } from '@itc/db';

const db = await openDatabase({
  name: 'oa.db',
  encryptionKey,                 // 可选，SQLCipher 加密（见下方注意）
  migrations: [
    { version: 1, name: 'init', up: 'CREATE TABLE user (id INTEGER PRIMARY KEY, name TEXT)' },
    { version: 2, up: ['ALTER TABLE user ADD COLUMN age INTEGER', /* ... */] },
    { version: 3, up: async (tx) => { /* 复杂迁移：事务内跑任意逻辑 */ } },
  ],
});

const rows = await db.query<{ id: number; name: string }>('SELECT * FROM user WHERE age > ?', [18]);
const one  = await db.queryOne('SELECT * FROM user WHERE id = ?', [1]);
await db.run('INSERT INTO user (name) VALUES (?)', ['张三']);
await db.transaction(async (tx) => { await tx.run(/* ... */); /* 抛错则整体回滚 */ });
const ver = await db.getVersion();   // 已应用的最大迁移 version
db.close();

// 可选：drizzle ORM 视图
const orm = createDrizzle(db);
```

**3. 原生接入**
- **iOS**：`pod install`。**鸿蒙**：用 `@react-native-ohos/op-sqlite`，本模块 `opsqlite.harmony.ts` 经 Metro `.harmony` 扩展名自动选包；宿主 harmony 工程接 op-sqlite 移植包的 HAR + 在 RNOH 注册。

## API
| 出口 | 说明 |
|---|---|
| `openDatabase(opts): Promise<ItcDatabase>` | 打开/加密/自动迁移 |
| `runMigrations(db, migrations)` | 手动跑迁移（openDatabase 内部已用） |
| `createDrizzle(db)` | 返回 drizzle 实例 |
| `ItcDatabase` | `query/queryOne/run/transaction/getVersion/close` + `raw`（逃生舱：底层 op-sqlite DB） |

## 注意
- **SQLCipher 加密**：`encryptionKey` 透传 op-sqlite，但**必须 app 端 `package.json` 设 `op-sqlite.sqlcipher=true`** 才生效，否则忽略/报错。key 的来源（生物门控 / Keychain / HUKS）由业务层负责，`@itc/db` 不管理。
- 迁移 `version` 从 1 起**单调递增**，打开时按序应用未应用的；不支持降级。
- 事务**不支持嵌套**；`raw` 是逃生舱（prepareStatement/executeBatch/reactiveExecute/attach 等高级能力）。
- 失败抛 `@itc/base` 的 `ItcError`（`DB_OPEN_FAILED` / `DB_MIGRATION_FAILED` / `DB_QUERY_FAILED` / `DB_ENCRYPTION_INVALID`，5xxx 段）。
