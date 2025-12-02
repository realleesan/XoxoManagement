/**
 * Database utility với raw SQL queries
 * Sử dụng pg để kết nối trực tiếp với PostgreSQL/Supabase
 */
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ thư mục backend
dotenv.config({ path: join(__dirname, '../../.env') });

const { Pool } = pg;

// Tạo connection pool (reuse across serverless invocations)
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL chưa được cấu hình trong .env');
}

// Reuse pool when possible to avoid creating new pools on every invocation (important for serverless)
if (!global.__pgPool) {
  global.__pgPool = new Pool({
    connectionString: connectionString,
    ssl: connectionString?.includes('supabase') || connectionString?.includes('vercel')
      ? { rejectUnauthorized: false }
      : false,
  });
}

const pool = global.__pgPool;

// Helper function để query
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { 
      text: text.substring(0, 100) + '...', 
      duration, 
      rows: res.rowCount 
    });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('   Query:', text.substring(0, 200));
    console.error('   Params:', params);
    throw error;
  }
};

// Helper function để get client từ pool (cho transactions)
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set timeout để tránh client bị treo
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch để clear timeout khi release
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

// Export default là object với query và getClient
const db = {
  query,
  getClient,
};

export default db;

