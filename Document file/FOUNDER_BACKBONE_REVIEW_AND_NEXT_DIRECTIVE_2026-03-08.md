# FOUNDER BACKBONE REVIEW & NEXT DIRECTIVE — 2026-03-08

## مراجعة مؤسسية دقيقة + التوجيه التنفيذي التالي لفريق التطوير

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Issued By:** Founder / Technical Architect / Platform Owner  
**Audience:** Codex Development Team  
**Directive Type:** Backbone Review, Consistency Correction, Stabilization, Runtime Validation, Core Value-Chain Execution  
**Status:** Approved for Immediate Execution  

---

## 1) التقييم التنفيذي العام لردكم الأخير

ردكم الأخير يعكس تقدماً فعلياً ومهماً، وأقرّ بما يلي كإنجازات حقيقية:

- تنفيذ baseline واضح لـ REC-005:
  - Settings persistence store
  - Settings API
  - Settings UI
- تنفيذ baseline واضح لـ REC-006:
  - Audit trail utility
  - ربط التدقيق بقرارات التحقق العلمي
  - ربطه بإنشاء/تحديث المحتوى
  - ربطه بمهام النشر
  - ربطه بتعديلات taxonomy
  - ربطه بتحديثات settings
- استمرار نجاح:
  - `npm run lint`
  - `npm test -- --runInBand`
  - `npm run typecheck`

هذا جيد، لكنه **ليس كافياً بعد** لإعلان النضج أو الإغلاق النهائي.

---

## 2) الملاحظات الحرجة على ردكم وتقاريركم

## 2.1 تناقضات داخلية في التقارير
يوجد تناقض يجب تصحيحه فوراً في الوثائق الحالية:

- أنتم ذكرتم أن **REC-005 تم تنفيذه** (settings store + API + UI).
- لكن داخل `PLATFORM_FULL_VALIDATION_REPORT_2026-03-08.md` ما زال قسم الجاهزية التشغيلية يذكر:
  - `Settings persistence/UI: still missing`
- كما أن قسم "Recommended next action" ما زال يقول:
  - `Complete REC-005`

هذا غير مقبول كحوكمة تقريرية.

### القرار
يجب تصحيح جميع الوثائق بحيث:
- لا تحتوي تناقضات بين ما تم تنفيذه فعلاً وما يذكر في التقييمات.
- يتم التفريق بدقة بين:
  - baseline implemented
  - fully verified
  - not implemented
  - partially verified

---

## 2.2 ما زال build determinism مفتوحاً
حتى الآن لم يتم إغلاق أهم نقطة تشغيلية حرجة:

- `npm run build` ما يزال غير حتمي.
- وجود lint/tests/typecheck ناجحة لا يكفي وحده.

### القرار
لن أعتبر المشروع مستقراً أو closure-ready ما لم تقدّموا:
- تحليل سبب جذري حقيقي
- إعادة إنتاج واضحة للمشكلة
- إثبات build successful ومتكرر
- أو تصنيفاً دقيقاً مدعوماً بالأدلة إذا كانت المشكلة بيئية بحتة

عبارة "this environment" وحدها لم تعد كافية.

---

## 2.3 التحقق الحي للمنصة ما يزال ناقصاً
أنتم لم تثبتوا بعد أن المنصة تعمل فعلياً كنظام مترابط عبر التشغيل المباشر.

ما تحقق حتى الآن هو:
- command-level validation جيد
- API tests جيدة
- بعض صفحات الإدارة تم تنفيذها

لكن ما يزال ناقصاً:
- live route-by-route verification
- browser/runtime sweep
- UI usability verification
- flow verification across modules

### القرار
يجب الانتقال الآن من "code/status validation" إلى "system runtime validation".

---

## 2.4 المشروع ما يزال مهدداً بأن يُفهم كمنصة Admin فقط
هذا أخطر انحراف معماري محتمل حالياً.

أذكّركم أن المشروع ليس فقط:
- taxonomy
- settings
- audit
- admin pages

بل هو **منصة معرفية علمية مستدامة** يجب أن تثبت قدرتها على دعم السلسلة التالية:

1. taxonomy سليمة
2. reference discovery / browser research readiness
3. reference ingestion
4. file processing
5. knowledge chunking
6. embeddings / retrieval / scoring
7. scientific verification
8. approved knowledge usage
9. content generation
10. publishing readiness

إذا بقي التركيز محصوراً في الإدارة والـ CRUD فقط، فسننتج نظام إدارة بيانات وليس منصة معرفة ذكية.

