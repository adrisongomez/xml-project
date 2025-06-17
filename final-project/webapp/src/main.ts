import "./style.css";
import type { Customer, Order, LineItem } from "./api";
import {
  searchCustomers,
  createCustomer,
  searchProducts,
  submitOrder,
  fetchOrders,
  ordersToCsv,
} from "./api";

// ---------- UI ----------

const app = document.querySelector<HTMLDivElement>("#app")!;

function renderOrderForm() {
  app.innerHTML = `
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold">Create Order</h1>
    <div>
      <label class="block text-sm font-medium">Email</label>
      <input id="email" list="emails" class="border p-2 w-full" />
      <datalist id="emails"></datalist>
    </div>
    <div>
      <label class="block text-sm font-medium">Name</label>
      <input id="name" class="border p-2 w-full" />
    </div>
    <div>
      <label class="block text-sm font-medium">Phone Number</label>
      <input id="phone" class="border p-2 w-full" />
    </div>

    <table class="w-full border" id="items">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2 border">Product</th>
          <th class="p-2 border">Unit Price</th>
          <th class="p-2 border">Quantity</th>
          <th class="p-2 border">Subtotal</th>
          <th class="p-2 border"></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button id="add-product" class="px-3 py-1 bg-blue-500 text-white rounded">Add Product</button>
    <div class="text-right font-bold">Total: $<span id="total">0</span></div>
    <div class="space-x-2">
      <button id="submit-order" class="px-3 py-1 bg-green-600 text-white rounded">Submit Order</button>
      <button id="goto-orders" class="px-3 py-1 bg-gray-600 text-white rounded">View Orders</button>
    </div>
  </div>

  <div id="product-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white text-black p-4 space-y-2 w-96">
      <div class="flex justify-between items-center">
        <h2 class="font-bold">Add Product</h2>
        <button id="close-modal" class="text-red-500">X</button>
      </div>
      <input id="product-search" placeholder="Search" class="border p-2 w-full" />
      <ul id="product-results" class="max-h-60 overflow-auto"></ul>
    </div>
  </div>
  `;

  const emailInput = document.getElementById("email") as HTMLInputElement;
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const phoneInput = document.getElementById("phone") as HTMLInputElement;
  const datalist = document.getElementById("emails") as HTMLDataListElement;

  let selectedCustomer: Customer | null = null;
  let items: LineItem[] = [];

  emailInput.addEventListener("input", async () => {
    const list = await searchCustomers(emailInput.value);
    datalist.innerHTML = list
      .map((c) => `<option value="${c.email}">${c.name}</option>`)
      .join("");
  });

  emailInput.addEventListener("change", async () => {
    const list = await searchCustomers(emailInput.value);
    const match = list.find((c) => c.email === emailInput.value);
    if (match) {
      selectedCustomer = match;
      nameInput.value = match.name;
      phoneInput.value = match.phoneNumber;
    }
  });

  function renderItems() {
    const tbody = document.querySelector<HTMLTableSectionElement>("#items tbody")!;
    tbody.innerHTML = items
      .map(
        (item, idx) => `
      <tr>
        <td class="border p-2">${item.product.name}</td>
        <td class="border p-2">${item.product.price.toFixed(2)}</td>
        <td class="border p-2"><input data-idx="${idx}" type="number" min="1" value="${item.quantity}" class="w-20 border p-1 qty" /></td>
        <td class="border p-2">${(
          item.quantity * item.product.price
        ).toFixed(2)}</td>
        <td class="border p-2"><button data-idx="${idx}" class="remove text-red-500">Remove</button></td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll<HTMLInputElement>(".qty").forEach((input) => {
      input.addEventListener("change", () => {
        const i = Number(input.dataset.idx);
        items[i].quantity = Number(input.value);
        updateTotal();
        renderItems();
      });
    });

    tbody.querySelectorAll<HTMLButtonElement>(".remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        items.splice(i, 1);
        updateTotal();
        renderItems();
      });
    });
  }

  function updateTotal() {
    const total = items.reduce(
      (sum, it) => sum + it.quantity * it.product.price,
      0
    );
    (document.getElementById("total") as HTMLElement).textContent = total.toFixed(
      2
    );
  }

  // Modal logic
  const modal = document.getElementById("product-modal")!;
  const searchInput = document.getElementById(
    "product-search"
  ) as HTMLInputElement;
  const results = document.getElementById("product-results") as HTMLUListElement;

  document
    .getElementById("add-product")!
    .addEventListener("click", () => {
      modal.classList.remove("hidden");
      searchInput.value = "";
      results.innerHTML = "";
    });

  document.getElementById("close-modal")!.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  searchInput.addEventListener("input", async () => {
    const list = await searchProducts(searchInput.value);
    results.innerHTML = list
      .map(
        (p, idx) => `
        <li class="flex justify-between items-center border-b p-1">
          <span>${p.name} - $${p.price.toFixed(2)}</span>
          <button data-idx="${idx}" class="add text-blue-600">Add</button>
        </li>`
      )
      .join("");

    results.querySelectorAll<HTMLButtonElement>(".add").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = list[Number(btn.dataset.idx)];
        items.push({ product, quantity: 1 });
        updateTotal();
        renderItems();
        modal.classList.add("hidden");
      });
    });
  });

  document
    .getElementById("submit-order")!
    .addEventListener("click", async () => {
      let customerId = selectedCustomer?.id;
      if (!customerId) {
        const created = await createCustomer(
          nameInput.value,
          emailInput.value,
          phoneInput.value
        );
        customerId = created.id;
      }
      await submitOrder(customerId!, items);
      alert("Order submitted");
      items = [];
      renderItems();
      updateTotal();
    });

  document
    .getElementById("goto-orders")!
    .addEventListener("click", () => {
      location.hash = "#orders";
    });
}

function renderOrdersList() {
  app.innerHTML = `
  <div class="max-w-3xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold">Orders</h1>
    <div class="flex space-x-2 items-end">
      <div>
        <label class="block text-sm font-medium">From</label>
        <input id="from" type="date" class="border p-2" />
      </div>
      <div>
        <label class="block text-sm font-medium">To</label>
        <input id="to" type="date" class="border p-2" />
      </div>
      <button id="search-orders" class="px-3 py-1 bg-blue-500 text-white rounded">Search</button>
      <button id="back" class="px-3 py-1 bg-gray-600 text-white rounded">Back</button>
    </div>
    <table class="w-full border" id="orders-table">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2 border">ID</th>
          <th class="p-2 border">Customer</th>
          <th class="p-2 border">Date</th>
          <th class="p-2 border">Total</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button id="download" class="px-3 py-1 bg-green-600 text-white rounded">Download CSV</button>
  </div>`;

  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#orders-table tbody"
  )!;
  let data: Order[] = [];

  async function load() {
    const from = (document.getElementById("from") as HTMLInputElement).value;
    const to = (document.getElementById("to") as HTMLInputElement).value;
    data = await fetchOrders({ from, to });
    tbody.innerHTML = data
      .map(
        (o) => `
        <tr>
          <td class="border p-2">${o.id}</td>
          <td class="border p-2">${o.customerId}</td>
          <td class="border p-2">${o.orderedAt}</td>
          <td class="border p-2">${o.total.toFixed(2)}</td>
        </tr>`
      )
      .join("");
  }

  document.getElementById("search-orders")!.addEventListener("click", load);
  document.getElementById("back")!.addEventListener("click", () => {
    location.hash = "";
  });

  document.getElementById("download")!.addEventListener("click", () => {
    const csv = ordersToCsv(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  load();
}

function router() {
  if (location.hash.startsWith("#orders")) {
    renderOrdersList();
  } else {
    renderOrderForm();
  }
}

window.addEventListener("hashchange", router);
router();

