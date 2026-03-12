import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
dotenv.config();

const pool = new Pool();

async function approveAllPendingAccounts() {
  try {
    console.log('🔍 Търся всички акаунти със статус PENDING...\n');
    
    const pendingResult = await pool.query(
      `SELECT id, "firstName", "lastName", email, role, status
       FROM users 
       WHERE status = 'PENDING'
       ORDER BY created_at ASC`
    );
    
    if (pendingResult.rows.length === 0) {
      console.log('✅ Няма акаунти със статус PENDING за одобряване');
      return;
    }
    
    console.log(`Намерени ${pendingResult.rows.length} акаунти за одобряване:\n`);
    
    pendingResult.rows.forEach((user, index) => {
      const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n⏳ Одобрявам всички pending акаунти...\n');
    
    const approveResult = await pool.query(
      `UPDATE users 
       SET status = 'APPROVED' 
       WHERE status = 'PENDING' 
       RETURNING id, "firstName", "lastName", email, role, status`
    );
    
    if (approveResult.rows.length > 0) {
      console.log(`✅ Успешно одобрени ${approveResult.rows.length} акаунта:`);
      
      approveResult.rows.forEach((user, index) => {
        const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
        console.log(`   ${index + 1}. ${roleIcon} ${user.firstName} ${user.lastName}`);
        console.log(`      Имейл: ${user.email}`);
        console.log(`      Роля: ${user.role}`);
        console.log(`      Нов статус: ${user.status}`);
        console.log('');
      });
      
      console.log('🎉 Всички акаунти са одобрени и могат да влязат в системата!');
    }
  } catch (error) {
    console.error('❌ Грешка при одобряване на акаунти:', error);
  } finally {
    await pool.end();
  }
}

approveAllPendingAccounts(); 