---

## 3) القرار المؤسسي للمرحلة القادمة

### القرار الرسمي
المرحلة القادمة ليست توسعات عشوائية.

المرحلة القادمة هي:

## Stabilize → Verify Live → Prove Core Knowledge Value Chain → Harden Operations

ويجب تنفيذها عبر مسارات متوازية مضبوطة.

---

## 4) Workstreams الإلزامية التالية

## Workstream A — Build Determinism Closure

### الهدف
إغلاق REC-001 بشكل نهائي.

### المطلوب
- تحليل السبب الجذري لـ timeout/hang أثناء `npm run build`.
- تحديد ما إذا كان السبب:
  - code-level
  - Next.js/toolchain
  - filesystem/lock
  - watch/background process
  - environment resource contention
- تشغيل build في ظروف متعددة موثقة:
  - clean shell
  - fresh install if needed
  - no watcher/background process
  - with timing capture
- توثيق عدد المحاولات، زمن كل محاولة، وأين يتوقف البناء تحديداً.

### معيار القبول
- 3 successful consecutive builds minimum
- أو تقرير root-cause حاسم يثبت أن المشكلة خارج الكود مع دليل عملي

### المخرج المطلوب
- `docs/BUILD_DETERMINISM_ROOT_CAUSE_2026-03-08.md`

---

## Workstream B — Full Runtime Route Verification

### الهدف
تشغيل المنصة وفحصها فعلياً كمنتج حي.

### المطلوب
بعد تشغيل المنصة، يجب فحص المسارات التالية على الأقل:

- auth/sign-in
- dashboard
- admin home
- taxonomy admin
- settings admin
- devices library
- references management
- verification interface
- content generation
- publishing/schedule views
- health-related routes if exposed

### لكل route يجب توثيق
- render success/failure
- runtime errors
- data load status
- empty/loading/error states
- navigation integrity
- visual/UX issues
- contract/data mismatch if any

### المخرج المطلوب
- `docs/FINAL_RUNTIME_ROUTE_VERIFICATION_2026-03-08.md`

---

## Workstream C — Core Knowledge Value-Chain Assessment

### الهدف
إثبات أن المنصة تتحرك نحو كونها منصة معرفة مستدامة، لا مجرد لوحة إدارة.

### المطلوب تقييمه عملياً ووثائقياً

#### C.1 Taxonomy readiness
- departments
- devices
- models
- relational integrity
- activation/deactivation strategy

#### C.2 Reference discovery readiness
- هل توجد readiness حقيقية للبحث من المتصفح في عدة مصادر؟
- هل يوجد abstraction/search service plan أو تنفيذ أولي؟
- هل توجد source scoring strategy قابلة للتوسع؟

#### C.3 Reference ingestion readiness
- reference create/link/upload flow
- file lifecycle
- processing states
- traceability to device/model/department

#### C.4 Document processing readiness
- PDF extraction
- OCR fallback status
- chunking behavior
- page/source traceability
- chunk categorization maturity

#### C.5 Retrieval readiness
- embeddings flow
- pgvector usage
- hybrid retrieval/search
- approved-only retrieval behavior
- source scoring maturity

#### C.6 Verification readiness
- decision capture
- reviewer notes
- approval states
- auditability

#### C.7 Content generation readiness
- generation inputs/outputs
- preview/save/update
- relation to approved knowledge
- revision behavior

#### C.8 Publishing readiness
- task model
- daily scheduling baseline
- execution status visibility

### التصنيف الإلزامي لكل محور
- Implemented and Live-Verified
- Implemented but Partially Verified
- Present but Not Operationally Proven
- Missing
- Blocked by Environment

### المخرج المطلوب
- `docs/CORE_VALUE_CHAIN_ASSESSMENT_2026-03-08.md`

---

## Workstream D — Operations, Tooling, and Sustainability Hardening

### الهدف
تقوية العمود الفقري التشغيلي للمشروع المستدام.

### المطلوب

#### D.1 Backup / Restore baseline
- تنفيذ baseline فعلي أو على الأقل scripts + runbook موثقة
- توضيح كيف يتم backup للبيانات المهمة:
  - PostgreSQL
  - uploaded references metadata/files if applicable
  - settings
  - audit logs if file-backed

#### D.2 Monitoring / Readiness baseline
- health checks
- error visibility
- basic operational metrics readiness
- تحديد ما هو منفذ وما هو placeholder

