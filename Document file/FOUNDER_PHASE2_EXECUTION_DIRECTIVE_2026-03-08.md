# FOUNDER PHASE-2 EXECUTION DIRECTIVE — 2026-03-08

## التوجيه التنفيذي الرسمي من المؤسس التقني إلى فريق التطوير

**Project:** Medical Devices Intelligent Scientific Knowledge Platform  
**Issued By:** Founder / Technical Architect / Product & Platform Owner  
**Audience:** Codex Development Team  
**Directive Type:** Phase-2 Parallel Execution + Full System Validation + Platform Readiness Assessment  
**Status:** Approved for Immediate Execution  
**Execution Mode:** Controlled Remediation + Parallel Workstreams + Repository-Based Evidence  

---

## 1) التقييم الرسمي لردكم الأخير

أقرّ بأن الرد الأخير يعكس **تقدماً هندسياً حقيقياً وقابلاً للقياس**، وليس مجرد ادعاء تقدم. وقد تم تسجيل النقاط التالية كإنجازات فعلية:

- استمرار تحسينات P0 على مستوى lint/build/tooling.
- الحفاظ على baseline واضح لمصدر الحقيقة والـ ADR.
- معالجة جزئية صحيحة لانجراف العقود بين الواجهة والـ API.
- تنفيذ تقدم كبير في REC-004 عبر **Taxonomy APIs + Taxonomy Admin UI + Tests**.
- توسيع عدد الاختبارات الناجحة ورفع التغطية الفعلية للمستودع.
- إصدار تقرير تحقق تفصيلي مقبول كبداية جيدة للحوكمة التنفيذية.

### التقييم المهني النهائي للحالة الحالية
الحالة الحالية **أفضل بوضوح من السابق**، لكنها **ليست حالة إغلاق**، وليست حالة جاهزية ثقة كاملة للإنتاج أو حتى لإعلان backlog closure.

### لماذا لا أعتبر المرحلة مغلقة بعد؟
لأن هناك فجوات ما تزال مفتوحة على مستوى الحوكمة التشغيلية والجاهزية النظامية، وأبرزها:

1. **Deterministic build proof** ما يزال غير مغلق.
2. **Full runtime verification** للمنصة كنظام مترابط لم يُستكمل بعد.
3. **Settings foundation** ما تزال غير منفذة.
4. **Extended audit coverage** ما تزال غير مكتملة.
5. **Core platform value-chain verification** لم تُغلق بعد، خصوصاً فيما يتعلق بـ:
   - البحث من المتصفح في مصادر متعددة
   - جلب المراجع والكتب وملفات PDF
   - تخزين المراجع وربطها بالأجهزة
   - معالجة الملفات واستخراج النصوص
   - بناء المقاطع المعرفية والـ embeddings
   - التحقق العلمي
   - الاسترجاع المعرفي
   - إنشاء المحتوى العلمي النهائي

### القرار الرسمي
إنجازكم **مقبول ومعتبر**، لكنه يمثل **مرحلة تقدم وسطية** وليس نهاية مرحلة المعالجة.

> من هذه اللحظة أنتم مكلّفون بالانتقال إلى Phase-2 Execution تحت نموذج تنفيذ متوازٍ ومضبوط، مع إلزام كامل بالتشغيل الفعلي للمنصة والتحقق النهائي منها وإصدار تقرير شامل عن حالة النظام.

---

## 2) التذكير بهوية المشروع الحقيقية

هذا المشروع ليس مجرد admin panel أو CRUD system.

هذا المشروع هو **منصة معرفية علمية ذكية مستدامة للأجهزة الطبية**، وقيمته الجوهرية لا تتحقق إلا إذا كانت السلسلة التالية تعمل بشكل مترابط وقابل للثقة:

1. معرفة مسبقة بالأقسام الطبية والأجهزة والموديلات.
2. بحث منظّم في المتصفح ومصادر متعددة عن المراجع والكتب والملفات العلمية.
3. جلب المراجع وتخزينها وربطها بالكيانات الصحيحة.
4. معالجة الملفات واستخراج النصوص وتقسيمها إلى Knowledge Chunks.
5. توليد embeddings وفهرسة دلالية واسترجاع موثوق.
6. تمرير المعرفة عبر التحقق العلمي قبل اعتمادها.
7. استعمال المعرفة المعتمدة فقط في العرض والبحث وإنشاء المحتوى.
8. إنتاج محتوى علمي وصوري قابل للنشر ومبني على مصدر موثق.

بالتالي، أي تقدم في taxonomy أو UI أو APIs لا يكفي وحده إن لم يتم ربطه بهذه السلسلة الأساسية والتحقق منها.

---

## 3) التوجيه الرسمي للمرحلة القادمة

أنتم مكلّفون الآن بتنفيذ **عدة مسارات بالتوازي**، مع الحفاظ على استقرار العقود وعدم كسر ما تم إنجازه.

## Workstream A — إغلاق P0 بشكل نهائي

