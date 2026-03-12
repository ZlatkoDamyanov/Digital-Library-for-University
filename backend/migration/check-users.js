import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
dotenv.config();

const pool = new Pool();

async function checkUsers() {
  try {
    console.log('📋 Проверявам всички потребители в системата...\n');
    
    const result = await pool.query(
      `SELECT id, "firstName", "lastName", email, role, status, created_at
       FROM users 
       ORDER BY created_at DESC`
    );
    
    if (result.rows.length > 0) {
      console.log(`Намерени ${result.rows.length} потребители:\n`);
      
      result.rows.forEach((user, index) => {
        const statusIcon = user.status === 'APPROVED' ? '✅' : '⏳';
        const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
        
        console.log(`${index + 1}. ${statusIcon} ${roleIcon} ${user.firstName} ${user.lastName}`);
        console.log(`   Имейл: ${user.email}`);
        console.log(`   Роля: ${user.role}`);
        console.log(`   Статус: ${user.status}`);
        console.log(`   Създаден: ${new Date(user.created_at).toLocaleString('bg-BG')}`);
        console.log('');
      });
    } else {
      console.log('❌ Няма намерени потребители в системата');
    }
  } catch (error) {
    console.error('❌ Грешка при проверка на потребителите:', error);
  } finally {
    await pool.end();
  }
}

checkUsers(); 