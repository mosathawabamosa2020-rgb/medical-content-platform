# ADR-010: Pages Router Retained Through 2026 H1

Date: 2026-03-24
Status: Accepted
Deciders: Technical Founder

## Context
The existing platform is built on Next.js Pages Router with broad route and SSR usage across admin and API surfaces.

## Decision
Retain Pages Router through 2026 H1 and defer App Router migration to H2 2026 evaluation.

## Rationale
1. Current admin surfaces rely on `getServerSideProps`-based SSR auth guards.
2. Existing API and operational flows are Pages Router-native.
3. Immediate migration risk and scope are high relative to near-term roadmap value.

## Consequences
1. New pages should continue using Pages Router patterns.
2. SSR auth remains standardized on `getServerSession` + `getServerSideProps`.
3. App Router transition planning will be captured in a future ADR when scheduled.
