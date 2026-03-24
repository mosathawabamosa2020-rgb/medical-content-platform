# ADR-009: Monitoring Stack - Prometheus + Grafana + Loki

Date: 2026-03-24
Status: Accepted
Deciders: Technical Founder

## Context

The platform exposes `/api/metrics` in Prometheus text format. Operational visibility requires scrape, dashboard, and alert infrastructure.

## Decision

Adopt Prometheus v2.51, Grafana 10.4, and Loki 2.9 as the default observability stack for local and staging.

## Rationale

1. Open-source and self-hostable.
2. Standard ecosystem for metrics, visualization, and logs.
3. Fits existing `/api/metrics` implementation with minimal integration risk.

## Consequences

1. `/api/metrics` is the canonical Prometheus scrape target.
2. Monitoring configuration lives under `monitoring/`.
3. Alert rules are maintained under `monitoring/alerts/`.
4. Dashboard provisioning files are committed under `monitoring/grafana/dashboards/`.
