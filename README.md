# Touchwood

واجهة متجر مبنية بـ Next.js مع API مستقل مبني بـ Express وMongoDB.

## البنية

- `src/app`: صفحات Next.js ومسارات الواجهة فقط.
- `src/components`: مكونات العرض المشتركة.
- `src/services/api.js`: عميل HTTP الوحيد للواجهة.
- `backend`: API، نماذج MongoDB، controllers، routes، وmiddleware.

لا توجد Route Handlers أو نماذج MongoDB مكررة داخل Next.js؛ مصدر البيانات الوحيد هو `backend`.

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env.local` واضبط `NEXT_PUBLIC_API_URL`.
2. انسخ `backend/.env.example` إلى `backend/.env` واضبط `MONGO_URI` و`SECRET_KEY`.
3. ثبّت الحزم في الجذر وفي `backend`:

```bash
npm install
npm --prefix backend install
```

4. شغّل الـAPI في نافذة:

```bash
npm run dev:api
```

5. شغّل Next.js في نافذة أخرى:

```bash
npm run dev
```

واجهة المتجر تعمل على `http://localhost:3000` والـAPI على `http://localhost:5000`.

## ملاحظات

- صفحة الإدارة: `/ar/admin` أو `/en/admin`.
- الحماية الفعلية لعمليات الإدارة موجودة في Express عبر JWT و`adminMiddleware`.
- لا تضف مفاتيح البيئة إلى Git.
