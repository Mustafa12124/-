
export type PaymentStatus = 'paid' | 'unpaid' | 'late' | 'debt';
export type InvoiceType = 'cash' | 'installment' | 'credit'; // Credit implies partial payment/debt

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, hash this. Here plain for demo.
  role: 'admin' | 'employee';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
}

export interface ProductItem {
  id: string;
  productId?: string; // Link to inventory
  name: string;
  price: number;
  quantity: number;
  buyPrice?: number; // To calculate profit
}

export interface Installment {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  type: InvoiceType;
  items: ProductItem[];
  totalAmount: number; // Sum of items
  discount: number;
  finalAmount: number; // After discount
  
  // Payment Details
  paidAmount: number; // What the customer paid now
  remainingAmount: number; // Debt
  
  notes?: string;
  
  // Installment specific
  months?: number;
  installments?: Installment[];
}

export interface ShopSettings {
  name: string;
  specialty: string; // Business description/items traded
  address: string;
  phone: string;
  logoUrl?: string;
  currency: string;
  footerNote: string;
  users: User[];
}

export interface Stats {
  totalSales: number;
  totalCustomers: number;
  activeInstallments: number;
  totalDebts: number;
}