### الهدف
إغلاق كل ما يمنع اعتبار المستودع مستقراً من ناحية الجودة الأساسية.

### المطلوب
- إغلاق REC-001 نهائياً.
- إثبات أن:
  - `npm run lint` يمر بشكل ثابت.
  - `npm test -- --runInBand` يمر بشكل ثابت.
  - `npm run build` يمر بشكل **حتمي ومكرر** وليس نجاحاً عرضياً.
- عزل سبب timeout أو lock أو toolchain instability بشكل جذري.
- توثيق:
  - root cause
  - fix applied
  - reproducibility notes
  - residual risk if any

### معيار القبول
لن أعتبر P0 مغلقاً ما لم يتم تقديم **دليل build deterministic** صريح وواضح.

---

## Workstream B — إكمال Taxonomy بطريقة مؤسسية وليس شكلياً

### الهدف
تحويل REC-004 من major progress إلى closure-ready implementation.

### المطلوب
- مراجعة APIs وUI الخاصة بـ departments/devices/models بالكامل.
- إكمال أي نقاط ناقصة في lifecycle مثل:
  - activation/deactivation flags
  - archive/delete policy
  - standardized error handling
  - list/detail/update consistency
  - validation completeness
- التحقق من أن العلاقات تعمل عملياً بين:
  - department -> devices
  - device -> models
- التحقق من أن taxonomy UI ليست فقط موجودة، بل usable وcoherent.
- التحقق من أن الإضافة/التعديل/الحذف/التعطيل/إعادة التفعيل تعمل وفق قواعد واضحة.

### معيار القبول
لن يُغلق REC-004 إلا إذا أصبح قابلاً للاستخدام كطبقة taxonomy production-grade baseline داخل المنصة.

---

## Workstream C — تنفيذ Settings Foundation فوراً

### الهدف
إغلاق REC-005 وعدم تأجيل settings أكثر.

### المطلوب
تنفيذ الأساس التالي على الأقل:
- Settings persistence model
- Settings API (read/update)
- Settings UI داخل لوحة الإدارة
- Default values آمنة وواضحة
- أقسام settings مبدئية تشمل:
  - platform general settings
  - ingestion/retrieval settings placeholders
  - AI/settings placeholders
  - publishing/scheduling placeholders
- ضمان traceability للتعديلات

### معيار القبول
- وجود model + API + UI + persistence فعلي.
- عدم الاكتفاء بصفحة static أو placeholder فارغة.

---

## Workstream D — توسيع Audit & Governance

### الهدف
إغلاق REC-006 بشكل عملي.

### المطلوب
توسيع audit logging ليغطي على الأقل:
- taxonomy mutations
- verification decisions
- content generation status changes
- publishing task changes
- settings mutations
- reference state changes where practical

ويجب أيضاً:
- إضافة ADRs فعلية للقرارات المعمارية المهمة التي اتُخذت أثناء remediation.
- تحديث docs بحيث تصف ما هو منفذ فعلاً، لا ما هو مخطط له فقط.

### معيار القبول
- وجود سجلات قابلة للتتبع لعمليات التغيير الحرجة.
- وجود ADR records فعلية وليس template فقط.

---

## Workstream E — التحقق من سلسلة القيمة الأساسية للمنصة

### الهدف
التحقق من أن المنصة تعمل كمنظومة معرفة، لا كواجهات متفرقة.

### المطلوب فحصه وتوثيقه
#### E.1 Taxonomy readiness
- الأقسام الطبية
- الأجهزة الطبية
- الموديلات
- الربط بينها

#### E.2 Reference ingestion readiness
- إضافة/رفع المرجع
- تخزين بيانات المرجع
- ربط المرجع بجهاز/قسم/موديل
- حالة الملف ودورة معالجته

#### E.3 Document processing readiness
- استخراج النص من PDF
- traceability على مستوى الصفحة عند الإمكان
- chunking behavior
- category extraction أو classification if implemented

#### E.4 Embeddings / retrieval readiness
- توليد embeddings
- تخزينها
- الاسترجاع المتجهي/الهجين
- source scoring
- approved-only retrieval behavior where applicable

#### E.5 Verification workflow readiness
- review tasks
- approve / reject / notes
- persistence of decisions
- audit trail where available

#### E.6 Content generation readiness
- generation inputs
- generation outputs
- save flow
- relation to approved knowledge
- preview and persistence behavior

#### E.7 Publishing / scheduling readiness
- daily tasks baseline
- publishing task visibility
- state transitions

### معيار القبول
تقرير واضح يحدد لكل حلقة من السلسلة: working / partial / blocked / not implemented.

---

## Workstream F — التشغيل الفعلي والتحقق الشامل للمنصة

### الهدف
إثبات أن المشروع يعمل فعلياً، وليس فقط عبر اختبارات وحدات أو API snapshots.

