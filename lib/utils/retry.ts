export type RetryOptions = {
  maxAttempts?: number
  delayMs?: number
  timeoutMs?: number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error('retry_timeout')), timeoutMs)
  })
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

export async function withRetry<T>(fn: () => Promise<T>, opts?: RetryOptions): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? 3
  const delayMs = opts?.delayMs ?? 1000
  const timeoutMs = opts?.timeoutMs ?? 30000

  let lastError: unknown = null
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await withTimeout(fn(), timeoutMs)
    } catch (err) {
      lastError = err
      if (attempt === maxAttempts) break
      const backoff = delayMs * Math.pow(2, attempt - 1)
      await sleep(backoff)
    }
  }
  throw lastError
}

