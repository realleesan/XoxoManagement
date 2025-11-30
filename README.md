# XoxoManagement

Hệ thống quản trị cho cửa hàng bán đồ da - Quản lý Lead, Quy trình sửa chữa, Tài chính và Kho hàng.

## Technology Stack

### Frontend
- React 18+ với JavaScript (JSX)
- Vite (build tool)
- React Router v6
- Ant Design (UI Framework)
- Zustand (State Management)
- TanStack Query (React Query)
- Axios (HTTP Client)

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Supabase (Database hosting)

## Cấu trúc dự án

```
XoxoManagement/
├── frontend/          # React frontend
├── backend/           # Express backend
├── docs/              # Tài liệu
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+ 
- npm hoặc yarn
- PostgreSQL database (Supabase recommended)

### 1. Clone repository
```bash
git clone <repository-url>
cd XoxoManagement
```

### 2. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies (root, backend, frontend)
npm run install:all

# Hoặc cài đặt từng phần:
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies
cd ../frontend && npm install  # Frontend dependencies
```

### 3. Setup Backend

```bash
cd backend

# Tạo file .env (copy từ .env.example hoặc tạo mới)
# Thêm các biến môi trường:
# DATABASE_URL="postgresql://user:password@host:port/database"
# JWT_SECRET="your-secret-key"
# PORT=5000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Generate Prisma Client (nếu đã setup database)
npm run prisma:generate

# Chạy migrations (nếu đã setup database)
npm run prisma:migrate
```

### 4. Chạy dự án

**Cách 1: Chạy cả Frontend và Backend cùng lúc (Khuyến nghị)**
```bash
# Từ thư mục root
npm run dev
```

Lệnh này sẽ chạy cả backend (port 5000) và frontend (port 3000) cùng lúc.

**Cách 2: Chạy riêng từng phần**

Backend:
```bash
npm run dev:backend
# Hoặc
cd backend && npm run dev
```

Frontend:
```bash
npm run dev:frontend
# Hoặc
cd frontend && npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Scripts

### Root (Chạy từ thư mục root)
- `npm run dev` - Chạy cả frontend và backend cùng lúc
- `npm run dev:backend` - Chỉ chạy backend
- `npm run dev:frontend` - Chỉ chạy frontend
- `npm run install:all` - Cài đặt tất cả dependencies
- `npm run build` - Build frontend production
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:studio` - Mở Prisma Studio (database GUI)

### Backend (Chạy từ thư mục backend)
- `npm run dev` - Chạy server với nodemon (auto-reload)
- `npm start` - Chạy server production
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:studio` - Mở Prisma Studio (database GUI)

### Frontend (Chạy từ thư mục frontend)
- `npm run dev` - Chạy dev server
- `npm run build` - Build production
- `npm run preview` - Preview production build

## Database Schema

Xem chi tiết trong `backend/prisma/schema.prisma`

Các models chính:
- User (Authentication)
- Lead (CRM)
- Customer
- Product
- Workflow (Quy trình sửa chữa)
- Invoice (Hóa đơn)
- Material (Nguyên vật liệu)
- Transaction (Giao dịch tài chính)

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Development

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Mở browser: `http://localhost:3000`

## Deployment

### Frontend
- Deploy lên Vercel hoặc Netlify
- Build command: `npm run build`
- Output directory: `dist`

### Backend
- Deploy lên Railway, Render hoặc VPS
- Set environment variables
- Run migrations: `npm run prisma:migrate`

## License

ISC

