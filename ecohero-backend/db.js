
const mysql = require('mysql2/promise');

// Database connection settings
const dbConfig = {
  host: 'localhost',      
  user: 'root',    
  password: 'dReYx7hp_5GBJ8w',
  database: 'ecohero', 
};

async function initializeDatabase() {
  try {
    const connection = await mysql.createPool(dbConfig);
    console.log('Database connected successfully!');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

const pool = mysql.createPool(dbConfig);
module.exports = pool;
