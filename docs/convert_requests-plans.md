
## Kiến trúc đề xuất - XoxoManagement (JSX)

### 1. Technology Stack 

#### Frontend

- React 18+ với JavaScript (JSX)
- Vite (build tool)
- React Router v6
- State Management:
  - Zustand (global state)
  - TanStack Query (React Query) (server state, caching)
- UI Framework:
  - Ant Design
  - Tailwind CSS
- Form: React Hook Form
- Charts: Chart.js
- File Upload: React Dropzone
- QR Code: qrcode.react
- Excel: xlsx
- Date: date-fns

#### Backend

- Node.js + Express + JavaScript
- Prisma ORM (PostgreSQL)
- PostgreSQL (Supabase)
- JWT Authentication
- File Storage: Cloudinary hoặc local storage
- Email: Nodemailer
- Real-time: Socket.io (nếu cần)

### 2. Kiến trúc tổng thể

```
┌─────────────────────────────────────┐
│     Frontend (React + JSX)          │
│     - Vite                          │
│     - Ant Design                    │
│     - Zustand + React Query         │
└─────────────────────────────────────┘
              ↕ HTTP/WebSocket
┌─────────────────────────────────────┐
│     Backend (Express + JS)           │
│     - REST API                       │
│     - JWT Auth                       │
│     - Socket.io (optional)           │
└─────────────────────────────────────┘
              ↕ Prisma
┌─────────────────────────────────────┐
│     PostgreSQL Database              │
│     (Supabase hoặc VPS)              │
└─────────────────────────────────────┘
```

### 3. Cấu trúc thư mục Frontend (JSX)

```
xoxo-management/
├── public/
│   └── ...
│
├── src/
│   ├── components/              # Components (.jsx)
│   │   ├── common/            
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Table.jsx
│   │   │   └── ...
│   │   │
│   │   ├── leads/             
│   │   │   ├── LeadList.jsx
│   │   │   ├── LeadKanban.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   └── ...
│   │   │
│   │   ├── workflows/         
│   │   ├── products/          
│   │   ├── customers/         
│   │   ├── finance/           
│   │   └── ...
│   │
│   ├── pages/                   # Các trang (.jsx)
│   │   ├── Dashboard.jsx
│   │   ├── Leads/
│   │   │   ├── index.jsx
│   │   │   └── [id].jsx
│   │   ├── Workflows/
│   │   └── ...
│   │
│   ├── hooks/                   # Custom hooks (.js)
│   │   ├── useAuth.js
│   │   ├── useLeads.js
│   │   └── ...
│   │
│   ├── services/                # API calls (.js)
│   │   ├── api.js               # Axios instance
│   │   ├── auth.service.js
│   │   ├── leads.service.js
│   │   └── ...
│   │
│   ├── store/                   # Zustand stores (.js)
│   │   ├── authStore.js
│   │   ├── uiStore.js
│   │   └── ...
│   │
│   ├── utils/                   # Utility functions (.js)
│   │   ├── format.js
│   │   ├── validation.js
│   │   └── ...
│   │
│   ├── constants/               # Constants (.js)
│   │   ├── routes.js
│   │   ├── status.js
│   │   └── ...
│   │
│   ├── App.jsx                  # App component
│   ├── main.jsx                 # Entry point
│   └── router.jsx               # Router config
│
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### 4. Cấu trúc thư mục Backend (JavaScript)

```
backend/
├── src/
│   ├── controllers/            # Route handlers (.js)
│   │   ├── auth.controller.js
│   │   ├── leads.controller.js
│   │   └── ...
│   │
│   ├── services/               # Business logic (.js)
│   │   ├── auth.service.js
│   │   ├── leads.service.js
│   │   └── ...
│   │
│   ├── middleware/             # Express middleware (.js)
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── ...
│   │
│   ├── routes/                 # API routes (.js)
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── leads.routes.js
│   │   └── ...
│   │
│   ├── utils/                  # Utilities (.js)
│   │   ├── jwt.js
│   │   ├── validation.js
│   │   └── ...
│   │
│   ├── app.js                  # Express app
│   └── server.js               # Server entry
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/           
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

### 5. Database Schema

Giữ nguyên như trước (Prisma schema), không đổi.

### 6. API Routes & Frontend Routes

Giữ nguyên như trước, không đổi.

### 7. File Extensions

- Components: `.jsx`
- Pages: `.jsx`
- Hooks: `.js`
- Services/Utils: `.js`
- Config files: `.js`

### 8. Tóm tắt quyết định cuối cùng

- Frontend: React + JavaScript (JSX) + Vite + Ant Design
- State: Zustand + React Query
- Backend: Node.js + Express + JavaScript
- Database: PostgreSQL + Prisma
- Authentication: JWT đơn giản
- File Storage: Cloudinary hoặc local
- Deployment: Vercel (frontend) + Railway/Render (backend)
