import mysql from 'mysql2/promise';

// Create a reusable connection pool with support for explicit ports
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3307', 10), // 👈 Dynamic port routing layer
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
});

export default pool;