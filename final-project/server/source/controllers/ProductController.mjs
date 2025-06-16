import Product from "../models/Product.mjs";
import Connection from "../db/Connection.mjs";

export default class ProductController {
  static async upsert(name, price, description, id = null) {
    const db = Connection.getInstance().db;
    let result;
    if (id) {
      result = await db.query(
        "UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *",
        [name, price, description, id]
      );
    } else {
      result = await db.query(
        "INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *",
        [name, price, description]
      );
    }
    return { product: new Product(result.rows[0]) };
  }

  static async findById(id) {
    const db = Connection.getInstance().db;
    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    return { product: new Product(result.rows[0]) };
  }

  static async deleteById(id) {
    const db = Connection.getInstance().db;
    const result = await db.query("DELETE FROM products WHERE id = $1", [id]);
    return result.rowCount > 0;
  }

  static async search(q) {
    const db = Connection.getInstance().db;
    if (q) {
      const result = await db.query(
        `SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1`,
        [`%${q}%`]
      );
      console.log("Hey");
      return result.rows.map((row) => ({
        product: new Product(row),
      }));
    } else {
      const result = await db.query("SELECT * FROM products", []);
      return result.rows.map((row) => ({
        product: new Product(row),
      }));
    }
  }
}
