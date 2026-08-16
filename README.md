# Gerege Nexus

**Үйлчилгээ, үйл ажиллагаа, системийн нэгдсэн платформ**

**Gerege Nexus** нь төрийн болон хувийн хэвшлийн байгууллагын үйлчилгээ, үйл
ажиллагаа, систем, өгөгдлийг нэгтгэх модульт платформ юм. Cloud-native
экосистемээс санаа авсан, өндөр бүтээмжтэй, Монгол Улсын цахим дэд бүтэц (ДАН,
E-ID, ХУР / XYP)-тэй шууд холбогдох боломжтой, **монгол хэлийг үндсэн хэл
болгосон** нээлттэй эхийн шийдэл.

*Nexus* гэдэг нь холбох цэг — байгууллага, үйлчилгээ, ажлын урсгал, систем,
хэрэглэгч, өгөгдөл нэг дор уулзах цэгийг хэлнэ. Платформ өөрөө нэг салбарт
зориулагдаагүй: дээр нь ажиллах модулиуд л тухайн байгууллагын хэрэгцээг
тодорхойлно.

Node.js 22 LTS & Express.js дээр суурилсан хөнгөн авсаархан Модуль Монолит архитектур,
тенант бүрт аль апп идэвхтэйг PostgreSQL дээрх апп стор шийднэ — сүлжээний нэмэлт дуудлагагүй,
микросервисийн нарийн төвөгтэй байдалгүйгээр модуль хуваарилалт хийнэ.

**Хэлний бодлого: монгол хэл + НҮБ-ын албан ёсны 6 хэл** — араб, хятад, англи,
франц, орос, испани. Нийт 7 хэл. Монгол хэл эх сурвалж; баримт бичиг долуулаа
байдаг бол програм хангамж нь монгол, англи хоёроор ирж, үлдсэнийг нь
**Тохиргоо → Харагдац** дотроос асаана. Дэлгэрэнгүйг
[орчуулгын гарын авлага](docs/TRANSLATION_GUIDE.md)-аас үзнэ үү.

<p>
  <img src="docs/assets/icons/flag-mn.png" width="18" height="18" alt=""> <b>Монгол</b>
  &nbsp;·&nbsp;
  <a href="docs/README_AR.md"><img src="docs/assets/icons/flag-ar.png" width="18" height="18" alt=""> العربية</a>
  &nbsp;·&nbsp;
  <a href="docs/README_ZH.md"><img src="docs/assets/icons/flag-zh.png" width="18" height="18" alt=""> 中文</a>
  &nbsp;·&nbsp;
  <a href="docs/README_EN.md"><img src="docs/assets/icons/flag-en.png" width="18" height="18" alt=""> English</a>
  &nbsp;·&nbsp;
  <a href="docs/README_FR.md"><img src="docs/assets/icons/flag-fr.png" width="18" height="18" alt=""> Français</a>
  &nbsp;·&nbsp;
  <a href="docs/README_RU.md"><img src="docs/assets/icons/flag-ru.png" width="18" height="18" alt=""> Русский</a>
  &nbsp;·&nbsp;
  <a href="docs/README_ES.md"><img src="docs/assets/icons/flag-es.png" width="18" height="18" alt=""> Español</a>
