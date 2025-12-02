1) Import backend (serverless functions)
- Vercel → New Project → Import Git Repository → chọn repo của bạn.
- Khi tới phần Configure:
  - Root Directory: `backend`
  - Framework Preset: để mặc định / Other
  - Install Command: `npm install`
  - Build Command: để trống
  - Output Directory: để trống
- Deploy.
- Vercel sẽ detect functions ở `backend/api/` (ta đã tạo `backend/api/index.js`).

2) Thiết lập Environment Variables cho backend (Settings → Environment Variables)
- Thêm từng biến (Production, và Preview nếu cần). Ví dụ:
  - `DATABASE_URL` = `postgresql://user:pass@host:5432/dbname`
  - `SUPABASE_URL` = `https://your-project.supabase.co` (nếu dùng)
  - `SUPABASE_SERVICE_ROLE_KEY` (hoặc `SUPABASE_ANON_KEY`)
  - `JWT_SECRET` = `...`
  - `CORS_ORIGIN` = `https://<your-frontend>.vercel.app`
  - `NODE_ENV` = `production`
- Lưu và redeploy nếu cần. Kiểm tra Logs → Functions để xem lỗi connection.

3) Import frontend
- Vercel → New Project → Import cùng repo.
- Configure:
  - Root Directory: `frontend`
  - Framework Preset: Vite
  - Install Command: `npm install`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Trong Environment Variables của frontend thêm:
  - `VITE_API_URL` = `https://<your-backend>.vercel.app/api`  (sau khi backend deploy xong, copy domain từ Vercel)

4) Test production
- Mở frontend production URL, thao tác các chức năng gọi API.
- Nếu lỗi CORS hoặc 5xx: mở backend Logs → xem lỗi DB / env thiếu → chỉnh env vars.

5) (Nếu muốn dùng CLI) Thêm env qua Vercel CLI:
- Cài: `npm i -g vercel`
- Ví dụ: `vercel env add DATABASE_URL production` → dán giá trị khi được hỏi

Gợi ý nhanh xử lý .env:
- KHÔNG upload file `.env` lên GitHub.
- Mở `backend/.env` local, copy giá trị từng biến và dán vào Vercel Dashboard (hoặc dùng `vercel env add`).
