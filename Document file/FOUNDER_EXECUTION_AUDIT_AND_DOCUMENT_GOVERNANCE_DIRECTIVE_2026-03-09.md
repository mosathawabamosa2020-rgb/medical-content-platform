# FOUNDER EXECUTION AUDIT & DOCUMENT GOVERNANCE DIRECTIVE — 2026-03-09

## مراجعة تنفيذية دقيقة + توجيه تنظيمي ومعماري وتشغيلي لفريق التطوير

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Issued By:** Founder / Chief Architect / Technical Owner  
**Audience:** Codex Development Team  
**Directive Type:** Execution Audit, Backbone Governance, Reporting Rationalization, Final Hardening  
**Status:** Approved for Immediate Execution  

---

## 1) Executive Position

بعد مراجعة ردكم الأخير والتقارير المرفقة، أقرّ بما يلي بوضوح:

### ما تم قبوله كإنجازات حقيقية
- `npm run build` أصبح **PASS** مع توثيق 3 تشغيلات متتالية ناجحة.
- تم إضافة baselines تشغيلية مهمة:
  - backup / restore
  - readiness snapshot
  - readiness API
- تم إنشاء ADRs حقيقية بدل الاكتفاء بالقالب.
- تم تنفيذ مخرجات مراجعة خارجية مطلوبة مثل:
  - Knowledge Pipeline Truth Map
  - File Storage Architecture Review
  - Retrieval Architecture and Dimension Validation
  - Schema Semantics Review
  - Python and Worker Governance Review
  - Operator Experience and UI Review
- تم تطبيق تغيير تقني ملموس، وليس توثيقاً فقط، عبر فرض guardrails على أبعاد الـ embeddings.

### ما لم أعتبره مغلقاً بعد
- `/api/health` ما زال يفشل في بيئة التشغيل الحالية.
- لا تزال هناك build warnings غير مغلقة في بعض وحدات scraper/content generation.
- التحقق الحي authenticated / interactive ما زال أضعف من المطلوب.
- حالة REC items في التقارير لا تزال تميل إلى التردد بين “implemented baseline” و “in progress” دون حسم تصنيفي كافٍ.
- فوضى التقارير والوثائق والأسماء أصبحت الآن مشكلة إدارية/هندسية بحد ذاتها، ويجب إغلاقها رسميًا.

**القرار المؤسسي:**  
المشروع انتقل من مرحلة remediation إلى مرحلة **discipline, consolidation, live-proof, and documentation governance**.  
المرحلة القادمة ليست إضافة ملفات أكثر؛ بل **تنظيم الحقيقة، تثبيت المسارات الحية، وتقوية العمود الفقري المستدام**.

---

## 2) Critical Assessment of the Current State

## 2.1 التقدم التقني
التقدم التقني واضح وملموس. الفريق لم يعد في مرحلة وعود، بل أنتج:
- build stability evidence
- ops tooling baseline
- architecture reviews
- schema/retrieval/storage reviews
- governance artifacts

وهذا ممتاز.

## 2.2 الخلل الحالي لم يعد “نقص تنفيذ” فقط
الخلل الآن أصبح في 4 مستويات:
1. **Documentation sprawl**  
2. **State classification ambiguity**  
3. **Operational proof depth**  
4. **Governance cleanliness**

## 2.3 الخطر الجديد
كلما كثرت التقارير المتقاربة في الاسم وازدادت التوجيهات المتراكمة، ارتفعت احتمالية أن:
- يضيع source of truth
- تصبح المراجعة أصعب
- تتكرر الاستنتاجات بصيغ مختلفة
- تضعف القدرة على اتخاذ قرار سريع
- ينشغل الفريق بإنتاج تقارير أكثر من تقوية المنتج نفسه

**لذلك: تنظيم التقارير والوثائق أصبح الآن مهمة P1 إلزامية، وليس اقتراحاً شكلياً.**

---

## 3) Founder Decisions (Binding)

## Decision-01
**The project remains a sustainable modular monolith with explicit governance.**

## Decision-02
**Document sprawl must now be reduced.** لا أقبل بعد هذه المرحلة استمرار توليد ملفات متشابهة الأسماء بدون نظام تصنيف واضح.

## Decision-03
**A single current-state reference must exist.** يجب أن يكون هناك ملف واحد واضح يمثل الحالة الحالية المعتمدة للمشروع، مع فهرس لبقية التقارير.

## Decision-04
**Reports must move from accumulation to indexed structure.**

## Decision-05
**No more ambiguous status language.**
يجب أن تكون الحالة لكل عنصر واحدة من:
- Not Started
- Implemented Baseline
- Implemented and Verified
- Implemented but Blocked by Environment
- Superseded
- Archived

## Decision-06
**Every future report must declare whether it supersedes a prior report.**

---

## 4) Mandatory Parallel Workstreams

## Workstream A — Documentation Rationalization & Source-of-Truth Cleanup (Critical)

