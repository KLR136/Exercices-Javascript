const mysql = require('mysql2/promise');

async function getConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'task_manager',
    password: 'AdriNatami08'
  });
  return connection;
}

module.exports = { getConnection };