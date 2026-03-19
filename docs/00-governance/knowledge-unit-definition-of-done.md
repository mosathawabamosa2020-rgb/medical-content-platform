# Definition of Done - Knowledge Units

A `KnowledgeChunk` is approved only when all conditions are met:

1. `isApproved = true` in `knowledge_chunks`.
2. Linked `ReviewTask` exists with status `ACCEPTED`.
3. `reviewedAt` is populated on the `ReviewTask`.
4. At least one `VerificationLog` with action `ACCEPTED` and performer identity exists.
5. An `AuditLog` with action `APPROVE` exists for the chunk reference.
6. `embedding` is not null for the chunk.

