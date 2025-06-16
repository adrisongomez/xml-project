import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
});

async function seed() {
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM order_line_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM customers');

    const customerRes1 = await pool.query(
      'INSERT INTO customers (name, email, phone_number) VALUES ($1, $2, $3) RETURNING id',
      ['John Doe', 'john@example.com', '1111111111']
    );
    const customerRes2 = await pool.query(
      'INSERT INTO customers (name, email, phone_number) VALUES ($1, $2, $3) RETURNING id',
      ['Jane Smith', 'jane@example.com', '2222222222']
    );

    const productRes1 = await pool.query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING id, price',
      ['Widget', 9.99, 'Example product']
    );
    const productRes2 = await pool.query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING id, price',
      ['Gadget', 19.99, 'Another product']
    );

    const orderRes = await pool.query(
      'INSERT INTO orders (customer_id, ordered_at, total) VALUES ($1, now(), 0) RETURNING id',
      [customerRes1.rows[0].id]
    );
    const orderId = orderRes.rows[0].id;

    const subtotal1 = Number(productRes1.rows[0].price) * 1;
    const subtotal2 = Number(productRes2.rows[0].price) * 2;
    await pool.query(
      'INSERT INTO order_line_items (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
      [orderId, productRes1.rows[0].id, 1, subtotal1]
    );
    await pool.query(
      'INSERT INTO order_line_items (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
      [orderId, productRes2.rows[0].id, 2, subtotal2]
    );

    const total = subtotal1 + subtotal2;
    await pool.query('UPDATE orders SET total = $1 WHERE id = $2', [total, orderId]);

    await pool.query('COMMIT');
    console.log('Seeding complete');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error during seeding:', err);
  } finally {
    await pool.end();
  }
}

seed();
