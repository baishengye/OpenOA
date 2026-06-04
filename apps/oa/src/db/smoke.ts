/**
 * op-sqlite 三端冒烟测试：open → create → insert → select → close。
 *
 * 懒加载（require 在函数内）：未接入原生的平台（如尚未手动接线的鸿蒙）会在
 * require/open 时抛错并被捕获，只在 DB 页报"未接入"，不拖垮整个 App。
 */
export interface SmokeResult {
  ok: boolean;
  lines: string[];
}

export async function runDbSmoke(): Promise<SmokeResult> {
  const lines: string[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const opsqlite = require('@op-engineering/op-sqlite');
    const open: (opts: { name: string }) => any = opsqlite.open;

    const db = open({ name: 'oa-smoke.db' });
    lines.push('✅ open(oa-smoke.db)');

    // op-sqlite 的 execute 为异步（返回 Promise），必须 await。
    await db.execute(
      'CREATE TABLE IF NOT EXISTS smoke (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT, ts INTEGER)'
    );
    lines.push('✅ create table');

    const v0 = `hello-${Date.now()}`;
    await db.execute('INSERT INTO smoke (v, ts) VALUES (?, ?)', [v0, Date.now()]);
    lines.push('✅ insert 1 row');

    const res = await db.execute('SELECT COUNT(*) AS n FROM smoke');
    const rows = res?.rows;
    const first = (Array.isArray(rows) ? rows[0] : rows?._array?.[0]) as
      | { n?: number }
      | undefined;
    lines.push(`✅ select count = ${first?.n}`);

    const last = await db.execute('SELECT v FROM smoke ORDER BY id DESC LIMIT 1');
    const lastRows = last?.rows;
    const lastRow = (Array.isArray(lastRows) ? lastRows[0] : lastRows?._array?.[0]) as
      | { v?: string }
      | undefined;
    lines.push(`✅ last v = ${lastRow?.v} (写入=${v0})`);

    db.close();
    lines.push('✅ close · op-sqlite 正常');
    return { ok: true, lines };
  } catch (e) {
    lines.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
    lines.push('（该平台原生未接入 op-sqlite，或运行时报错）');
    return { ok: false, lines };
  }
}
