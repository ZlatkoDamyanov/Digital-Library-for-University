import pool from '../database/dlibrarydb.js';

export async function createUser({ firstName, lastName, email, universityId = null, password, role = 'USER' }) {
  const result = await pool.query(
    `INSERT INTO users ("firstName", "lastName", email, university_id, password, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, "firstName", "lastName", email, university_id AS "universityId", role`,
    [firstName, lastName, email, universityId, password, role]
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, "firstName", "lastName", email, university_id AS "universityId", password, role, status
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}