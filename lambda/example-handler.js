/**
 * Example Lambda handler demonstrating mssql usage
 * This file is for reference only - not included in the layer
 */

const sql = require('mssql');

// Configure connection from environment variables
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Connection pool - reused across invocations
let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

exports.handler = async (event) => {
  try {
    const pool = await getPool();

    // Example: Query products
    const result = await pool.request()
      .input('category', sql.VarChar, event.category || 'all')
      .query(`
        SELECT ProductId, ProductName, Price
        FROM Products
        WHERE Category = @category OR @category = 'all'
      `);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: result.recordset,
        count: result.recordset.length,
      }),
    };
  } catch (err) {
    console.error('Database error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
