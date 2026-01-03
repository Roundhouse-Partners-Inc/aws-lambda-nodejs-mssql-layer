/**
 * Simple test to verify mssql can connect to SQL Server
 * Used in CI/CD pipeline to validate the Lambda layer
 */

const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // For local testing
    trustServerCertificate: true,
  },
};

async function runTest() {
  console.log('Testing mssql connection...');
  console.log(`Server: ${config.server}:${config.port}`);
  console.log(`Database: ${config.database}`);

  try {
    const pool = await sql.connect(config);
    console.log('Connected successfully!');

    const result = await pool.request().query('SELECT @@VERSION AS version');
    console.log('SQL Server Version:', result.recordset[0].version.split('\n')[0]);

    // Test a simple query
    const testResult = await pool.request().query('SELECT 1 + 1 AS result');
    if (testResult.recordset[0].result !== 2) {
      throw new Error('Query returned unexpected result');
    }
    console.log('Query test passed!');

    await pool.close();
    console.log('Connection closed.');
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTest();
