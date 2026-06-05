/**
 * @itc/db 冒烟测试：openDatabase（含迁移建表）→ run insert → query → close。
 * 验证 @itc/db 基础设施层三端可用（op-sqlite 在底层）。
 */
import { openDatabase } from '@itc/db';

export interface SmokeResult {
  ok: boolean;
  lines: string[];
}

export async function runDbSmoke(): Promise<SmokeResult> {
  const lines: string[] = [];
  try {
    const db = await openDatabase({
      name: 'oa-smoke.db',
      migrations: [
        {
          version: 1,
          name: 'create-smoke',
          up: 'CREATE TABLE IF NOT EXISTS smoke (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT, ts INTEGER)',
        },
      ],
    });
    lines.push(`✅ openDatabase（schema version=${await db.getVersion()}）`);

    const v0 = `hello-${Date.now()}`;
    await db.run('INSERT INTO smoke (v, ts) VALUES (?, ?)', [v0, Date.now()]);
    lines.push('✅ run insert');

    const cnt = await db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM smoke');
    lines.push(`✅ query count = ${cnt?.n}`);

    const last = await db.queryOne<{ v: string }>(
      'SELECT v FROM smoke ORDER BY id DESC LIMIT 1'
    );
    lines.push(`✅ last v = ${last?.v} (写入=${v0})`);

    db.close();
    lines.push('✅ close · @itc/db 正常');
    return { ok: true, lines };
  } catch (e) {
    lines.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
    lines.push('（该平台 op-sqlite 原生未接入，或运行时报错）');
    return { ok: false, lines };
  }
}
