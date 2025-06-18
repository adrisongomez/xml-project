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
  <div class="max-w-6xl mx-auto py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-4xl font-bold">Create New Order</h1>
      <div class="flex gap-2">
        <button id="view-orders-btn" class="flex cursor-pointer items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100 text-sm font-medium"><span>📄</span>View Orders</button>
        <button class="flex items-center gap-2 px-4 py-2 border rounded bg-gray-100 text-sm font-medium opacity-60 cursor-not-allowed" disabled><span>⬇️</span>Export CSV</button>
      </div>
    </div>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 bg-white rounded-lg border p-6">
        <h2 class="text-2xl font-bold mb-1">Customer Information</h2>
        <p class="text-gray-500 mb-4">Enter customer details or search by email</p>
        <div class="mb-4">
          <label class="block font-semibold mb-1">Email</label>
          <input id="email" list="emails" class="w-full border rounded px-3 py-2" placeholder="Enter customer email" />
          <datalist id="emails"></datalist>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1">Name</label>
          <input id="name" class="w-full border rounded px-3 py-2" placeholder="Enter customer name" />
        </div>
        <div>
          <label class="block font-semibold mb-1">Phone Number</label>
          <input id="phone" class="w-full border rounded px-3 py-2" placeholder="Enter phone number" />
        </div>
      </div>
      <div class="w-full md:w-80 bg-white rounded-lg border p-6 flex flex-col justify-between">
        <div>
          <h2 class="text-2xl font-bold mb-4">Order Summary</h2>
          <div class="flex justify-between mb-2"><span>Subtotal:</span><span>$<span id="subtotal" >0.00</span></span></div>
          <div class="flex justify-between mb-2"><span>Tax (10%):</span><span>$<span id="taxes" >0.00</span></span></div>
          <hr class="my-2" />
          <div class="flex justify-between mb-4 text-xl font-bold"><span>Total:</span><span>$<span id="total" >0.00</span></span></div>
        </div>
        <button id="submit-order" class="w-full bg-gray-400 text-white font-semibold py-2 rounded mt-2 cursor-not-allowed" disabled>Submit Order</button>
      </div>
    </div>
    <div class="mt-8 bg-white rounded-lg border p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-2xl font-bold">Order Items</h2>
          <p class="text-gray-500">Add products to the order</p>
        </div>
        <button id="add-product-btn" class="flex cursor-pointer items-center gap-2 px-4 py-2 bg-black text-white rounded font-semibold text-sm"><span class="text-xl">+</span> Add Product</button>
      </div>
      <div id="items" class="text-gray-500 text-center py-8">No items added yet. Click "Add Product" to get started.</div>
    </div>
  </div>
  <div id="product-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
    <div class="bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-xl">Select Product</h2>
        <button id="close-modal" class="text-2xl text-gray-500 hover:text-red-500">&times;</button>
      </div>
      <p class="text-gray-500 mb-2">Search and choose a product to add to the order</p>
      <label class="block font-semibold mb-1">Search Products</label>
      <input id="product-search" placeholder="Type to search products..." class="border rounded px-3 py-2 w-full mb-4" />
      <ul id="product-results" class="space-y-2"></ul>
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

  emailInput.addEventListener("input", async () => {
    const list = await searchCustomers(emailInput.value);
    const match = list.find((c) => c.email === emailInput.value);
    if (match) {
      selectedCustomer = match;
      nameInput.value = match.name;
      phoneInput.value = match.phoneNumber;
    }
  });

  function renderItems() {
    const tbody = document.querySelector<HTMLTableSectionElement>("#items")!;
    const content = items
      .map(
        (item, idx) => `
      <div class="flex flex-row justify-between text-black">
        <span class="p-2">${item.product.name}</span>
        <span class="p-2">${item.product.price.toFixed(2)}</span>
        <span class="p-2">
          <input data-idx="${idx}" type="number" min="1" value="${
          item.quantity
        }" class="w-20 border p-1 qty" />
        </span>
        <span class="p-2">${(item.quantity * item.product.price).toFixed(
          2
        )}</sapn>
        <span class="p-2"><button data-idx="${idx}" class="remove text-red-500">Remove</button></span>
      </div>`
      )
      .join("");

    tbody.innerHTML = `
      <div class="w-full">
        <div class="flex font-bold text-gray-400 flex-row justify-between">
          <span class="p-2">Product Name</span>
          <span class="p-2">Price ($) </span>
          <span class="p-2">Quantity</span>
          <span class="p-2">Subtotal ($) </sapn>
          <span class="p-2">Actions</span>
        </div>
        ${content}
      </div>
    `;
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
    const subtotal = items.reduce(
      (sum, it) => sum + it.quantity * it.product.price,
      0
    );
    const taxes = subtotal * 0.1;
    const total = subtotal + taxes;
    const subtotalElement = document.getElementById("subtotal");
    const taxesElement = document.getElementById("taxes");
    const totalElement = document.getElementById("total");
    if (subtotalElement) {
      subtotalElement.textContent = subtotal.toFixed(2);
    }
    if (taxesElement) {
      taxesElement.textContent = taxes.toFixed(2);
    }
    if (totalElement?.textContent) {
      totalElement.textContent = total.toFixed(2);
    }
  }

  // Modal logic
  const modal = document.getElementById("product-modal")!;
  const searchInput = document.getElementById(
    "product-search"
  ) as HTMLInputElement;
  const results = document.getElementById(
    "product-results"
  ) as HTMLUListElement;

  document.getElementById("add-product-btn")!.addEventListener("click", () => {
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
      <li class="flex justify-between items-center border rounded px-3 py-2">
        <div>
          <div class="font-semibold">${p.name}</div>
          <div class="text-gray-500 text-sm">$${p.price.toFixed(2)}</div>
        </div>
        <button data-idx="${idx}" class="add bg-black text-white px-4 py-1 rounded font-semibold">Add</button>
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

  document.getElementById("view-orders-btn")!.addEventListener("click", () => {
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
      <tbody id="orders-table-tbody"></tbody>
    </table>
    <button id="download" class="px-3 py-1 bg-green-600 text-white rounded">Download CSV</button>
  </div>`;

  const tbody = document.getElementById("orders-table-tbody")!;
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
