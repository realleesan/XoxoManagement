# Hướng dẫn cấu hình Supabase

## 1. Lấy thông tin từ Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** > **API**
4. Copy các thông tin sau:

## 2. Cấu hình trong file `.env`

Thêm các biến sau vào file `backend/.env`:

```env
# Supabase Configuration (cho Supabase Client)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Hoặc dùng Service Role Key cho admin operations (cẩn thận với key này!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection String (cho raw SQL với pg)
# Lấy từ Settings > Database > Connection string > URI
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
# Hoặc
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

## 3. Lấy Connection String từ Supabase

1. Vào **Settings** > **Database**
2. Tìm phần **Connection string**
3. Chọn **URI** và copy
4. Thay `[YOUR-PASSWORD]` bằng password database của bạn

## 4. Kiểm tra kết nối

Chạy test để kiểm tra:

```bash
node test/supabase.test.js
```

## 5. Tạo các bảng trong Supabase

Bạn có thể:
- Dùng SQL Editor trong Supabase Dashboard
- Hoặc chạy migration scripts từ Prisma schema
- Hoặc tạo bảng thủ công qua Supabase UI

## Lưu ý:

- **SUPABASE_ANON_KEY**: Dùng cho client-side và public operations
- **SUPABASE_SERVICE_ROLE_KEY**: Dùng cho server-side và bypass RLS (Row Level Security)
- **DATABASE_URL**: Dùng cho raw SQL queries với `pg` package

