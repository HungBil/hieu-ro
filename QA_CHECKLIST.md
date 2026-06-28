# QA Checklist

- Register, confirm email, then login.
- `/app/write`: submit one unclear Vietnamese sentence.
- `/app/write/:sessionId`: verify original text, rewritten text, meaning structure, uncertainty questions, reasons, micro-lessons, and feedback buttons.
- Click each feedback path on a disposable session: `Đúng ý tôi`, `Chưa đúng ý`, `Thiếu ý`, `Quá dài`, `Khó hiểu`.
- Save phrase, create lesson, then review lesson with `Học lại`, `Khó`, `Nhớ rồi`, `Rất dễ`.
- Confirm empty states for recent sessions, lessons, samples, saved phrases, and community on a new account.
- Confirm user A cannot read user B private rows with the RLS query notes in `SECURITY.md`.
- Run `npm run verify` before merge or deploy.
