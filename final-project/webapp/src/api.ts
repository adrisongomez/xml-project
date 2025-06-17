export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderedAt: string;
  total: number;
}

export interface LineItem {
  product: Product;
  quantity: number;
}

const apiBase = "/api";

function parseCustomers(xml: string): Customer[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const items = Array.from(doc.getElementsByTagName("customer"));
  return items.map((el) => ({
    id: el.getElementsByTagName("id")[0]?.textContent || "",
    name: el.getElementsByTagName("name")[0]?.textContent || "",
    email: el.getElementsByTagName("email")[0]?.textContent || "",
    phoneNumber: el.getElementsByTagName("phoneNumber")[0]?.textContent || "",
  }));
}

function parseProducts(xml: string): Product[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const items = Array.from(doc.getElementsByTagName("product"));
  return items.map((el) => ({
    id: el.getElementsByTagName("id")[0]?.textContent || "",
    name: el.getElementsByTagName("name")[0]?.textContent || "",
    price: Number(el.getElementsByTagName("price")[0]?.textContent || 0),
    description: el.getElementsByTagName("description")[0]?.textContent || "",
  }));
}

function parseOrders(xml: string): Order[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const items = Array.from(doc.getElementsByTagName("order"));
  return items.map((el) => ({
    id: el.getElementsByTagName("id")[0]?.textContent || "",
    customerId: el.getElementsByTagName("customer_id")[0]?.textContent || "",
    orderedAt: el.getElementsByTagName("ordered_at")[0]?.textContent || "",
    total: Number(el.getElementsByTagName("total")[0]?.textContent || 0),
  }));
}

export async function searchCustomers(email: string): Promise<Customer[]> {
  const res = await fetch(`${apiBase}/customers?email=${encodeURIComponent(email)}`);
  const text = await res.text();
  return parseCustomers(text);
}

export async function createCustomer(name: string, email: string, phoneNumber: string): Promise<Customer> {
  const body = `<customerInput><name>${name}</name><email>${email}</email><phoneNumber>${phoneNumber}</phoneNumber></customerInput>`;
  const res = await fetch(`${apiBase}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body,
  });
  const text = await res.text();
  return parseCustomers(text)[0];
}

export async function searchProducts(q: string): Promise<Product[]> {
  const res = await fetch(`${apiBase}/products?q=${encodeURIComponent(q)}`);
  const text = await res.text();
  return parseProducts(text);
}

export async function submitOrder(customerId: string, items: LineItem[]): Promise<void> {
  const lineItems = items
    .map((item) => `<lineItem><productId>${item.product.id}</productId><quantity>${item.quantity}</quantity></lineItem>`)
    .join("");
  const body = `<orderInput><customerId>${customerId}</customerId><lineItems>${lineItems}</lineItems></orderInput>`;
  await fetch(`${apiBase}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body,
  });
}

export async function fetchOrders(params: { from?: string; to?: string }): Promise<Order[]> {
  const query =
    "?" +
    [
      params.from ? `from=${encodeURIComponent(params.from)}` : "",
      params.to ? `to=${encodeURIComponent(params.to)}` : "",
    ]
      .filter(Boolean)
      .join("&");
  const res = await fetch(`${apiBase}/orders${query}`);
  const text = await res.text();
  return parseOrders(text);
}

export function ordersToCsv(orders: Order[]): string {
  const header = "id,customerId,orderedAt,total";
  const lines = orders.map((o) => [o.id, o.customerId, o.orderedAt, o.total].join(","));
  return [header, ...lines].join("\n");
}
