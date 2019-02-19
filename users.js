const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;

async function query(q, values = []) {
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const result = await client.query(q, values);

    return result;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

async function insert(data) {
  const q = `
INSERT INTO users
(username, password, name, email, admin)
VALUES
($1, $2, $3, $4, $5)`;
  const values = [data.username, data.password, data.name, data.email, data.admin];

  return query(q, values);
}

async function select() {
  const result = await query('SELECT * FROM users ORDER BY id');

  return result.rows;
}

async function update(id) {
  const q = `
UPDATE users
SET processed = true, updated = current_timestamp
WHERE id = $1`;

  return query(q, id);
}

async function deleteRow(id) {
  const q = 'DELETE FROM users WHERE id = $1';

  return query(q, id);
}

async function comparePassword(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }
  return false;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';
  const result = await query(q, [username]);
  
  if (result.rows.length > 0) {
    const found = result.rows[0];
    return Promise.resolve(found);
  } 

  return Promise.resolve(null);
}

async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';
  const result = await query(q, [id]);

  if (result.rows.length > 0) {
    const found = result.rows[0];
    return Promise.resolve(found);
  } 

  return Promise.resolve(null);
}


module.exports = {
  query,
  insert,
  select,
  update,
  deleteRow, // delete er frátekið orð
  comparePassword, 
  findByUsername, 
  findById
};

