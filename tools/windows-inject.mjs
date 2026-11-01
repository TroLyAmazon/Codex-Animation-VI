import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {buildInjection} from '../extension/payload.mjs';
import {connect, localSocket, pageTarget} from '../extension/cdp.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.argv[2]);
const action = process.argv[3] || 'install';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Cổng kết nối nội bộ không hợp lệ.');
if (!['install', 'status', 'restore', 'settings', 'replay'].includes(action)) throw new Error('Thao tác không hợp lệ.');

async function main() {
  const source = action === 'install' ? await buildInjection(root) : null;
  const deadline = Date.now() + 45000;
  let lastError;
  while (Date.now() < deadline) {
    let client;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`, {
        signal: AbortSignal.timeout(1500), redirect: 'error'
      });
      if (!response.ok) throw new Error(`Cổng kết nối trả về mã ${response.status}.`);
      const targets = await response.json();
      const target = Array.isArray(targets) && targets.find(pageTarget);
      if (!target) throw new Error('Đang chờ cửa sổ Codex chính.');
      client = await connect(localSocket(target.webSocketDebuggerUrl, port));
      async function evaluate(expression) {
        const result = await client.call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result?.value;
      }
      if (action === 'install') {
        const result = await evaluate(source);
        if (!result?.installed) throw new Error('Không cài được lớp giao diện.');
        if (result.alreadyActive) await evaluate('window.__aemeathExtension.replay?.()');
        for (let attempt = 0; attempt < 160; attempt++) {
          const state = await evaluate('window.__aemeathExtension?.status()');
          if (state?.ready) {console.log(JSON.stringify({installed: true, ...state})); return;}
          if (['failed', 'timeout'].includes(state?.phase)) throw new Error(`Hoạt ảnh gặp lỗi (${state.phase === "timeout" ? "quá thời gian chờ" : "không tải được tài nguyên"}).`);
          await delay(100);
        }
        throw new Error('Hoạt ảnh chưa báo sẵn sàng.');
      }
      if (action === 'restore') await evaluate('window.__aemeathExtension?.dispose()');
      if (action === 'settings') await evaluate('window.__aemeathExtension?.openSettings()');
      if (action === 'replay') await evaluate('window.__aemeathExtension?.replay()');
      console.log(JSON.stringify(await evaluate('window.__aemeathExtension?.status() || {installed:false}')));
      return;
    } catch (error) {lastError = error;}
    finally {client?.close();}
    await delay(250);
  }
  throw lastError || new Error('Quá thời gian chờ kết nối Codex.');
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
