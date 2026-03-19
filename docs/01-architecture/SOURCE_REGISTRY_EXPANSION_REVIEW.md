# SOURCE_REGISTRY_EXPANSION_REVIEW

Date: 2026-03-12
Directive: Document file/FOUNDER_GROUP_E_LIVE_PROOF_AND_SOURCE_EXPANSION_DIRECTIVE_2026-03-10.md
Policy: Document file/SOURCE_EXPANSION_POLICY_AND_CANDIDATES_2026-03-10.md
Evidence: artifacts/source_candidate_browser_review_2026-03-12.json (Chromium)

## Classification Matrix
| Source | Classification | Content Type | Access Model | Robots or ToS Risk | Extraction Feasibility | Metadata Quality | Reliability Baseline | Integration Mode | Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| https://www.scribd.com/ | Blocked by robots/login/legal restrictions | Books, documents | Login and paywall | High | Low | Medium | Medium | Blocked | Low | Chromium navigation failed (DNS in Playwright). Scribd is login and paywall gated, high ToS risk for automation. |
| https://www.ai-websites1.com/ | Low-priority or low-quality | Link directory | Public | Unknown | Low | Low | Low | Manual only | Low | Site appears to be a general link directory, not a scientific corpus. |
| https://www.emro.who.int/ | Approved for metadata/search-only integration | Public health site | Public | Low | Medium | Medium | High | Assisted discovery | Medium | WHO EMRO is high quality; automation should be metadata/search only until a compliant extraction plan exists. |
| https://tvtc.gov.sa/ | Low-priority or low-quality | Training and institution site | Public | Low | Low | Low | Low | Manual only | Low | Not a medical source and not aligned with scientific device focus. |
| https://pubrica.com/ | Low-priority or low-quality | Publishing services | Public | Low | Low | Low | Low | Manual only | Low | Commercial publishing services, not a primary content source. |
| https://www.noor-book.com/ | Blocked by robots/login/legal restrictions | Books | Public, anti-bot observed | High | Low | Low | Low | Blocked | Low | Chromium received 403, likely anti-bot or access restrictions. Copyright risk for automated ingestion. |
| https://rayatgrup.com/ | Low-priority or low-quality | Corporate site | Public | Low | Low | Low | Low | Manual only | Low | Not a scientific medical content source. |
| https://frankshospitalworkshop.com/ | Blocked by robots/login/legal restrictions | Workshop manuals | Public, cert error | High | Low | Low | Low | Blocked | Low | Chromium reported invalid certificate. Unsafe to automate. |
| https://bmegtu.wordpress.com/ | Approved for manual reference intake only | Blog posts | Public | Medium | Low | Low | Low | Manual only | Low | Blog content, low reliability baseline for automated ingestion. |
| https://www.freebookcentre.net/ | Approved for manual reference intake only | Book directory | Public | High | Low | Low | Low | Manual only | Low | Aggregator site with unknown rights and inconsistent metadata. |
| http://ijlalhaider.pbworks.com/ | Approved for manual reference intake only | Wiki pages | Public | Medium | Low | Low | Low | Manual only | Low | User-maintained wiki, not suitable for automation. |
| https://www.sciencedirect.com/ | Approved for metadata/search-only integration | Journal articles | Paywall, anti-bot observed | High | Low | High | High | Assisted discovery | Medium | Chromium received 403. Use DOI or metadata only; no automated full-text ingestion. |
| https://dokumen.pub/ | Blocked by robots/login/legal restrictions | Books | Public | High | Low | Low | Low | Blocked | Low | High copyright and scraping risk for automated ingestion. |
| https://www.cambridge.org/ | Approved for metadata/search-only integration | Journal and books | Paywall, anti-bot observed | High | Low | High | High | Assisted discovery | Medium | Chromium received 403 or challenge. Metadata only. |
| https://link.springer.com/ | Approved for metadata/search-only integration | Journal and books | Paywall | High | Low | High | High | Assisted discovery | Medium | Metadata is valuable; automated full-text ingestion is not permitted. |
| https://www.bspublications.com/ | Approved for metadata/search-only integration | Books | Paywall | Medium | Low | Medium | Medium | Assisted discovery | Low | Publisher site, metadata only until licensed access. |
| https://ar.wikipedia.org/ | Approved for metadata/search-only integration | Wiki articles | Public | Low | Medium | Medium | Medium | Assisted discovery | Medium | Suitable for metadata and discovery context via Wikimedia. |

## Summary Decisions
- Auto-discovery candidates: none approved in this pass.
- Metadata or search-only: emro.who.int, sciencedirect.com, cambridge.org, link.springer.com, bspublications.com, ar.wikipedia.org.
- Manual reference intake only: ai-websites1.com, tvtc.gov.sa, pubrica.com, rayatgrup.com, bmegtu.wordpress.com, freebookcentre.net, ijlalhaider.pbworks.com.
- Blocked by robots or legal restrictions: scribd.com, noor-book.com, frankshospitalworkshop.com, dokumen.pub.
- Low-priority or low-quality: ai-websites1.com, tvtc.gov.sa, pubrica.com, rayatgrup.com.

## Notes on Chromium Review
- Chromium evidence captured in artifacts/source_candidate_browser_review_2026-03-12.json.
- 403 responses observed for sciencedirect.com, cambridge.org, noor-book.com.
- TLS certificate error observed for frankshospitalworkshop.com.
- DNS failure observed for scribd.com in Playwright session.
