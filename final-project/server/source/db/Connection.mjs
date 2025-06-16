import { Pool } from "pg";

export default class Connection {
  /** @type {Connection} */
  static instance = null;

  constructor() {
    /**
     * @type {Pool}
     */
    this.db = new Pool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT,
      max: 20,
    });
  }

  static getInstance() {
    if (!Connection.instance) {
      Connection.instance = new Connection();
    }
    return Connection.instance;
  }
}