#### D.3 Sustainability review
- مراجعة أي file-based persistence مؤقتة (مثل settings/audit) وتحديد:
  - هل هي baseline مقبولة مرحلياً؟
  - هل يجب نقلها إلى DB؟
  - ما أثرها على الاستدامة، التزامن، والنسخ الاحتياطي؟

#### D.4 Source-of-truth governance
- تحديث `docs/SOURCE_OF_TRUTH.md`
- أرشفة أو وسم أي وثيقة قديمة متعارضة
- تثبيت مرجع واحد للحالة الحالية

#### D.5 ADR maturity
- لا يكفي template فقط
- يجب إضافة ADRs فعلية مثل:
  - ADR-001: Modular Monolith + Next API baseline
  - ADR-002: PostgreSQL + pgvector as primary knowledge store
  - ADR-003: File-backed settings/audit as temporary baseline or DB migration decision

### المخرجات المطلوبة
- `docs/OPERATIONAL_READINESS_ASSESSMENT_2026-03-08.md`
- ADR files جديدة داخل `docs/adr/`

---

## Workstream E — UI/UX and Design Hardening

### الهدف
منع تحول الواجهات إلى واجهات تقنية فقط غير قابلة للاعتماد العملي.

### المطلوب
- مراجعة اتساق التنقل داخل admin.
- مراجعة القوائم والجداول والنماذج.
- التحقق من form validation UX.
- التحقق من empty states / success states / failure states.
- التحقق من clarity في المصطلحات والlabels.
- توثيق أي mismatch بين design intent والتنفيذ الفعلي.
- تحديد ما إذا كانت واجهات taxonomy/settings/references قابلة للاستخدام الفعلي أم مجرد baseline render.

### المخرج المطلوب
- قسم مخصص داخل تقرير runtime verification أو تقرير UX مستقل إن لزم

---

## 5) ما أوافق عليه حالياً وما لا أوافق عليه

## ما أوافق عليه
- settings baseline: مقبول كمرحلة أولية
- audit baseline: مقبول كمرحلة أولية
- taxonomy baseline: مقبول كمرحلة أولية
- lint/tests/typecheck improvements: مقبولة

## ما لا أوافق على اعتباره مغلقاً
- P0 closure الكامل
- platform maturity proof
- operational readiness
- live system verification
- sustainable architecture proof

---

## 6) التوجيه بشأن REC-007 / REC-008

نعم، يمكنكم بدء REC-007 و REC-008 **لكن فقط بالتوازي المنضبط**، وليس كبديل عن إغلاق build/runtime verification.

### الترتيب الصحيح
- لا تؤجلوا build isolation
- لا تؤجلوا runtime verification
- ويمكن بالتوازي بدء:
  - backup/restore baseline
  - monitoring/readiness baseline

### المبدأ
التشغيل والاستدامة جزء من المنتج، لكن لا يجب أن يصبحا ذريعة لتجاوز إثبات استقرار البناء والتشغيل الحي.

---

## 7) شكل الرد القادم المطلوب منكم

أريد الرد القادم بالترتيب التالي حصراً:

1. Executive Summary  
2. Corrections to Previous Report Inconsistencies  
3. Workstreams Executed  
4. Files Changed  
5. Build Determinism Status  
6. Runtime Route Verification Summary  
7. Core Knowledge Value-Chain Assessment Summary  
8. Operational Readiness Summary  
9. UI/UX Hardening Summary  
10. Quality Gates Results  
11. Issues / Risks / Blockers  
12. Closure Status of REC-001 / REC-004 / REC-005 / REC-006 / REC-007 / REC-008  
13. Links to Detailed Reports  
14. Recommended Final Next Step  

لا أريد تحديثاً عاماً.
أريد تحديثاً تنفيذيّاً متماسكاً، غير متناقض، وقائماً على الأدلة.

---

## 8) القرار النهائي

أنتم تتقدمون بشكل جيد، لكنني الآن أبحث عن **proof of backbone strength** وليس فقط progress.

أريد منكم أن تثبتوا أن:
- البناء مستقر
- التشغيل الحي ممكن
- التقارير متسقة
- القيمة الجوهرية للمنصة واضحة تقنياً وتشغيلياً
- الأدوات والإضافات والحوكمة والواجهات تتحرك باتجاه منتج مستدام، وليس prototype متشعب

**Proceed immediately with build closure, live runtime verification, core value-chain assessment, and sustainability hardening in parallel.**