### الهدف
إنهاء فوضى التقارير، التوجيهات، والملفات المتقاربة في الاسم.

### المطلوب
1. إنشاء هيكل موحد داخل `docs/` لتصنيف الوثائق.  
2. نقل/ترتيب التقارير الحالية داخل مسارات منطقية واضحة.  
3. إنشاء فهرس رئيسي يوضح:
   - ما هو current authoritative document
   - ما هو archived
   - ما هو superseded
   - ما هو operational evidence
4. وسم أي ملف قديم بحالة واضحة بدلاً من تركه مبهماً.
5. استبعاد الملفات غير ذات القيمة أو دمج الملفات التي لا تضيف معلومة جديدة.

### المخرجات الإلزامية
- `docs/REPORTS_INDEX.md`
- `docs/CURRENT_PROJECT_STATUS.md`
- `docs/DOCUMENT_RETENTION_AND_ARCHIVE_POLICY.md`
- تحديث `docs/SOURCE_OF_TRUTH.md`

### معيار القبول
- يمكن لأي مراجع جديد معرفة: ما الذي يجب قراءته أولاً، وما الذي يعتبر مؤرشفاً، وما الذي يمثل الحقيقة الحالية.

---

## Workstream B — Runtime Health & Dependency Closure (Critical)

### الهدف
إغلاق أي فجوة تمنع اعتبار التشغيل الحي مكتملًا.

### المطلوب
1. تحليل `/api/health` وتحويله من failing dependency composite إلى health model واضح ومفسّر.  
2. تحديد سبب `503` بدقة:
   - DB unavailable?
   - env missing?
   - external dependency timeout?
   - readiness vs liveness confusion?
3. تقسيم health checks إلى:
   - liveness
   - readiness
   - dependency status
4. توثيق أي dependencies optional vs required.

### المخرجات
- تحديث `docs/OPERATIONAL_READINESS_ASSESSMENT_2026-03-08.md` أو إصدار superseding version
- تقرير محدد عن health model

### معيار القبول
- `/api/health` لا يعود black-box failure endpoint
- يصبح failure explainable and actionable

---

## Workstream C — Knowledge Pipeline Live Proof Hardening (Critical)

### الهدف
إثبات السلسلة الحقيقية للمنصة، لا فقط وجود ملفات ومجلدات وتقارير.

### المطلوب
فحص وتشغيل وتوثيق الحالة الفعلية لكل من:
- search
- research
- references/discovery
- scraper
- ingestion
- workers
- queue
- retrieval
- embeddings
- verification
- content generation
- publishing

### لكل عنصر يجب تحديد
- live and verified
- present but partially wired
- present but not live-proven
- placeholder only
- blocked

### المخرج
- إصدار current authoritative version من truth map
- ربطه مباشرة بـ `CURRENT_PROJECT_STATUS.md`

---

## Workstream D — Schema Hardening & Semantics Implementation (High Priority)

### الهدف
تحويل نتائج المراجعات المعمارية/الدلالية إلى تغييرات مدروسة في الـ schema والـ APIs.

### المطلوب
1. تطبيق phased Prisma hardening على ضوء `SCHEMA_SEMANTICS_REVIEW`.  
2. إضافة lifecycle/status fields في taxonomy عند الحاجة.  
3. تنظيم normalized source identifiers (DOI / PMID / arXiv / source fingerprints).  
4. توثيق سياسة `parsedText` مقابل `KnowledgeChunks`.  
5. تثبيت dimension policy للـ embeddings على مستوى التنفيذ والتوثيق والمخزن.

### المخرج
- migration plan واضح
- ADR أو schema change note
- تحديث للتقارير المرتبطة

---

## Workstream E — Python / Worker / Secret / Boundary Governance (High Priority)

### الهدف
إغلاق أي منطقة رمادية غير محكومة داخل المشروع.

### المطلوب
1. حصر مكونات Python/MedicalBot نهائياً.  
2. إزالة أي hardcoded secrets أو أسرار أو توجيهات تشغيلية غير آمنة.  
3. توثيق ownership والمسؤولية التشغيلية والحدود بين Node وPython.  
4. توثيق worker contracts, queue contracts, retry/failure behavior.  
5. إزالة أو عزل أي أجزاء تجريبية غير معتمدة من المسار الإنتاجي.

### معيار القبول
- لا توجد أي مكونات “غامضة لكنها موجودة” داخل المستودع.

---

## Workstream F — Retrieval / Legacy Path Cleanup (High Priority)

### الهدف
تنظيف المسارات القديمة والإشارات التي تشوش على مسار التنفيذ الحقيقي.

### المطلوب
1. معالجة أي إشارات legacy مثل `dist/*` أو سكربتات لم تعد جزءاً من المسار الحالي.  
2. توحيد script paths ومسارات التشغيل.  
3. إزالة التعارض بين المسارات القديمة والمسار الفعلي الحالي للاسترجاع والمعالجة.

