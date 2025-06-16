import Connection from "../db/Connection.mjs";
import { OrderInput } from "../utils/validators/OrderValidators.mjs";

async function getProductPrice(productId) {
  const db = Connection.getInstance().db;
  const result = await db.query("SELECT price FROM products WHERE id = $1", [
    productId,
  ]);
  if (result.rowCount === 0) throw new Error("Product not found");
  return Number(result.rows[0].price);
}

export default class OrderController {
  static async submit(input) {
    const parsed = await OrderInput.parseAsync(input);
    const db = Connection.getInstance().db;
    await db.query("BEGIN");
    let total = 0;
    const lineItems = [];
    for (const item of parsed.lineItems) {
      const price = await getProductPrice(item.productId);
      const subtotal = price * item.quantity;
      total += subtotal;
      lineItems.push({ ...item, subtotal, price });
    }
    const orderResult = await db.query(
      `INSERT INTO orders (customer_id, ordered_at, total)
       VALUES ($1, COALESCE($2, now()), $3)
       RETURNING *`,
      [parsed.customerId, new Date(), total]
    );
    const order = orderResult.rows[0];
    for (const item of lineItems) {
      await db.query(
        `INSERT INTO order_line_items (order_id, product_id, quantity, subtotal)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.subtotal]
      );
    }
    await db.query("COMMIT");
    return {
      order: {
        ...order,
        lineItems: { lineItem: lineItems },
      },
    };
  }

  static async get(id) {
    const db = Connection.getInstance().db;
    const orderResult = await db.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ]);
    if (orderResult.rowCount === 0) return null;
    const order = orderResult.rows[0];
    const lineItemsResult = await db.query(
      "SELECT * FROM order_line_items WHERE order_id = $1",
      [id]
    );
    return {
      order: {
        ...order,
        lineItems: { lineItem: lineItemsResult.rows },
      },
    };
  }

  static async update(id, input) {
    const parsed = await OrderInput.parseAsync(input);
    const db = Connection.getInstance().db;
    await db.query("BEGIN");
    let total = 0;
    const lineItems = [];
    for (const item of parsed.lineItems) {
      const price = await getProductPrice(item.productId);
      const subtotal = price * item.quantity;
      total += subtotal;
      lineItems.push({ ...item, subtotal, price });
    }
    const orderResult = await db.query(
      `UPDATE orders SET customerId = $1, ordered_at = COALESCE($2, ordered_at), total = $3
       WHERE id = $4 RETURNING *`,
      [parsed.customerId, parsed.ordered_at, total, id]
    );
    if (orderResult.rowCount === 0) {
      await db.query("ROLLBACK");
      return null;
    }
    await db.query("DELETE FROM order_line_items WHERE order_id = $1", [id]);
    for (const item of lineItems) {
      await db.query(
        `INSERT INTO order_line_items (order_id, productId, quantity, subtotal)
         VALUES ($1, $2, $3, $4)`,
        [id, item.productId, item.quantity, item.subtotal]
      );
    }
    await db.query("COMMIT");
    return {
      order: {
        ...orderResult.rows[0],
        lineItems: { lineItem: lineItems },
      },
    };
  }

  static async delete(id) {
    const db = Connection.getInstance().db;
    await db.query("BEGIN");
    await db.query("DELETE FROM order_line_items WHERE order_id = $1", [id]);
    const orderResult = await db.query(
      "DELETE FROM orders WHERE id = $1 RETURNING *",
      [id]
    );
    await db.query("COMMIT");
    return orderResult.rowCount > 0;
  }

  static async list({ from, to }) {
    const db = Connection.getInstance().db;
    let query = "SELECT * FROM orders";
    const params = [];
    if (from && to) {
      query += " WHERE ordered_at BETWEEN $1 AND $2";
      params.push(from, to);
    } else if (from) {
      query += " WHERE ordered_at >= $1";
      params.push(from);
    } else if (to) {
      query += " WHERE ordered_at <= $1";
      params.push(to);
    }
    query += " ORDER BY ordered_at DESC";
    const ordersResult = await db.query(query, params);
    const orders = [];
    for (const order of ordersResult.rows) {
      const lineItemsResult = await db.query(
        "SELECT * FROM order_line_items WHERE order_id = $1",
        [order.id]
      );
      orders.push({
        ...order,
        lineItems: { lineItem: lineItemsResult.rows },
      });
    }
    return { orders: orders.map((order) => ({ order })) };
  }
}