### المطلوب
بعد إنهاء التنفيذ، يجب عليكم:
- تشغيل المنصة فعلياً.
- فتح الصفحات الأساسية.
- اختبار المسارات الإدارية والرئيسية.
- التحقق من routes وAPI endpoints وdatabase connectivity.
- توثيق أي خطأ render أو runtime أو contract mismatch.
- التحقق من الحالات التالية في الواجهة:
  - loading
  - empty
  - success
  - error
- فحص الاتساق البصري والوظيفي للواجهات الأساسية.

### الحد الأدنى لمسارات الفحص الحي
- sign-in / auth path
- dashboard
- taxonomy admin
- references management
- verification page
- devices library/search page
- content generation page
- settings page
- أي route حرج آخر تم تنفيذه داخل المستودع

### معيار القبول
لن أعتبر المشروع قد خضع للتحقق الحقيقي ما لم يتم **تشغيل المنصة فعلياً** وتوثيق ما تم فتحه وما نجح وما فشل.

---

## Workstream G — التحقق من الأدوات والخدمات والتشغيل

### الهدف
إثبات أن البنية المساندة للمشروع متماسكة وليست هشّة.

### المطلوب فحصه
- package scripts
- eslint behavior
- test scripts
- build scripts
- lock cleanup tools
- prisma/migrations status if present in repo
- docker/dev services assumptions if applicable
- environment setup assumptions
- health endpoints
- backup baseline presence/absence
- monitoring baseline presence/absence
- restore guidance presence/absence

### معيار القبول
إصدار تقييم صريح لما هو:
- implemented and verified
- implemented but partial
- missing
- blocked by environment

---

## 4) نموذج التنفيذ المتوازي المطلوب

يجب تنفيذ العمل كالتالي:

### Parallel Group 1
- Workstream A
- Workstream C
- Workstream D

### Parallel Group 2
- Workstream B
- Workstream E

### Parallel Group 3
- Workstream F
- Workstream G

### قاعدة مهمة
لا تنتظروا إغلاق كل شيء قبل بدء التحقق.
كل workstream يجب أن يتضمن:
- implementation
- validation
- evidence
- documentation update

---

## 5) الملفات والتقارير الإلزامية بعد التنفيذ

يجب إنشاء أو تحديث الملفات التالية داخل المستودع:

1. `docs/REMEDIATION_PROGRESS_2026-03-08.md`
   - تحديث حالة ما تم إنجازه في هذه الدورة

2. `PLATFORM_FULL_VALIDATION_REPORT_2026-03-08.md`
   - تحديثه أو إصدار نسخة جديدة إذا لزم

3. `docs/PHASE2_RUNTIME_VERIFICATION_2026-03-08.md`
   - تقرير تشغيل وفحص حي للمسارات والواجهات والخدمات

4. `docs/BUILD_ROOT_CAUSE_AND_STABILIZATION_2026-03-08.md`
   - تحليل دقيق لمشكلة build determinism

5. `docs/ADR/` أو `docs/adr/`
   - إضافة ADRs فعلية للقرارات الجديدة وليس فقط template

---

## 6) بنية التقرير النهائي المطلوب منكم

ردكم القادم يجب أن يكون منظماً **بالترتيب التالي حصراً**:

1. Executive Summary  
2. Workstreams Executed  
3. Files Changed  
4. Backlog / Recovery Mapping  
5. Validation Commands and Results  
6. Runtime Verification Coverage  
7. Core Platform Value-Chain Assessment  
8. UI/API Contract Status  
9. Build Determinism Status  
10. Issues / Risks / Blockers  
11. Status of P0 / P1 Closure  
12. Link to Detailed Reports  
13. Recommended Next Step  

لا أريد رداً إنشائياً غير منظم.
أريد رداً تنفيذياً قابل للاعتماد الإداري والهندسي.

---

## 7) معايير القبول النهائية لهذه الدورة

لن أعتبر هذه الدورة مكتملة إلا عند تحقق ما يلي:

- build deterministic proof provided
- settings foundation implemented
- audit expansion materially implemented
- taxonomy moved to closure-ready state
- platform run and route sweep completed
- core platform chain assessed end-to-end
- detailed repository-based reports created
- open gaps clearly classified without ambiguity

---

## 8) التوجيه النهائي

استمروا فوراً.

لكن من الآن فصاعداً، لا أريد مجرد progress updates على مستوى الملفات.
أريد **proof of system maturity**.

المطلوب منكم في هذه الدورة ليس فقط إضافة كود، بل:
- تثبيت الاستقرار
- إكمال الأساس الإداري
- ربط التنفيذ بقيمة المنصة الحقيقية
- تشغيل النظام فعلياً
- فحص جميع ما تم إنجازه
- إصدار تقرير شامل يوضح ماذا يعمل فعلاً، ماذا يعمل جزئياً، وما الذي ما يزال ناقصاً أو محجوباً ببيئة التشغيل

**Proceed immediately with Phase-2 parallel execution, full platform validation, and evidence-based reporting.**
