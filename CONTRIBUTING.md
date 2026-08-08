# Хувь нэмэр оруулах заавар

**Gerege Nexus** (`open-gerege-nexus`) төсөлд хувь нэмэр оруулах сонирхол гаргасанд баярлалаа. Модуль бүтэцтэй, өндөр бүтээмжтэй нээлттэй эхийн платформыг хамтдаа бүтээхэд таны оролцоог урьж байна.

<p>
  <img src="docs/assets/icons/flag-mn.png" width="18" height="18" alt=""> <b>Монгол</b>
  &nbsp;·&nbsp;
  <a href="docs/CONTRIBUTING_EN.md"><img src="docs/assets/icons/flag-en.png" width="18" height="18" alt=""> English</a>
</p>

---

## Хариуцагчид

Төслийг дараах баг хөгжүүлж, хариуцан ажиллуулна:

- **Gerege Systems Development Team** ([@gerege-systems](https://github.com/gerege-systems))
- **Gemini AI**, **Claude AI**

---

## Ёс зүйн дүрэм

Хувь нэмэр оруулагч бүр [Ёс зүйн дүрэм](CODE_OF_CONDUCT.md)-ийг мөрдөнө. Зохисгүй үйлдлийг `community@gerege.mn` хаягаар мэдэгдэнэ үү.

---

## Хэрхэн хувь нэмэр оруулах вэ

### 1. Алдаа мэдээлэх

Алдаа мэдээлэхийн өмнө нээлттэй issue-үүдийг шалгаж, давхардал үүсгэхээс сэргийлнэ үү. Мэдээлэлдээ дараахыг заавал оруулна:

- Алдааг давтан гаргах тодорхой алхмууд.
- Ажиллаж буй орчин (Node.js хувилбар, үйлдлийн систем, PostgreSQL хувилбар).
- Хүлээгдэж буй ба бодит үр дүн, боломжтой бол лог.

### 2. Шинэ боломж санал болгох

Санал болгож буй боломжийн хэрэглээний тохиолдол, шийдэх гэж буй асуудал, төсөөлж буй шийдлээ тодорхой бичнэ үү.

### 3. Pull request илгээх

1. **Салбар үүсгэх** — `git checkout -b feature/amazing-feature`.
2. **Код бичих хэв маягийг мөрдөх**:
   - Backend: Node.js 22 LTS, Express.js CommonJS (CJS) стандартын бичиглэл.
   - Frontend: Next.js 16 App Router, Pure Vanilla CSS (Tailwind CSS ашиглахгүй).
3. **Тест бичих** — backend-д нэмэгдсэн логик бүрт `test/server.test.js` тест дагалдана.
4. **Шалгалтуудыг ажиллуулах**:

   ```bash
   # Backend: Тестүүдийг ажиллуулах
   cd backend
   npm test

   # Frontend: build шалгах
   cd ../frontend
   npm run build
   ```

5. **Commit бичлэг** — [Conventional Commits](https://www.conventionalcommits.org/) хэлбэрийг баримтална:
   - `feat: add invoice management module`
   - `fix: resolve stock level calculation rounding`
   - `docs: update module authoring guide`
6. **PR нээх** — `main` салбар руу чиглүүлнэ.

---

## Шинэ бизнес модуль нэмэх

1. `backend/src/modules/<module_name>/` дор Express рутер үүсгэнэ.
2. `backend/src/server.js` дээр рутерээ бүртгэнэ.
3. `catalog/manifests/<slug>.json` manifest файл болон `catalog/apps.json` мета датаг шинэчилнэ.
4. `frontend/app/<module_name>/page.jsx` дор дэлгэц нэмнэ.

Дэлгэрэнгүйг [Модуль хөгжүүлэх заавар](docs/MODULE_AUTHORING_GUIDE.md)-аас үзнэ үү.
