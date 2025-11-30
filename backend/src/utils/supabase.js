import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ thư mục backend
dotenv.config({ path: join(__dirname, '../../.env') });

// Supabase configuration - đọc từ nhiều nguồn có thể
// Ưu tiên SERVICE_ROLE_KEY cho server-side để bypass RLS
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase URL hoặc Key chưa được cấu hình trong .env');
  console.warn('   Cần có: SUPABASE_URL và SUPABASE_ANON_KEY hoặc SUPABASE_SERVICE_ROLE_KEY');
  console.warn('   Đang sử dụng giá trị mặc định (sẽ không hoạt động)');
}

// Tạo Supabase client
const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co', 
  supabaseKey || 'your-anon-key',
  {
    auth: {
      persistSession: false, // Không lưu session trong server-side
    }
  }
);

export default supabase;

// Export helper functions để dễ sử dụng hơn
export const db = {
  // Users table
  users: () => supabase.from('users'),
  
  // Leads table
  leads: () => supabase.from('leads'),
  
  // Lead Activities table
  leadActivities: () => supabase.from('lead_activities'),
  
  // Customers table
  customers: () => supabase.from('customers'),
  
  // Products table
  products: () => supabase.from('products'),
  
  // Workflows table
  workflows: () => supabase.from('workflows'),
  
  // Workflow Stages table
  workflowStages: () => supabase.from('workflow_stages'),
  
  // Workflow Tasks table
  workflowTasks: () => supabase.from('workflow_tasks'),
  
  // Services table
  services: () => supabase.from('services'),
  
  // Invoices table
  invoices: () => supabase.from('invoices'),
  
  // Invoice Items table
  invoiceItems: () => supabase.from('invoice_items'),
  
  // Materials table
  materials: () => supabase.from('materials'),
  
  // Transactions table
  transactions: () => supabase.from('transactions'),
  
  // Expense Approvals table
  expenseApprovals: () => supabase.from('expense_approvals'),
};

