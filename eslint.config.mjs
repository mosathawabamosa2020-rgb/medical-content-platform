import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  {
    ignores: [
      '.next/**',
      '.next-build/**',
      'dist/**',
      'archive/**',
      'node_modules/**',
      '__tests__/**',
      'tools/**',
      'scripts/**',
      'benchmarks/**',
      'artifacts/**',
      'MedicalBot/**',
      'tmp_*.js',
      'prisma/seed.ts',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
