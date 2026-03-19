/*
  Synthetic retrieval benchmark harness (Phase 5 scaffold).
  Simulates rank/package stage over large candidate sets to estimate CPU cost.
*/

function computeFinalScore(c) {
  const rel = Math.max(0, Math.min(1, c.sourceReliabilityScore || 0)) * 0.1
  const recent = c.isRecent ? 0.05 : 0
  return c.similarity + rel + recent
}

function generateCandidates(count) {
  const out = new Array(count)
  for (let i = 0; i < count; i += 1) {
    out[i] = {
      id: `r${i}`,
      similarity: Math.random(),
      sourceReliabilityScore: Math.random(),
      isRecent: i % 3 === 0,
      pageContent: `Synthetic content ${i}`,
      deviceId: `d${i % 100}`,
      title: `Reference ${i}`,
      sourceUrl: null,
      uploadedAt: new Date().toISOString(),
    }
  }
  return out
}

function rankAndPackage(candidates, topK, minScore) {
  return candidates
    .map((c) => ({ c, score: computeFinalScore(c) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => ({
      id: x.c.id,
      score: Number(x.score.toFixed(6)),
      text: x.c.pageContent,
      reference: {
        id: x.c.id,
        title: x.c.title,
        sourceUrl: x.c.sourceUrl,
        deviceId: x.c.deviceId,
        uploadedAt: x.c.uploadedAt,
      },
    }))
}

function runBench() {
  const refs = Number(process.env.BENCH_REFS || 10000)
  const topK = Number(process.env.BENCH_TOPK || 25)
  const minScore = Number(process.env.BENCH_MIN_SCORE || 0.35)

  const candidates = generateCandidates(refs)

  const start = process.hrtime.bigint()
  const results = rankAndPackage(candidates, topK, minScore)
  const end = process.hrtime.bigint()

  const ms = Number(end - start) / 1_000_000
  const memMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

  console.log(JSON.stringify({
    refs,
    topK,
    minScore,
    resultCount: results.length,
    durationMs: Number(ms.toFixed(3)),
    heapUsedMb: memMb,
  }, null, 2))
}

runBench()
