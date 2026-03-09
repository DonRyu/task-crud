 import client from './client.js';

  export async function getAllTasks() {
    const result = await client.query(
      'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    return result.rows;
  }

  export async function getTaskById(id) {
    const result = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0];
  }

  export async function createTask(data) {
    const { title, description, priority, due_date } = data;
    const result = await client.query(
      'INSERT INTO tasks (title, description, priority, due_date) VALUES ($1, $2, $3, $4) RETURNING*',
      [title, description, priority, due_date]
    );
    return result.rows[0];
  }

  export async function updateTask(id, data) {
    const { title, description, status, priority, due_date } = data;
    const result = await client.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4, due_date=$5,updated_at=NOW() WHERE id=$6 AND deleted_at IS NULL RETURNING *',
      [title, description, status, priority, due_date, id]
    );
    return result.rows[0];
  }

  export async function deleteTask(id) {
    await client.query(
      'UPDATE tasks SET deleted_at=NOW() WHERE id=$1',
      [id]
    );
  }