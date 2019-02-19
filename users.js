const { Client } = require('pg');

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

async function validPassword(password1, password2) {
  if(password1 === password2) {
    return true;
  } else { 
      return false;
  }
}

module.exports = {
  query,
  insert,
  select,
  update,
  deleteRow, // delete er frátekið orð
  validPassword,
};