---

## Workstream G — UX / Operator Usability Hardening (Medium-High)

### الهدف
التأكد أن واجهات المنصة ليست فقط rendered، بل قابلة للاستخدام الحقيقي من مالك المنصة كمشغل وباحث ومراجع.

### المطلوب
- مراجعة flow الاستخدام عبر:
  - admin home
  - taxonomy
  - settings
  - references
  - verification
  - content generation
  - operations/readiness
- توثيق:
  - broken flows
  - confusing labels
  - missing empty states
  - weak validation messaging
  - operator overload areas

---

## Workstream H — Report Consolidation and Archive Execution (Mandatory)

### الهدف
تنفيذ التنظيم الفعلي للملفات، لا الاكتفاء بالتوصية به.

### المطلوب
1. إنشاء مسار منطقي للتقارير داخل `docs/`.  
2. نقل الملفات المكررة أو المتقاربة أو superseded إلى archive/superseded structure.  
3. الإبقاء فقط على:
   - current directive references
   - current execution status
   - active backlog / recovery docs
   - active validation evidence
4. أي ملف بلا قيمة تشغيلية أو مرجعية يجب:
   - دمجه
   - أو أرشفته
   - أو وسمه بوضوح أنه non-authoritative

---

## 5) Required Documentation Structure

يجب اعتماد بنية مشابهة لهذا النمط داخل `docs/`:

```text
docs/
  00-governance/
    SOURCE_OF_TRUTH.md
    CURRENT_PROJECT_STATUS.md
    REPORTS_INDEX.md
    DOCUMENT_RETENTION_AND_ARCHIVE_POLICY.md

  01-architecture/
    adr/
    KNOWLEDGE_PIPELINE_TRUTH_MAP.md
    FILE_STORAGE_ARCHITECTURE_REVIEW.md
    RETRIEVAL_ARCHITECTURE_AND_DIMENSION_VALIDATION.md
    SCHEMA_SEMANTICS_REVIEW.md
    PYTHON_AND_WORKER_GOVERNANCE_REVIEW.md

  02-validation/
    PLATFORM_FULL_VALIDATION_REPORT.md
    FINAL_RUNTIME_ROUTE_VERIFICATION.md
    BUILD_DETERMINISM_ROOT_CAUSE.md
    CORE_VALUE_CHAIN_ASSESSMENT.md
    OPERATIONAL_READINESS_ASSESSMENT.md

  03-operations/
    backup-restore-runbook.md
    readiness-model.md

  04-planning/
    implementation-guide.md
    remediation-plan.md
    active-backlog.yaml
    recovery-backlog.yaml

  archive/
    superseded/
    historical/
```

**لا يشترط نفس الأسماء حرفياً، لكن يشترط نفس المنطق.**

---

## 6) Required Naming Convention

### التقارير الجارية المعتمدة
يجب أن تفضّل أسماء ثابتة وواضحة مثل:
- `CURRENT_PROJECT_STATUS.md`
- `PLATFORM_VALIDATION_REPORT.md`
- `KNOWLEDGE_PIPELINE_TRUTH_MAP.md`

### النسخ المؤرشفة
توضع داخل archive مع التاريخ، مثل:
- `archive/historical/PLATFORM_VALIDATION_REPORT_2026-03-08.md`

### المبدأ
**current docs should be stable names**  
**historical docs should carry timestamps**

هذا يقلل الفوضى ويجعل المراجعة أسرع.

---

## 7) Required Final Response Format from the Team

أريد الرد القادم بهذا الشكل حصراً:

1. Executive Summary  
2. What Was Consolidated and Archived  
3. Current Source of Truth Files  
4. Workstreams Executed in Parallel  
5. Health / Runtime Closure Status  
6. Knowledge Pipeline Live-Proof Status  
7. Schema / Storage / Retrieval Implementation Status  
8. Python / Worker / Secrets Governance Status  
9. UX / Operator Hardening Status  
10. Validation Commands and Results  
11. Remaining Risks / Blockers  
12. Final Closure Status by REC Item  
13. Links to Canonical Reports Only  
14. Recommended Final Next Step  

---

## 8) Final Founder Direction

أنتم أنجزتم تقدماً جيداً جداً.  
لكن المرحلة الحالية تتطلب **discipline أكثر من expansion**.

أنا لا أريد:
- مزيداً من الملفات المتشابهة
- مزيداً من التقارير التي تعيد نفس الفكرة
- أو بنية وثائق تجعل القراءة صعبة والمراجعة أبطأ

أنا أريد:
- truth centralization
- clean documentation governance
- explainable runtime health
- live-proof of the knowledge backbone
- stronger sustainability posture

**Proceed immediately with documentation rationalization, health/runtime closure, knowledge-pipeline live proof, schema hardening, worker/secret governance, and archive cleanup in parallel.**
