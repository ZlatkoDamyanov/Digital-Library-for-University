import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
dotenv.config();

const pool = new Pool();

async function approveAdminAccount() {
  const email = 'ZDamyanov@bfu.bg';
  
  try {
    console.log(`Одобрявам акаунт с имейл: ${email}...`);
    
    const result = await pool.query(
      `UPDATE users 
       SET status = 'APPROVED' 
       WHERE email = $1 
       RETURNING id, "firstName", "lastName", email, role, status`,
      [email]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Акаунт одобрен успешно:');
      console.log(`   Име: ${user.firstName} ${user.lastName}`);
      console.log(`   Имейл: ${user.email}`);
      console.log(`   Роля: ${user.role}`);
      console.log(`   Статус: ${user.status}`);
    } else {
      console.log('❌ Акаунт с този имейл не е намерен');
    }
  } catch (error) {
    console.error('❌ Грешка при одобряване на акаунт:', error);
  } finally {
    await pool.end();
  }
}

approveAdminAccount(); 