import Connection from "../db/Connection.mjs";
import Customer from "../models/Customer.mjs";
import NotFoundError from "../utils/errors/NotFoundError.mjs";

function fromRow(row) {
  return new Customer(row.id, row.name, row.email, row.phone_number);
}

export default class CustomerController {
  static async deleteById(id) {
    const { db } = Connection.getInstance();
    const connection = await db.connect();
    connection.query("BEGIN");
    const result = await db.query(`DELETE FROM customers WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      throw new NotFoundError();
    }
    connection.query("COMMIT");
    return true;
  }

  static async findById(id) {
    const { db } = Connection.getInstance();
    const connection = await db.connect();
    const result = await connection.query(
      "SELECT id, name, email, phone_number FROM customers WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      throw new NotFoundError();
    }
    const row = result.rows[0];
    return { customer: fromRow(row) };
  }

  /**
   * @param {string} name
   * @param {string} email
   * @param {string} phoneNumber
   * @param {string} [id]
   */
  static async upsert(name, email, phoneNumber) {
    const { db } = Connection.getInstance();
    const connection = await db.connect();
    try {
      connection.query("BEGIN");
      const result = await db.query(
        `INSERT INTO customers (name, email, phone_number)
VALUES ($1, $2, $3)
ON CONFLICT (phone_number)
DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email
RETURNING id, name, email, phone_number;`,
        [name, email, phoneNumber]
      );
      connection.query("COMMIT");
      const row = result.rows[0];
      if (result.rowCount === 0) {
        throw new NotFoundError();
      }
      if (!row) {
        return null;
      }
      return { customer: fromRow(row) };
    } catch (error) {
      connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  }
}
