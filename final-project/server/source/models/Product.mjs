export default class Product {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {number} params.price
   * @param {string} [params.description]
   */
  constructor({ id, name, price, description }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
  }
}
