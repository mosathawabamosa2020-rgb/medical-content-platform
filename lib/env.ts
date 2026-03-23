import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(8),
  OPEN_SOURCE_MODE: z.enum(['true', 'false']).optional().default('true'),
  OPENAI_API_KEY: z.string().min(10).optional(),
  REDIS_URL: z.string().url().optional(),
  SERPAPI_KEY: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.OPEN_SOURCE_MODE === 'false' && !val.OPENAI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['OPENAI_API_KEY'],
      message: 'Required when OPEN_SOURCE_MODE=false',
    })
  }
})

export const env = envSchema.safeParse(process.env)
if (!env.success) {
  const issues = env.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')

  const isCI = process.env.CI === 'true'

  if (process.env.NODE_ENV === 'test' || isCI) {
    console.warn('Environment validation issues (SAFE MODE):', issues)
  } else {
    throw new Error(`Environment validation failed: ${issues}`)
  }
}

export type Env = z.infer<typeof envSchema>

export default env.data
