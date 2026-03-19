# SOURCE_EXPANSION_POLICY_AND_CANDIDATES_2026-03-10

Date: 2026-03-10
Status: Active founder source-expansion policy
Audience: Development Team / Architecture / Operations

## 1. Objective
This document records the newly requested source candidates that the platform owner wants considered for reference/book discovery and ingestion.

It does not authorize blind automatic crawling.
It authorizes structured technical and governance review.

## 2. Candidate Sources Requested by Founder
- `https://www.scribd.com/`
- `https://www.ai-websites1.com/`
- `https://www.emro.who.int/`
- `https://tvtc.gov.sa/`
- `https://pubrica.com/`
- `https://www.noor-book.com/`
- `https://rayatgrup.com/`
- `https://frankshospitalworkshop.com/`
- `https://bmegtu.wordpress.com/`
- `https://www.freebookcentre.net/`
- `http://ijlalhaider.pbworks.com/`
- `https://www.sciencedirect.com/`
- `https://dokumen.pub/`
- `https://www.cambridge.org/`
- `https://link.springer.com/`
- `https://www.bspublications.com/`
- `https://ar.wikipedia.org/`
- `https://www.wikipedia.org/`

## 3. Founder Rules for Source Inclusion
No candidate source may be added directly to the automated discovery pipeline without classification.

Each source must be reviewed against:
1. scientific relevance,
2. legal/ToS constraints,
3. robots/crawling restrictions,
4. paywall/login/access restrictions,
5. metadata quality,
6. extraction feasibility,
7. expected duplicate risk,
8. expected reliability baseline,
9. sustainability fit,
10. automation suitability.

## 4. Allowed Classification Outcomes
Each source must be placed in one of these categories:
- Approved for direct adapter implementation
- Approved for metadata/search-only integration
- Approved for manual reference intake only
- Blocked by robots / login / legal restrictions
- Low-priority / low-quality / weak scientific fit
- Future-phase candidate requiring later evaluation

## 5. Mandatory Output
The development team must create:
- `docs/01-architecture/SOURCE_REGISTRY_EXPANSION_REVIEW.md`

This report must classify all candidate sources and explain inclusion/exclusion logic.

## 6. Operational Principle
The platform is a scientific medical knowledge platform.
Therefore source volume is less important than:
- source quality,
- source legality,
- traceability,
- and sustainability of the acquisition method.

## 7. Browser-Based and Shell-Based Review Requirement for Candidate Sources
If a candidate source is:
- JS-heavy,
- redirect-heavy,
- anti-bot sensitive,
- login-gated,
- or operationally unclear from static code/API inspection,
then the team must use the available Chromium tooling inside VS Code as part of the source review process.

In addition, the team must use PowerShell inside VS Code for the operational side of source evaluation when applicable, including:
- executing discovery/search requests,
- capturing command outputs and artifacts,
- verifying environment/config preconditions,
- and recording reproducible evidence for why a source is approved, limited, or blocked.

The purpose is to verify, where applicable:
- whether the source is realistically browsable,
- whether the access path is stable,
- whether visible restrictions or redirects exist,
- whether manual-only classification is more appropriate than automated crawling,
- and whether the source is technically suitable for direct adapter automation.

## 8. Current Founder Position
At this stage, founder priority is not “add all sources now.”
Founder priority is:
- assess sources correctly,
- approve safe/valuable ones,
- block unsuitable ones,
- and prove at least a small real multi-source run with the currently supported source stack.
