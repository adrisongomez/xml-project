# XML Final Project

## Summary

This project is a Node.js/Express API for managing customers, products, and orders, designed for the BIU Master Subject XML Service. It supports XML and JSON payloads, uses PostgreSQL for persistence, and is fully compatible with db-migrate for migrations and seeding.

## Tools & Technologies

- **Node.js** & **Express**: RESTful API server
- **PostgreSQL**: Database
- **db-migrate**: Database migrations and seeding
- **Zod**: Input validation
- **fast-xml-parser**: XML parsing and building
- **body-parser-xml**: XML body parsing middleware
- **dotenv**: Environment variable management
- **morgan**: HTTP request logging

## Setup

1. Install dependencies:

   ```sh
   yarn install
   ```

2. Configure your database in `final-project/database.json`.

3. Run migrations and seed data:

   ```sh
   yarn migrate:up
   ```

4. Start the server:

   ```sh
   yarn dev
   ```

## API Endpoints

### Customers

- `POST   /api/customers` — Create or upsert a customer
- `PUT    /api/customers/:id` — Update a customer
- `GET    /api/customers/:id` — Get a customer by ID
- `DELETE /api/customers/:id` — Delete a customer
- `GET    /api/customers` — Search customers by `email` or `phoneNumber` query params

### Products

- `POST   /api/products` — Create or upsert a product
- `PUT    /api/products/:id` — Update a product
- `GET    /api/products/:id` — Get a product by ID
- `DELETE /api/products/:id` — Delete a product
- `GET    /api/products` — List/search products (supports `q` query param)

### Orders

- `POST   /api/orders` — Create an order with line items
- `PUT    /api/orders/:id` — Update an order and its line items
- `GET    /api/orders/:id` — Get an order by ID (with line items)
- `DELETE /api/orders/:id` — Delete an order
- `GET    /api/orders` — List orders (supports `from` and `to` query params for date range)

## Payload Examples

### Create Product (XML)

```xml
<productInput>
  <name>Wireless Mouse</name>
  <price>29.99</price>
  <description>A comfortable and responsive wireless mouse.</description>
</productInput>
```

### Create Order (XML)
```xml
<orderInput>
  <customerId>11111111-1111-1111-1111-111111111111</customerId>
  <lineItems>
    <lineItem>
      <productId>aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1</productId>
      <quantity>2</quantity>
    </lineItem>
  </lineItems>
</orderInput>
```

## Validation

All input is validated using Zod schemas. Errors are returned in XML or JSON format, matching the request's content type.

## Migrations & Seeding

- Migrations are managed with db-migrate and are located in `final-project/migrations/`.
- To seed the database, run `yarn migrate:up` after configuring your database.

