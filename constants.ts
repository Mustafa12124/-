
import { ShopSettings, Product } from './types';

export const DEFAULT_SETTINGS: ShopSettings = {
  name: 'معرض الأفق للأجهزة',
  specialty: 'تجارة الأجهزة الكهربائية والمنزلية',
  address: 'بغداد - الكرادة - شارع 62',
  phone: '07700000000',
  currency: 'د.ع',
  footerNote: 'البضاعة المباعة لا ترد ولا تستبدل بعد 3 أيام',
  users: [
    { id: '1', username: 'admin', password: '123', role: 'admin' }
  ]
};

export const INITIAL_CUSTOMERS = [
  { id: '1', name: 'أحمد محمد علي', phone: '07712345678', address: 'بغداد - المنصور', createdAt: new Date().toISOString() },
  { id: '2', name: 'سارة حسن', phone: '07812345678', address: 'البصرة - الجزائر', createdAt: new Date().toISOString() },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'ايفون 15 برو ماكس', buyPrice: 1500000, sellPrice: 1750000, stock: 10 },
  { id: '2', name: 'سامسونج S24 الترا', buyPrice: 1300000, sellPrice: 1550000, stock: 15 },
  { id: '3', name: 'كفر حماية شفاف', buyPrice: 5000, sellPrice: 15000, stock: 100 },
];

export const MOCK_INVOICES = [];
