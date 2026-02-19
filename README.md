# 🍎 Stockify: SuperMarket Inventory & Billing System

Stockify is a high-performance, full-stack management system designed for modern supermarkets. It streamlines inventory tracking, retail billing, and financial reporting with a premium, responsive user interface.

## 🚀 Key Features

### 📦 Inventory Management
- **Smart CRUD**: Manage products with tracking for category, barcode, and price.
- **Stock Guard**: Real-time stock tracking with **Low-Stock Alerts** (< 10 units).
- **Aging Stock**: Track **Expiry Dates** to prevent expired sales.
- **Bulk Import**: Upload thousands of items instantly via **CSV upload**.

### 🛒 Billing System
- **Rapid Checkout**: Search items by name or scan barcodes.
- **Automatic Calculations**: instant totals with 5% tax and custom discounts.
- **Dual Export**: Generate invoices as professional **PDFs** or data-heavy **Excel** files.
- **Loyalty Program**: Track customer mobile numbers and display active store offers.

### 📊 Records & Reports
- **Financial Dashboard**: Overview of revenue, order count, and estimated profit.
- **Transaction Vault**: Complete history of every bill generated, searchable and re-downloadable.
- **Visual Analytics**: Interactive charts for revenue growth and top-selling products.
- **Data Export**: Export entire sales or inventory databases to Excel for offline analysis.

### 🔐 User Roles
- **Admin**: Full access to inventory, user management (Settings), and financial reports.
- **Cashier**: Restricted focus on the Billing system only.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, TailwindCSS, Lucide-React, Chart.js.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

---

## ⚙️ Installation & Setup

1. **Prerequisites**
   - Node.js (v16+)
   - MongoDB (Local or Atlas)

2. **Environment Setup**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=supersecret123
   ```

3. **Install Dependencies**
   From the root directory:
   ```bash
   npm install
   npm run install-all
   ```

4. **Run Application**
   Start both backend and frontend concurrently:
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5000

---

## 👤 Default Credentials
- **Admin**: `admin` / `admin123`
- **Cashier**: Create one via the Admin Settings page.
