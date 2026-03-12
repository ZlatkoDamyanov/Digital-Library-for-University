import db from '../database/dlibrarydb.js';

const checkStructure = async () => {
  try {
    // Check enum type
    const enumResult = await db.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'borrow_status'
      ORDER BY e.enumsortorder;
    `);

    console.log('Current borrow_status enum values:', enumResult.rows);

    // Check borrow_records table structure
    const tableResult = await db.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'borrow_records';
    `);

    console.log('\nBorrow records table structure:', tableResult.rows);

    // Check current status values
    const statusResult = await db.query(`
      SELECT DISTINCT status
      FROM borrow_records;
    `);

    console.log('\nCurrent status values in use:', statusResult.rows);

  } catch (error) {
    console.error('Error checking structure:', error);
  }
};

checkStructure().catch(console.error); 