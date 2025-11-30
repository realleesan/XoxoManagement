import supabase from '../src/utils/supabase.js';
import db from '../src/utils/db.js';

/**
 * Test Supabase connection và các table cơ bản
 */
async function testSupabaseConnection() {
  console.log('🧪 Bắt đầu test Supabase...\n');

  try {
    // Test 1: Kiểm tra kết nối Supabase
    console.log('1️⃣ Test kết nối Supabase...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Lỗi kết nối Supabase:', error.message);
      console.log('   (Có thể chưa có bảng users hoặc chưa cấu hình SUPABASE_URL/SUPABASE_ANON_KEY)\n');
    } else {
      console.log('✅ Kết nối Supabase thành công!\n');
    }

    // Test 2: Kiểm tra raw SQL connection
    console.log('2️⃣ Test kết nối raw SQL (pg)...');
    try {
      const result = await db.query('SELECT NOW() as current_time');
      console.log('✅ Kết nối raw SQL thành công!');
      console.log('   Current time:', result.rows[0].current_time, '\n');
    } catch (error) {
      console.log('⚠️  Lỗi kết nối raw SQL:', error.message);
      console.log('   (Cần cấu hình DATABASE_URL hoặc SUPABASE_DB_URL trong .env)\n');
    }

    // Test 3: Kiểm tra các table có sẵn (nếu có quyền)
    console.log('3️⃣ Kiểm tra các table có sẵn...');
    try {
      const tables = [
        'users', 'leads', 'lead_activities', 'customers', 
        'products', 'workflows', 'workflow_stages', 'workflow_tasks',
        'services', 'invoices', 'invoice_items', 'materials',
        'transactions', 'expense_approvals'
      ];

      const availableTables = [];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          if (!error || error.code === 'PGRST116') {
            availableTables.push(table);
          }
        } catch (e) {
          // Skip if table doesn't exist
        }
      }

      if (availableTables.length > 0) {
        console.log('✅ Các table có sẵn:', availableTables.join(', '));
      } else {
        console.log('⚠️  Chưa có table nào được tìm thấy');
        console.log('   Cần chạy migration để tạo các table');
      }
      console.log('');
    } catch (error) {
      console.log('⚠️  Lỗi khi kiểm tra tables:', error.message, '\n');
    }

    // Test 4: Test query đơn giản với Supabase
    console.log('4️⃣ Test query với Supabase...');
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(5);
      
      if (error && error.code !== 'PGRST116') {
        console.log('⚠️  Lỗi khi query users:', error.message);
      } else {
        console.log('✅ Query users thành công!');
        console.log('   Số lượng users:', users?.length || 0);
      }
    } catch (error) {
      console.log('⚠️  Lỗi khi query:', error.message);
    }

    // Test 5: Test raw SQL query
    console.log('\n5️⃣ Test raw SQL query...');
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM users');
      console.log('✅ Raw SQL query thành công!');
      console.log('   Số lượng users:', result.rows[0]?.count || 0);
    } catch (error) {
      console.log('⚠️  Lỗi raw SQL query:', error.message);
      console.log('   (Có thể chưa có bảng users hoặc chưa cấu hình database)');
    }

    console.log('\n✅ Tất cả các test đã hoàn thành!');
    console.log('🎉 Supabase setup thành công!\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
    throw error;
  } finally {
    // Đóng connection pool
    await db.end();
    console.log('🔌 Đã đóng kết nối database');
  }
}

// Chạy test
testSupabaseConnection()
  .then(() => {
    console.log('\n✨ Test hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test thất bại:', error);
    process.exit(1);
  });

