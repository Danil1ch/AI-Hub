import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** Flush Windows DNS client cache (same as `ipconfig /flushdns`). No admin typically required. */
export async function flushWindowsSystemDnsCache(): Promise<void> {
  if (process.platform !== 'win32') return
  try {
    await execFileAsync('ipconfig', ['/flushdns'], { windowsHide: true })
  } catch {
    /* best-effort; app DNS still applied via Electron */
  }
}
