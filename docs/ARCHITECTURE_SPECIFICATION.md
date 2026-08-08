# Архитектурын тодорхойлолт

**Gerege Nexus**-ын систем архитектур, давхаргууд ба техникийн шийдвэрүүд.

<p>
  <img src="assets/icons/flag-mn.png" width="18" height="18" alt=""> <b>Монгол</b>
  &nbsp;·&nbsp;
  <a href="ARCHITECTURE_SPECIFICATION_EN.md"><img src="assets/icons/flag-en.png" width="18" height="18" alt=""> English</a>
</p>

[Баримт бичгийн төв рүү буцах](README.md)

---

## 1. Системийн ерөнхий архитектур

**Gerege Nexus** нь өндөр бүтээмжтэй, Монгол Улсын цахим дэд бүтэцтэй нягт холбогдох боломжтой **модульт монолит платформ** — төрийн болон хувийн хэвшлийн байгууллагын үйлчилгээ, үйл ажиллагаа, систем, өгөгдлийг нэгтгэнэ.

### 1.1 Өндөр бүтээмжтэй модуль монолит

- **Node.js 22 LTS & Express.js (CommonJS - CJS)** — Бизнес модулиуд (`contacts`, `products`, `inventory`, `billing`, `documents`, `developer_portal`, `esign`, `gov_services`, `ai`) нь Express рутерууд хэлбэрээр цэвэр, хөнгөн байдлаар зохион байгуулагдсан.
- **Хүчирхэг бааз ба Connection Pool** — `pg` (node-postgres) native connection pool ашиглан PostgreSQL өгөгдлийн сантай шууд харьцана. 
- **Тенант бүрийн апп стор** — модуль тус бүр тенантад идэвхтэй эсэхийг PostgreSQL (`app_installations`) болон Express `appGateMiddleware` динамикаар шийднэ.
- **Каталогийн синк** — `catalog/apps.json` цорын ганц эх сурвалж бөгөөд `apps` хүснэгт ачаалал бүрт түүнээс автоматаар шинэчлэгдэнэ.

### 1.2 Аюулгүй байдал ба Хөнгөн Тэсвэрлэлт

- **Zero-Dependency Rate Limiting** (`src/middleware/rateLimit.js`) — IP-д суурилсан санах ойн хөнгөн rate limiter.
- **Auth & Session Store** (`src/middleware/auth.middleware.js`) — JWT болон PostgreSQL дээрх Session токен шалгагч.
- **Pure Vanilla CSS Design System** — Фронтенд дээр ямар нэг Tailwind CSS ашиглахгүйгээр цэвэр CSS variables, theme switching (Light/Dark mode) болон хурдан ажиллах загварын системийг байгуулсан.

---

## 2. Системийн бүтцийн диаграм

```
+-----------------------------------------------------------------------------------+
|                              Gerege Nexus                                         |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
      +-------------------+                               +-------------------+
      | Next.js Client    |                               | Node.js Express   |
      | (Pure Vanilla CSS)|                               | (CommonJS - CJS)  |
      +-------------------+                               +-------------------+
                |                                                   |
        +-------+-------+                                   +-------+-------+
        |               |                                   |               |
+---------------+ +---------------+                 +---------------+ +---------------+
| AI Copilot UI | | E-ID / DAN    |                 | Express       | | State Exchange|
|  Drawer Panel | | SSO Provider  |                 | Middlewares   | | (xyp.gerege)  |
+---------------+ +---------------+                 +---------------+ +---------------+
                                                            |
                                                    +---------------+
                                                    | Shared-Schema |
                                                    |  PostgreSQL   |
                                                    +---------------+
```

---

## 3. Хүсэлтийн урсгал

1. **Дундын middleware** — Helmet аюулгүй байдлын header-үүд, CORS, асинхрон алдаа баригч `asyncHandler`, хүсэлтийн логлолт.
2. **Танилт** — Session токеныг cookie эсвэл `Authorization: Bearer` толгойгоос уншиж шалгана.
3. **Тенантын контекст** — `tenant_id` нь request-д шингэж, бүх асуулга түүгээр хязгаарлагдана.
4. **Апп хаалт** — Модулийн маршрут бүр `appGateMiddleware` дээр `app_installations` хүснэгтийн төлөвөөр шалгагдана; суулгаагүй бол `403 Forbidden`.
5. **Модулийн controller/router** — Бизнес логик, өгөгдлийн сангийн гүйлгээ.