</p>

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org)
[![CI](https://github.com/gerege-systems/open-gerege-nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/gerege-systems/open-gerege-nexus/actions/workflows/ci.yml)
[![Security](https://github.com/gerege-systems/open-gerege-nexus/actions/workflows/security.yml/badge.svg)](https://github.com/gerege-systems/open-gerege-nexus/actions/workflows/security.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Агуулга

- [Хөгжүүлэгчид](#хөгжүүлэгчид)
- [Үндсэн боломжууд](#үндсэн-боломжууд)
- [Бэлэн бизнес аппликейшнүүд](#бэлэн-бизнес-аппликейшнүүд)
- [Төслийн бүтэц](#төслийн-бүтэц)
- [Ажиллуулах заавар](#ажиллуулах-заавар)
- [Тохиргооны хувьсагчид](#тохиргооны-хувьсагчид)
- [API-н тойм](#api-н-тойм)
- [Тест ба чанарын хяналт](#тест-ба-чанарын-хяналт)
- [Аюулгүй байдал](#аюулгүй-байдал)
- [Баримт бичгийн индекс](#баримт-бичгийн-индекс)

---

## Хөгжүүлэгчид

| Оролцогч | Үүрэг |
| --- | --- |
| **Gerege Systems Development Team** ([@gerege-systems](https://github.com/gerege-systems)) | Архитектур, платформын цөм |
| **Gemini AI** | Код үүсгэлт, баримтжуулалт |
| **Claude AI** | Код шинжилгээ, аюулгүй байдлын аудит |

---

## Үндсэн боломжууд

### 1. Өндөр бүтээмжтэй модуль монолит архитектур

### 1. Өндөр бүтээмжтэй модуль монолит архитектур

- **Node.js Express апп модулиуд** — модулиуд (`contacts`, `products`,
  `inventory`, `billing`, `documents`, `developer_portal`, `esign`, `gov_services`, `ai`) нь Express.js рутерууд хэлбэрээр нэг процесс дотор ажиллана.
- **Тенант бүрийн апп стор** — тенант тус бүрийн апп эрх, меню, RBAC тохиргоо
  PostgreSQL (`app_installations`) болон Express `appGateMiddleware` дээр динамикаар удирдагдана.
- **Каталог синк** — `catalog/apps.json` нь цорын ганц эх сурвалж; `apps`
  хүснэгт ачаалал бүрт үүнээс шинэчлэгдэнэ.

### 2. Pure Vanilla CSS Дизайн Систем

- **Zero-Tailwind CSS** — Фронтенд дээр Tailwind CSS сангуудыг бүрэн хасаж, хөнгөн ажиллах Pure Vanilla CSS дизайн системийг (`frontend/app/globals.css`) хэрэгжүүлсэн.

### 3. Төрийн цахим дэд бүтцийн интеграци

- **ХУР — Төрийн мэдээлэл солилцооны систем** (`src/modules/integrations/integrations.router.ts`):
  иргэний бүртгэл (`WS100101`), хуулийн этгээдийн баталгаажуулалт (`WS100201`).
- **Үндэсний E-ID ба ДАН** ([`developer.gerege.mn`](https://developer.gerege.mn),
  [`eidmongolia.mn`](https://eidmongolia.mn)) — тоон гарын үсэг (PKI), нэг
  удаагийн код (Mobile OTP), банкны суваг (Bank SSO), царай танилт (Biometric).
- **Платформын өөрийн OAuth2 / OIDC provider**
  (`/.well-known/openid-configuration`) — гуравдагч системд client credentials
  урсгалаар токен олгоно.

---

## Бэлэн бизнес аппликейшнүүд

| # | Апп | ID | Зам | Тайлбар |
| --- | --- | --- | --- | --- |
| 1 | Contacts | `io.example.contacts` | `/contacts` | Харилцагчийн бүртгэл, ХУР авто-бөглөлт |
| 2 | Products | `io.example.products` | `/products` | Бараа, үнэ, тенантад хамаарах SKU |
| 3 | Inventory | `io.example.inventory` | `/inventory` | Агуулах, үлдэгдэл, хөдөлгөөний бүртгэл |
| 4 | Public Billing & e-Barimt | `io.example.billing` | `/billing` | Нэхэмжлэх, 10% НӨАТ, e-Barimt баримт |
| 5 | Digital Documents & E-Sign | `io.example.documents` | `/documents` | Цахим баримт, гарын үсэг, батламжийн урсгал |
| 6 | Developer Portal & OAuth2 SSO | `io.example.developer_portal` | `/developer/apps` | OAuth2 client апп бүртгэл |
| 7 | PDF цахим гарын үсэг | `io.example.esign` | `/esign` | eID Mongolia (PIN2) хуулийн хүчин төгөлдөр цахим гарын үсэг, Gerege eSign HSM, багц баталгаажуулалт, гарын үсгийн лог |

---

## Төслийн бүтэц

```
backend/
  src/
    config/           Тохиргоо (env.ts)
    db/               PostgreSQL pool (index.ts) ба SQL миграци (migrate.ts)
    middleware/       Auth, RBAC, RateLimit, Error хянагчууд
    modules/          Бизнес модулиудын Express рутерууд
    platform/         Апп каталогийн синк
    server.ts         Express серверийг асаах үндсэн файл
  db/migrations/      SQL миграцууд
frontend/             Next.js 16 (App Router) + Pure Vanilla CSS
catalog/              Апп сторын каталог ба manifest-ууд
deploy/               Production Dockerfile, Nginx тохиргоо
docs/                 Баримт бичиг ба орчуулгууд
```

---

## Ажиллуулах заавар

### Шаардлагатай програмууд

- Node.js 22 LTS+
- PostgreSQL 16+ (эсвэл Docker Compose)

### 1. Docker Compose (хамгийн хялбар)

```bash
docker compose up -d
```

### 2. Гараар ажиллуулах

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Вэб хөтөч дээрээ [http://localhost:3000](http://localhost:3000) хаягаар орно уу.

### Туршилтын нэвтрэх эрх

| Талбар | Утга |
| --- | --- |
| И-мэйл | `admin@example.com` |
| Нууц үг | `Password123!` |
| Тенант | `Demo Corporation` (`slug: demo`) |

Энэ бүртгэл зөвхөн хөгжүүлэлтийн орчинд үүснэ. Production дээр
`SEED_DEMO_DATA=true` гэж тодорхой заагаагүй бол огт үүсэхгүй.

---

## Автомат deploy

`main` салбар руу push хийх бүрд [`deploy.yml`](.github/workflows/deploy.yml)
ажиллана:

1. Backend ба frontend образыг GHCR руу угсарч илгээнэ (`:latest` ба `:<sha>`).
2. `docker-compose.prod.yml`-ийг серверт хуулна.
3. Серверт `.env`-ийг GitHub secret-ээс шинээр бичиж, образуудыг татна.
4. Миграц бүрэн дуусмагц API ба frontend солигдоно.
5. `/health` ба `/ready`-г шалгаж, амжилтгүй бол лог хэвлээд алдаа өгнө.

Гараар ажиллуулахдаа Actions → *Deploy to Production* → **Run workflow**
(шаардвал тодорхой tag зааж болно).

Шаардлагатай repository secrets:

| Secret | Заавал | Тайлбар |
| --- | --- | --- |
| `DEPLOY_SSH_KEY` | Тийм | Deploy хэрэглэгчийн хувийн түлхүүр. Байхгүй бол rollout алгасана |
| `POSTGRES_PASSWORD` | Тийм | Сервер дэх өгөгдлийн сангийн нууц үг |
| `SSO_DEFAULT_CLIENT_SECRET` | Тийм | Production дээр OAuth2 client-д зайлшгүй |
| `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_PORT` | Үгүй | Анхдагч: `nexus.gerege.mn` / `deploy` / `22` |
| `PUBLIC_ORIGIN` | Үгүй | Анхдагч: `https://nexus.gerege.mn` |

> Production домэйн нь `nexus.gerege.mn`. Өмнөх `openerp.gerege.mn` домэйныг
> Gerege Nexus нэршилд шилжихэд орлуулсан. `PUBLIC_ORIGIN` нь CORS, OIDC issuer,
> eID callback гурвыг нэг дор тодорхойлдог тул түүнийг өөрчлөхөд DNS, TLS
> гэрчилгээ, issuer-т тулгуурласан client бүр хамт шилжинэ.

Серверт зөвхөн Docker шаардлагатай — эх код ч, Go/Node ч хэрэггүй. Утгуудын
жишээг [`deploy/.env.prod.example`](deploy/.env.prod.example)-ээс үзнэ үү.

---

## Тохиргооны хувьсагчид

Бүрэн жагсаалтыг [`.env.example`](.env.example)-ээс үзнэ үү.

| Хувьсагч | Анхдагч | Тайлбар |
| --- | --- | --- |
| `DATABASE_URL` | localhost | PostgreSQL холболтын мөр |
| `PORT` | `8080` | API сонсох порт |
| `ENVIRONMENT` | `development` | `production` үед аюулгүй байдлын хатуу горим |
| `APP_CATALOG_PATH` | `catalog/apps.json` | Апп сторын каталогийн зам |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS зөвшөөрөгдсөн эх сурвалж |
| `TRUST_PROXY_HEADERS` | `false` | `X-Forwarded-For`-д итгэх эсэх |
| `SEED_DEMO_DATA` | production-оос бусад үед идэвхтэй | Туршилтын бүртгэл үүсгэх |
| `SSO_DEFAULT_CLIENT_SECRET` | — | Production дээр заавал шаардлагатай |
| `GEMINI_API_KEY` | — | AI chat, voice, TTS, орчуулгыг идэвхжүүлэх түлхүүр |
| `GEMINI_MODEL` / `GEMINI_TTS_MODEL` | Gemini 2.5 Flash загварууд | Chat ба дууны model сонголт |
| `EID_MOCK_MODE` / `DAN_MOCK_MODE` / `XYP_MOCK_MODE` | production-оос бусад үед идэвхтэй | Төрийн системийн mock горим |

---

## API-н тойм

| Аргачлал | Зам | Тайлбар |
| --- | --- | --- |
| `GET` | `/health`, `/ready` | Амьд ба бэлэн байдлын шалгалт |
| `GET` | `/metrics` | Prometheus хэмжүүрүүд |
| `POST` | `/api/v1/auth/login` | И-мэйл/нууц үгээр нэвтрэх |
| `POST` | `/api/v1/auth/eid/login` | Үндэсний E-ID-аар нэвтрэх |
| `POST` | `/api/v1/auth/dan/login` | ДАН гарцаар нэвтрэх |
| `POST` | `/api/v1/auth/logout` | Session-ийг цуцлах |
| `GET` | `/api/v1/menus` | Тенантад идэвхтэй цэсүүд |
| `GET` | `/api/v1/store/apps` | Апп сторын жагсаалт |
| `POST` | `/api/v1/ai/chat`, `/stt`, `/tts`, `/translate` | Tenant-safe Gemini AI pipeline |
| `GET/PUT` | `/api/v1/admin/ai/prompts/{key}` | AI prompt тохируулах (админ) |
| `GET/POST` | `/api/v1/admin/ai/knowledge` | AI мэдлэгийн сан (админ) |
| `POST` | `/api/v1/store/apps/{slug}/install` | Апп суулгах (админ) |
| `POST` | `/api/v1/verify/send` | И-мэйл баталгаажуулах холбоос илгээх (клиент түлхүүр эсвэл session) |
| `GET` | `/api/v1/verify/confirm` | Захидал дахь холбоосыг хүлээн авах — нэг л удаа ажиллана |
| `GET/POST/PUT/DELETE` | `/api/v1/admin/email-verification/*` | Баталгаажуулалтын тойм ба API клиентүүд (админ) |
| `POST` | `/oauth2/token` | OAuth2 client credentials токен |

Нэвтрэлтийн токен нь HttpOnly cookie эсвэл `Authorization: Bearer <token>`
толгойгоор дамжина.

---

## Тест ба чанарын хяналт

```bash
# Backend нэгж тестүүд
cd backend && npm test

# Frontend build
cd frontend && npm run build
```

CI нь push ба pull request бүр дээр тест болон frontend build шалгалтыг ажиллуулна.

---

## Аюулгүй байдал

- Session токен нь 256 бит санамсаргүй утга бөгөөд өгөгдлийн санд зөвхөн
  SHA-256 хэш нь хадгалагдана.
- Нууц үг bcrypt-ээр хэшлэгдэнэ; нэвтрэх хүсэлтэд IP-д суурилсан хурдны
  хязгаарлалт үйлчилнэ.
- Апп суулгах, идэвхжүүлэх, интеграц бүртгэх үйлдэл тенантын админ эрх шаардана.
- OAuth2 client танилт тогтмол хугацааны харьцуулалтаар (constant-time)
  шалгагдана.

Эмзэг байдал мэдээлэх журмыг [`SECURITY.md`](SECURITY.md)-ээс үзнэ үү.

---

## Баримт бичгийн индекс

| Баримт | Тайлбар |
| --- | --- |
| [Баримт бичгийн төв](docs/README.md) | Бүх баримтын индекс ба орчуулгууд |
| [Архитектурын тодорхойлолт](docs/ARCHITECTURE_SPECIFICATION.md) | Платформын давхаргууд ба шийдвэрүүд |
| [Модуль хөгжүүлэх заавар](docs/MODULE_AUTHORING_GUIDE.md) | Шинэ апп модуль бичих алхмууд |
| [Хамтран ажиллах заавар](CONTRIBUTING.md) | Хувь нэмэр оруулах журам |
| [Аюулгүй байдлын бодлого](SECURITY.md) | Эмзэг байдал мэдээлэх |
| [Ёс зүйн дүрэм](CODE_OF_CONDUCT.md) | Хамт олны хэм хэмжээ |
| [Өөрчлөлтийн түүх](CHANGELOG.md) | Хувилбар бүрийн өөрчлөлт |

---

## Ашигласан ба санаа авсан төслүүд

1. **[snykk/go-rest-boilerplate](https://github.com/snykk/go-rest-boilerplate)**
   by **[@snykk](https://github.com/snykk)** — Go REST API суурь архитектур.
2. **[Odoo](https://github.com/odoo/odoo)** — модуль апп стор ба хамаарал
   шийдвэрлэх загвар.
3. **[go-zero](https://github.com/zeromicro/go-zero)** — cloud-native
   resilience хөдөлгүүр.

---

## Лиценз

Copyright (c) 2026 **Gerege Systems Development Team, Gerege Nomadica Foundation**. Apache 2.0 лицензээр тараагдана — [`LICENSE`](LICENSE)-ийг үзнэ үү.

Тугны дүрсийг [Flaticon](https://www.flaticon.com/)-оос авсан
([оруулсан хувь нэмэр](docs/assets/icons/ATTRIBUTION.md)).
