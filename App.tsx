
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  FileText, 
  CreditCard,
  Menu,
  X,
  Package,
  Wallet,
  Printer,
  Edit,
  Trash2,
  Plus,
  Save,
  Search,
  UserPlus,
  Shield,
  Upload,
  Download,
  FileJson
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

import { 
  Customer, 
  Invoice, 
  ShopSettings, 
  Installment,
  InvoiceType,
  PaymentStatus,
  Product,
  ProductItem,
  User
} from './types';
import { DEFAULT_SETTINGS, INITIAL_CUSTOMERS, INITIAL_PRODUCTS } from './constants';
import { getFromStorage, saveToStorage } from './services/storage';

// --- Components ---

// 1. Sidebar
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'products', label: 'المخزون والأصناف', icon: Package },
    { id: 'invoices', label: 'الفواتير والمبيعات', icon: ShoppingCart },
    { id: 'debts', label: 'مديونية العملاء', icon: Wallet },
    { id: 'installments', label: 'إدارة الأقساط', icon: CreditCard },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/70 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 right-0 z-30 w-64 bg-slate-900 border-l border-slate-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} no-print`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-white tracking-wider">نظام الإدارة</h1>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="ml-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors font-medium">
            <LogOut size={20} className="ml-3" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
};

// 2. Dashboard Page
const Dashboard = ({ stats, invoices }: { stats: any, invoices: Invoice[] }) => {
  const chartData = useMemo(() => {
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = invoices
        .filter(inv => inv.date === date)
        .reduce((sum, inv) => sum + inv.finalAmount, 0);
      return { date: date.substring(5), sales: daySales };
    });
  }, [invoices]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white">لوحة التحكم</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'إجمالي المبيعات', value: stats.totalSales.toLocaleString(), unit: 'د.ع', color: 'bg-blue-600', icon: FileText },
          { label: 'إجمالي الديون', value: stats.totalDebts.toLocaleString(), unit: 'د.ع', color: 'bg-orange-500', icon: Wallet },
          { label: 'عدد العملاء', value: stats.totalCustomers, unit: 'عميل', color: 'bg-emerald-600', icon: Users },
          { label: 'أقساط متأخرة', value: stats.overdueInstallments, unit: 'قسط', color: 'bg-red-600', icon: CreditCard },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900 overflow-hidden rounded-xl shadow-lg border border-slate-800 hover:border-slate-700 transition-all">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 ${stat.color} bg-opacity-90`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-400">{stat.label}</dt>
                    <dd>
                      <div className="text-lg font-bold text-white">{stat.value} <span className="text-xs font-normal text-slate-500">{stat.unit}</span></div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6">
        <h3 className="text-lg font-bold text-white mb-6">المبيعات آخر 7 أيام</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="date" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toLocaleString()} د.ع`, 'المبيعات']}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 3. Products/Inventory Page
const ProductsManager = ({ products, addProduct, updateProduct, deleteProduct }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({ name: '', buyPrice: 0, sellPrice: 0, stock: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            updateProduct(editingProduct.id, formData);
        } else {
            addProduct(formData);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', buyPrice: 0, sellPrice: 0, stock: 0 });
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if(window.confirm('هل أنت متأكد تماماً من حذف هذا الصنف؟')) {
            deleteProduct(id);
        }
    };

    const filteredProducts = products.filter((p: Product) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white">إدارة المخزون والأصناف</h2>
                <button 
                    onClick={() => { setEditingProduct(null); setFormData({ name: '', buyPrice: 0, sellPrice: 0, stock: 0 }); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-bold"
                >
                    <Plus size={18} className="ml-2" />
                    إضافة صنف
                </button>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute right-3 top-2.5 text-slate-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="بحث عن صنف..." 
                            className="w-full pr-10 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">اسم الصنف</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">سعر الشراء</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">سعر البيع</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">الكمية</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900 divide-y divide-slate-800">
                            {filteredProducts.map((p: Product) => (
                                <tr key={p.id} className="hover:bg-slate-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{p.buyPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-400">{p.sellPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 5 ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-4 relative z-10">
                                            <button type="button" onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300 transition-colors"><Edit size={18} /></button>
                                            <button 
                                                type="button" 
                                                onClick={(e) => handleDeleteClick(e, p.id)} 
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا توجد أصناف</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h3 className="text-xl font-bold text-white">{editingProduct ? 'تعديل صنف' : 'إضافة صنف جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">اسم الصنف</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">سعر الشراء</label>
                                    <input required type="number" className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.buyPrice} onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">سعر البيع</label>
                                    <input required type="number" className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.sellPrice} onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">الكمية المخزنية (الرصيد)</label>
                                <input required type="number" className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg">حفظ البيانات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 4. Invoices Page
const Invoices = ({ customers, products, addInvoice, deleteInvoice, updateInvoice, invoices, settings, initialMode }: any) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    type: 'cash',
    items: [],
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    paidAmount: 0,
    months: 6
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Handle Initial Mode (Coming from Installments page)
  useEffect(() => {
    if (initialMode && initialMode.active) {
        setView('create');
        setNewInvoice(prev => ({ ...prev, type: initialMode.type }));
        // Reset the trigger is handled by parent or simply just used once here
    }
  }, [initialMode]);

  const calculateTotal = () => {
    const itemsTotal = newInvoice.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    return Math.max(0, itemsTotal - (newInvoice.discount || 0));
  };

  useEffect(() => {
    if (view === 'create') {
        const total = calculateTotal();
        if (newInvoice.type === 'cash') {
            setNewInvoice(prev => ({ ...prev, paidAmount: total }));
        }
    }
  }, [newInvoice.type, newInvoice.items, newInvoice.discount, view]);

  const addItem = () => {
    if (!selectedProduct) return;
    if (selectedProduct.stock < itemQty) {
        alert('تنبيه: الكمية المطلوبة غير متوفرة في المخزن!');
        return;
    }
    const newItem: ProductItem = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.sellPrice,
        quantity: itemQty,
        buyPrice: selectedProduct.buyPrice
    };
    setNewInvoice({ ...newInvoice, items: [...(newInvoice.items || []), newItem] });
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (index: number) => {
      const updated = [...(newInvoice.items || [])];
      updated.splice(index, 1);
      setNewInvoice({...newInvoice, items: updated});
  }

  const handleDeleteInvoice = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟ سيتم حذف جميع الأقساط المرتبطة بها.')) {
          deleteInvoice(id);
      }
  };

  const handleSaveInvoice = () => {
    if (!selectedCustomerId) {
        alert("يرجى اختيار عميل أولاً");
        return;
    }
    if (!newInvoice.items || newInvoice.items.length === 0) {
        alert("يرجى إضافة مواد للفاتورة");
        return;
    }

    const customer = customers.find((c: Customer) => c.id === selectedCustomerId);
    if (!customer) {
        alert("بيانات العميل غير صحيحة");
        return;
    }

    const total = calculateTotal();
    const paid = newInvoice.paidAmount || 0;
    const remaining = total - paid;
    
    let installments: Installment[] = [];
    if (newInvoice.type === 'installment') {
        const installmentAmount = remaining / (newInvoice.months || 1);
        for (let i = 1; i <= (newInvoice.months || 1); i++) {
            const dueDate = new Date(newInvoice.date!);
            dueDate.setMonth(dueDate.getMonth() + i);
            installments.push({
                id: `inst-${Date.now()}-${i}`,
                invoiceId: '', 
                customerId: selectedCustomerId,
                customerName: customer.name,
                amount: Math.ceil(installmentAmount),
                dueDate: dueDate.toISOString().split('T')[0],
                status: 'unpaid'
            });
        }
    }

    const invoiceData = {
        ...newInvoice,
        id: view === 'edit' ? newInvoice.id! : Date.now().toString(),
        customerId: selectedCustomerId,
        customerName: customer.name,
        totalAmount: newInvoice.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        finalAmount: total,
        remainingAmount: remaining,
        type: newInvoice.type as InvoiceType,
        installments
    };

    if (view === 'edit') {
        updateInvoice(invoiceData);
    } else {
        addInvoice(invoiceData);
    }
    setView('list');
    resetForm();
  };

  const resetForm = () => {
      setNewInvoice({ type: 'cash', items: [], date: new Date().toISOString().split('T')[0], discount: 0, paidAmount: 0, months: 6 });
      setSelectedCustomerId('');
  };

  const handleEditInit = (inv: Invoice) => {
      setNewInvoice(inv);
      setSelectedCustomerId(inv.customerId);
      setView('edit');
  };

  // Print View (Invoice)
  if (selectedInvoice) {
      return (
          <div className="min-h-screen bg-slate-900 flex justify-center py-8 print:p-0 print:bg-white print:w-full print:h-full print:absolute print:top-0 print:left-0 print:z-50">
              <div className="bg-white w-[210mm] min-h-[297mm] p-8 shadow-2xl print:shadow-none relative text-black">
                  <div className="flex justify-between items-center border-b-4 border-slate-800 pb-6 mb-8">
                      <div>
                          <h1 className="text-4xl font-extrabold text-slate-900">{settings.name}</h1>
                          <p className="text-slate-600 mt-2 font-medium">{settings.specialty}</p>
                          <p className="text-slate-600 font-medium">{settings.address}</p>
                          <p className="text-slate-600 font-medium">{settings.phone}</p>
                      </div>
                      <div className="flex flex-col items-end">
                            {/* LOGO DISPLAY - LEFT SIDE in RTL means Items End in Flex Column if Direction is RTL */}
                           {settings.logoUrl && (
                                <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-slate-200" />
                           )}
                          <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-none">
                              <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest">فاتورة</h2>
                              <p className="text-slate-600 font-bold mt-1">#{selectedInvoice.id.slice(-6)}</p>
                              <p className="text-slate-500">{selectedInvoice.date}</p>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="border p-4 rounded-lg border-slate-300">
                          <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">معلومات العميل</h3>
                          <p className="font-bold text-xl text-slate-900">{selectedInvoice.customerName}</p>
                      </div>
                      <div className="border p-4 rounded-lg border-slate-300">
                           <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">طريقة الدفع</h3>
                           <p className="font-bold text-xl text-slate-900">
                               {selectedInvoice.type === 'installment' ? 'أقساط' : 
                                selectedInvoice.type === 'credit' ? 'آجل / جزئي' : 'نقدي'}
                           </p>
                      </div>
                  </div>

                  <table className="w-full mb-8 border-collapse">
                      <thead>
                          <tr className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                              <th className="p-3 text-right font-bold border border-slate-700 print:border-slate-400">#</th>
                              <th className="p-3 text-right font-bold border border-slate-700 print:border-slate-400">المادة / الصنف</th>
                              <th className="p-3 text-center font-bold border border-slate-700 print:border-slate-400">الكمية</th>
                              <th className="p-3 text-center font-bold border border-slate-700 print:border-slate-400">السعر</th>
                              <th className="p-3 text-center font-bold border border-slate-700 print:border-slate-400">الإجمالي</th>
                          </tr>
                      </thead>
                      <tbody>
                          {selectedInvoice.items.map((item, i) => (
                              <tr key={i} className="border-b border-slate-300 text-black">
                                  <td className="p-3 border border-slate-200 print:border-slate-400 text-center">{i+1}</td>
                                  <td className="p-3 border border-slate-200 print:border-slate-400 font-medium">{item.name}</td>
                                  <td className="p-3 border border-slate-200 print:border-slate-400 text-center">{item.quantity}</td>
                                  <td className="p-3 border border-slate-200 print:border-slate-400 text-center">{item.price.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-200 print:border-slate-400 text-center font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  <div className="flex justify-end mb-12">
                      <div className="w-1/2 space-y-2 text-black">
                          <div className="flex justify-between border-b border-slate-300 pb-1">
                              <span className="text-slate-600">المجموع:</span>
                              <span className="font-medium">{selectedInvoice.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-300 pb-1">
                              <span className="text-slate-600">الخصم:</span>
                              <span className="font-medium">{selectedInvoice.discount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-2 text-xl font-bold bg-slate-100 p-2 print:bg-transparent">
                              <span>الصافي:</span>
                              <span>{selectedInvoice.finalAmount.toLocaleString()} {settings.currency}</span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-500 pt-2">
                              <span>المدفوع:</span>
                              <span>{selectedInvoice.paidAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-red-600 font-bold">
                              <span>المتبقي (دين):</span>
                              <span>{selectedInvoice.remainingAmount.toLocaleString()}</span>
                          </div>
                      </div>
                  </div>

                  <div className="absolute bottom-12 w-full left-0 px-8 text-center">
                       <div className="border-t border-slate-300 pt-4">
                           <p className="text-slate-600 font-medium">{settings.footerNote}</p>
                           <p className="text-xs text-slate-400 mt-2">تم إصدار هذه الفاتورة إلكترونياً من نظام {settings.name}</p>
                       </div>
                  </div>

                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 no-print bg-slate-800 p-4 rounded-full shadow-2xl border border-slate-700">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 flex items-center">
                          <Printer className="ml-2" /> طباعة
                      </button>
                      <button onClick={() => setSelectedInvoice(null)} className="bg-slate-700 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-600">
                          إغلاق
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // Create/Edit View
  if (view === 'create' || view === 'edit') {
    const total = calculateTotal();
    const remaining = total - (newInvoice.paidAmount || 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">{view === 'edit' ? 'تعديل الفاتورة' : 'إنشاء فاتورة بيع'}</h2>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-white font-bold">عودة للقائمة</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 space-y-6">
                    <h3 className="font-bold border-b border-slate-700 pb-2 text-white text-lg">بيانات الفاتورة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">العميل</label>
                            <select 
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">-- اختر العميل --</option>
                                {customers.map((c: Customer) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">تاريخ الفاتورة</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                value={newInvoice.date}
                                onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-slate-300">طريقة البيع</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setNewInvoice({...newInvoice, type: 'cash'})} className={`p-3 rounded-lg border text-center font-bold transition-all ${newInvoice.type === 'cash' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>نقدي (Cash)</button>
                                <button onClick={() => setNewInvoice({...newInvoice, type: 'credit'})} className={`p-3 rounded-lg border text-center font-bold transition-all ${newInvoice.type === 'credit' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>آجل (دين)</button>
                                <button onClick={() => setNewInvoice({...newInvoice, type: 'installment'})} className={`p-3 rounded-lg border text-center font-bold transition-all ${newInvoice.type === 'installment' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>أقساط</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 space-y-6">
                    <h3 className="font-bold border-b border-slate-700 pb-2 text-white text-lg">المنتجات</h3>
                    <div className="flex gap-3 items-end bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex-1">
                            <label className="text-xs text-slate-400 mb-1 block">اختر الصنف</label>
                            <select className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none" value={selectedProduct?.id || ''} onChange={e => setSelectedProduct(products.find((p: Product) => p.id === e.target.value) || null)}>
                                <option value="">-- اختر المنتج --</option>
                                {products.map((p: Product) => (
                                    <option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock}) - {p.sellPrice.toLocaleString()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-24">
                             <label className="text-xs text-slate-400 mb-1 block">العدد</label>
                             <input type="number" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-center text-white outline-none" value={itemQty} onChange={e => setItemQty(Number(e.target.value))} min="1" />
                        </div>
                        <button onClick={addItem} disabled={!selectedProduct} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 font-bold">إضافة</button>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-950 text-slate-300">
                            <tr>
                                <th className="p-3 text-right">المادة</th>
                                <th className="p-3 text-center">الكمية</th>
                                <th className="p-3 text-center">السعر</th>
                                <th className="p-3 text-center">الإجمالي</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {newInvoice.items?.map((item, idx) => (
                                <tr key={idx} className="bg-slate-900">
                                    <td className="p-3 font-medium text-white">{item.name}</td>
                                    <td className="p-3 text-center text-slate-300">{item.quantity}</td>
                                    <td className="p-3 text-center text-slate-300">{item.price.toLocaleString()}</td>
                                    <td className="p-3 text-center font-bold text-emerald-400">{(item.price * item.quantity).toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 bg-red-900/20 p-1 rounded"><X size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {newInvoice.items?.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-500">لم يتم إضافة مواد بعد</td></tr>}
                        </tbody>
                    </table>
                </div>

                {newInvoice.type === 'installment' && (
                    <div className="bg-slate-900 p-6 rounded-xl shadow-lg border-r-4 border-blue-500 space-y-4">
                        <h3 className="font-bold text-blue-400 text-lg">خطة الأقساط</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">الدفعة المقدمة (واصل)</label>
                                <div className="p-2 bg-slate-950 border border-slate-700 rounded text-white font-mono">{newInvoice.paidAmount?.toLocaleString()}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">عدد الأشهر (مدة التسديد)</label>
                                <input type="number" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" value={newInvoice.months} onChange={e => setNewInvoice({...newInvoice, months: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="text-sm text-slate-300 p-3 bg-slate-800 rounded border border-slate-700">
                            القسط الشهري التقريبي: <span className="font-bold text-white text-lg">{Math.ceil(remaining / (newInvoice.months || 1)).toLocaleString()}</span> {settings.currency}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl border border-slate-800 sticky top-6">
                    <h3 className="text-xl font-bold mb-6 text-slate-100">الحساب النهائي</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-slate-400">
                            <span>المجموع الفرعي</span>
                            <span>{(newInvoice.items?.reduce((s, i) => s + i.price * i.quantity, 0))?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">الخصم</span>
                            <input type="number" className="w-24 p-1 bg-slate-800 border border-slate-600 rounded text-center font-bold text-white" value={newInvoice.discount} onChange={e => setNewInvoice({...newInvoice, discount: Number(e.target.value)})} />
                        </div>
                        <div className="border-t border-slate-700 pt-4 flex justify-between text-2xl font-bold text-white">
                            <span>الصافي</span>
                            <span>{total.toLocaleString()} <span className="text-sm text-slate-500">{settings.currency}</span></span>
                        </div>
                        <div className="pt-4 space-y-2">
                             <label className="block text-sm text-emerald-400 font-bold">المبلغ الواصل (المدفوع)</label>
                             <input type="number" className="w-full p-3 bg-slate-950 border border-slate-700 text-white rounded text-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none" value={newInvoice.paidAmount} onChange={e => setNewInvoice({...newInvoice, paidAmount: Number(e.target.value)})} disabled={newInvoice.type === 'cash'} />
                        </div>
                        <div className="flex justify-between text-lg font-medium text-orange-400 pt-2 bg-slate-800/50 p-2 rounded">
                            <span>المتبقي (دين):</span>
                            <span>{remaining.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={handleSaveInvoice} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition-colors flex justify-center items-center text-lg shadow-lg shadow-emerald-900/20">
                        <Save className="ml-2" /> حفظ الفاتورة
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">سجل الفواتير والمبيعات</h2>
        <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-bold"><Plus size={18} className="ml-2" />فاتورة جديدة</button>
      </div>
      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">الرقم</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">العميل</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">التاريخ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">النوع</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">المبلغ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">الواصل</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {invoices.length > 0 ? (
                invoices.map((inv: Invoice) => (
                    <tr key={inv.id} className="hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{inv.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{inv.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{inv.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${inv.type === 'cash' ? 'bg-green-900/50 text-green-400' : inv.type === 'installment' ? 'bg-blue-900/50 text-blue-400' : 'bg-orange-900/50 text-orange-400'}`}>
                        {inv.type === 'cash' ? 'نقدي' : inv.type === 'installment' ? 'أقساط' : 'آجل (دين)'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{inv.finalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-bold">{inv.paidAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button onClick={() => setSelectedInvoice(inv)} className="text-blue-400 hover:text-blue-300 mx-2 bg-blue-900/20 p-2 rounded-full"><Printer size={16} /></button>
                        <button onClick={() => handleEditInit(inv)} className="text-slate-400 hover:text-white mx-2 bg-slate-800 p-2 rounded-full"><Edit size={16} /></button>
                        <button onClick={(e) => handleDeleteInvoice(e, inv.id)} className="text-red-400 hover:text-red-300 mx-2 bg-red-900/20 p-2 rounded-full"><Trash2 size={16} /></button>
                    </td>
                    </tr>
                ))
              ) : (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">لا توجد فواتير</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 5. Debts Page
const Debts = ({ invoices }: { invoices: Invoice[] }) => {
    const debts = useMemo(() => {
        const debtMap = new Map();
        invoices.forEach(inv => {
            if (inv.type !== 'installment' && inv.remainingAmount > 0) {
                const current = debtMap.get(inv.customerId) || { name: inv.customerName, totalDebt: 0, count: 0 };
                debtMap.set(inv.customerId, { name: inv.customerName, totalDebt: current.totalDebt + inv.remainingAmount, count: current.count + 1 });
            }
        });
        return Array.from(debtMap.entries());
    }, [invoices]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">مديونية العملاء</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debts.length > 0 ? (
                    debts.map(([id, data]: any) => (
                        <div key={id} className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 flex flex-col justify-between hover:border-orange-500/50 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-orange-900/30 p-3 rounded-full"><Wallet className="text-orange-500 h-6 w-6" /></div>
                                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full font-bold">{data.count} فواتير آجلة</span>
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{data.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">إجمالي المبلغ المتبقي بذمته</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <span className="text-3xl font-black text-red-500">{data.totalDebt.toLocaleString()}</span>
                                <span className="text-sm text-slate-500 mr-2">د.ع</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 bg-slate-900 rounded-xl border border-dashed border-slate-800">
                        <Wallet className="mx-auto h-16 w-16 text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-300">لا توجد ديون</h3>
                        <p className="text-slate-500">جميع الفواتير مدفوعة بالكامل</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 6. Customers Page
const Customers = ({ customers, addCustomer, deleteCustomer, updateCustomer }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
        updateCustomer(editingCustomer.id, formData);
    } else {
        addCustomer(formData);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع سجلاته.')) {
        deleteCustomer(id);
    }
  }

  const handleEdit = (customer: Customer) => {
      setEditingCustomer(customer);
      setFormData({ name: customer.name, phone: customer.phone, address: customer.address });
      setIsModalOpen(true);
  }

  const filteredCustomers = customers.filter((c: Customer) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">إدارة العملاء</h2>
        <button onClick={() => { setEditingCustomer(null); setFormData({name:'', phone:'', address:''}); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-bold"><Users size={18} className="ml-2" />إضافة عميل</button>
      </div>
      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute right-3 top-2.5 text-slate-500" size={20} />
                <input type="text" placeholder="بحث عن عميل..." className="w-full pr-10 pl-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الهاتف</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">العنوان</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: Customer) => (
                    <tr key={customer.id} className="hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{customer.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => handleEdit(customer)} className="text-blue-400 hover:text-blue-300 transition-colors"><Edit size={18} /></button>
                            <button 
                                type="button" 
                                onClick={(e) => handleDeleteClick(e, customer.id)} 
                                className="text-red-400 hover:text-red-300 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">لا يوجد عملاء مطابقين للبحث</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">{editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">اسم العميل</label>
                <input type="text" required className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">رقم الهاتف</label>
                <input type="text" required className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">العنوان</label>
                <input type="text" className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg hover:bg-white transition-colors font-bold text-lg">{editingCustomer ? 'حفظ التعديلات' : 'حفظ العميل'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. Installments Page
const Installments = ({ invoices, updateInstallmentStatus, settings, customers, onNewInstallment }: any) => {
    const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
    const [selectedReceipt, setSelectedReceipt] = useState<{installment: Installment, invoice: Invoice} | null>(null);

    const allInstallments = invoices
        .filter((inv: Invoice) => inv.type === 'installment' && inv.installments)
        .flatMap((inv: Invoice) => inv.installments);

    const filtered = allInstallments.filter((inst: Installment) => {
        if (filter === 'all') return true;
        return inst.status === filter;
    });

    const getInvoiceForInstallment = (inst: Installment) => {
        return invoices.find((inv: Invoice) => inv.id === inst.invoiceId);
    };
    
    // Receipt Print View
    if (selectedReceipt) {
        const { installment, invoice } = selectedReceipt;
        const totalPaidSoFar = (invoice.paidAmount || 0) + (invoice.installments?.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) || 0);
        const remainingBalance = invoice.finalAmount - totalPaidSoFar;

        return (
          <div className="min-h-screen bg-slate-900 flex justify-center py-8 print:p-0 print:bg-white print:w-full print:h-full print:absolute print:top-0 print:left-0 print:z-50">
              <div className="bg-white w-[148mm] min-h-[210mm] p-8 shadow-2xl print:shadow-none relative text-black border border-gray-200">
                  <div className="flex flex-col items-center border-b-2 border-slate-900 pb-4 mb-6">
                      {settings.logoUrl && <img src={settings.logoUrl} className="w-20 h-20 rounded-full mb-2 object-cover" />}
                      <h1 className="text-3xl font-extrabold text-slate-900">{settings.name}</h1>
                      <p className="text-slate-600 font-bold mt-1">{settings.specialty}</p>
                      <p className="text-slate-500 text-sm">{settings.address} - {settings.phone}</p>
                  </div>

                  <div className="bg-slate-100 border border-slate-300 p-4 rounded-lg text-center mb-8 print:bg-slate-100">
                      <h2 className="text-2xl font-bold text-slate-800 uppercase">سند قبض (دفعة قسط)</h2>
                      <p className="text-slate-600">رقم السند: {installment.id.slice(-6)}</p>
                      <p className="text-slate-600">التاريخ: {new Date().toISOString().split('T')[0]}</p>
                  </div>

                  <div className="space-y-6 text-lg">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-700">استلمنا من السيد/ة:</span>
                          <span className="font-bold">{installment.customerName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-700">مبلغ وقدره:</span>
                          <span className="font-bold text-xl">{installment.amount.toLocaleString()} {settings.currency}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-700">وذلك عن:</span>
                          <span>تسديد الدفعة المستحقة بتاريخ {installment.dueDate}</span>
                      </div>
                  </div>

                  <div className="mt-12 bg-slate-50 border border-slate-300 rounded-lg p-6">
                      <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4">ملخص الحساب</h3>
                      <div className="space-y-2">
                           <div className="flex justify-between">
                               <span className="text-slate-600">إجمالي مبلغ الفاتورة:</span>
                               <span className="font-bold">{invoice.finalAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-slate-600">مجموع المدفوع حتى الآن:</span>
                               <span className="font-bold text-emerald-600">{totalPaidSoFar.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-xl border-t border-slate-300 pt-2 mt-2">
                               <span className="font-bold text-slate-800">الرصيد المتبقي:</span>
                               <span className="font-bold text-red-600">{remainingBalance.toLocaleString()}</span>
                           </div>
                      </div>
                  </div>

                  <div className="mt-16 flex justify-between px-8 text-center">
                      <div>
                          <p className="font-bold text-slate-700 mb-12">توقيع المستلم</p>
                          <div className="w-32 border-b border-slate-400"></div>
                      </div>
                      <div>
                           <p className="font-bold text-slate-700 mb-12">توقيع العميل</p>
                           <div className="w-32 border-b border-slate-400"></div>
                      </div>
                  </div>

                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 no-print bg-slate-800 p-4 rounded-full shadow-2xl">
                      <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 flex items-center">
                          <Printer className="ml-2" /> طباعة الوصل
                      </button>
                      <button onClick={() => setSelectedReceipt(null)} className="bg-slate-700 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-600">
                          إغلاق
                      </button>
                  </div>
              </div>
          </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white">متابعة الأقساط</h2>
                <button 
                    onClick={onNewInstallment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-bold shadow-lg shadow-emerald-900/20"
                >
                    <Plus size={18} className="ml-2" />
                    عقد قسط جديد
                </button>
            </div>
            
            <div className="flex gap-2 bg-slate-900 p-2 rounded-lg shadow-sm w-fit border border-slate-800">
                {['all', 'unpaid', 'late', 'paid'].map((f) => (
                    <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        {f === 'all' && 'الكل'}
                        {f === 'unpaid' && 'غير مدفوع'}
                        {f === 'late' && 'متأخر'}
                        {f === 'paid' && 'مدفوع'}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950">
                        <tr>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">العميل</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">المبلغ</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">تاريخ الاستحقاق</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">الحالة</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.length > 0 ? (
                            filtered.map((inst: Installment) => (
                            <tr key={inst.id} className="hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-white">{inst.customerName}</td>
                                <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{inst.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">{inst.dueDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${inst.status === 'paid' ? 'bg-emerald-900/50 text-emerald-400' : inst.status === 'late' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                                        {inst.status === 'paid' ? 'تم التسديد' : inst.status === 'late' ? 'متأخر' : 'مستحق'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    {inst.status !== 'paid' && (
                                        <button onClick={() => updateInstallmentStatus(inst.invoiceId, inst.id, 'paid')} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs hover:bg-emerald-700 font-bold transition-colors">تسديد</button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            const inv = getInvoiceForInstallment(inst);
                                            if (inv) setSelectedReceipt({ installment: inst, invoice: inv });
                                        }} 
                                        className="bg-slate-700 text-white px-3 py-1.5 rounded text-xs hover:bg-slate-600 font-bold transition-colors flex items-center"
                                    >
                                        <Printer size={14} className="ml-1" /> طباعة الوصل
                                    </button>
                                </td>
                            </tr>
                        ))) : (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا توجد أقساط</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 8. Settings Page
const SettingsPage = ({ settings, saveSettings, onImportData }: any) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'employee' });

    const handleChange = (field: string, value: string) => {
        setLocalSettings({ ...localSettings, [field]: value });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings({ ...localSettings, logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const user: User = { 
            id: Date.now().toString(), 
            username: newUser.username, 
            password: newUser.password, 
            role: newUser.role as any 
        };
        const updatedUsers = [...(localSettings.users || []), user];
        setLocalSettings({ ...localSettings, users: updatedUsers });
        setNewUser({ username: '', password: '', role: 'employee' });
    };

    const handleDeleteUser = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if(window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            const updatedUsers = localSettings.users.filter((u: User) => u.id !== id);
            setLocalSettings({ ...localSettings, users: updatedUsers });
        }
    };

    const handleBackup = () => {
        const data = {
            customers: getFromStorage('customers', []),
            invoices: getFromStorage('invoices', []),
            products: getFromStorage('products', []),
            settings: localSettings,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nizam_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if(window.confirm('تحذير: استرجاع البيانات سيقوم باستبدال جميع البيانات الحالية. هل أنت متأكد؟')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        onImportData(data);
                    } catch (error) {
                        alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف صالح.');
                    }
                };
                reader.readAsText(file);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-black text-white">إعدادات النظام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-8">
                    <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4">بيانات المؤسسة</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">شعار المؤسسة (Logo)</label>
                            <div className="flex items-center gap-4">
                                {localSettings.logoUrl && <img src={localSettings.logoUrl} className="w-16 h-16 rounded-full object-cover border border-slate-700" />}
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                                    <Upload size={18} className="ml-2" />
                                    رفع صورة
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">اسم المتجر / الشركة</label>
                            <input type="text" value={localSettings.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">التخصص (وصف النشاط)</label>
                            <input type="text" value={localSettings.specialty} onChange={(e) => handleChange('specialty', e.target.value)} placeholder="مثلاً: تجارة الأجهزة المنزلية" className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">العنوان</label>
                            <input type="text" value={localSettings.address} onChange={(e) => handleChange('address', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">رقم الهاتف</label>
                            <input type="text" value={localSettings.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" />
                        </div>
                    </div>
                </div>

                {/* Preferences & Backup */}
                <div className="flex flex-col gap-8">
                     <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-8 flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4">تفضيلات الطباعة</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">رمز العملة</label>
                                    <input type="text" value={localSettings.currency} onChange={(e) => handleChange('currency', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">ملاحظة أسفل الفاتورة</label>
                                    <textarea value={localSettings.footerNote} onChange={(e) => handleChange('footerNote', e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none h-32 resize-none" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-8">
                            <button onClick={() => { saveSettings(localSettings); alert('تم حفظ الإعدادات بنجاح'); }} className="w-full bg-slate-100 text-slate-900 px-6 py-4 rounded-xl hover:bg-white transition-colors font-bold text-lg shadow-lg flex justify-center items-center"><Save className="ml-2" /> حفظ كافة التغييرات</button>
                        </div>
                    </div>
                    
                    {/* Backup Section */}
                    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-8">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center gap-2"><FileJson /> النسخ الاحتياطي والاستعادة</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleBackup} className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors">
                                <Download size={24} />
                                <span className="font-bold">تحميل نسخة احتياطية</span>
                                <span className="text-xs text-emerald-200">حفظ البيانات على الحاسوب</span>
                            </button>
                            <label className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer">
                                <Upload size={24} />
                                <span className="font-bold">استرجاع نسخة</span>
                                <span className="text-xs text-blue-200">رفع ملف بيانات سابق</span>
                                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Management */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-8">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center"><Shield className="ml-2" /> إدارة المستخدمين وصلاحيات الدخول</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <form onSubmit={handleAddUser} className="bg-slate-950 p-6 rounded-lg border border-slate-800 h-fit">
                        <h4 className="font-bold text-slate-300 mb-4 flex items-center"><UserPlus size={18} className="ml-2" /> إضافة مستخدم جديد</h4>
                        <div className="space-y-4">
                            <input required type="text" placeholder="اسم المستخدم" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                            <input required type="text" placeholder="كلمة المرور" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white outline-none focus:border-blue-500" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="employee">موظف (محدود)</option>
                                <option value="admin">مدير (كامل)</option>
                            </select>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold transition-colors">إضافة</button>
                        </div>
                    </form>

                    {/* Users List */}
                    <div className="lg:col-span-2 overflow-hidden rounded-lg border border-slate-700">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-800 text-slate-300 font-bold">
                                <tr>
                                    <th className="p-3">اسم المستخدم</th>
                                    <th className="p-3">الصلاحية</th>
                                    <th className="p-3 text-center">كلمة المرور</th>
                                    <th className="p-3 text-center">حذف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-950">
                                {localSettings.users?.map((u: User) => (
                                    <tr key={u.id}>
                                        <td className="p-3 text-white font-medium">{u.username}</td>
                                        <td className="p-3 text-slate-400">{u.role === 'admin' ? 'مدير' : 'موظف'}</td>
                                        <td className="p-3 text-center text-slate-500 font-mono">****</td>
                                        <td className="p-3 text-center">
                                            <button type="button" onClick={(e) => handleDeleteUser(e, u.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {(!localSettings.users || localSettings.users.length === 0) && (
                                    <tr><td colSpan={4} className="p-4 text-center text-slate-500">لا يوجد مستخدمين</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoiceInitialMode, setInvoiceInitialMode] = useState<{active: boolean, type: InvoiceType} | null>(null);

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  
  // Data Loaded Flag (Prevent race conditions with local storage)
  const isLoaded = useRef(false);

  // Initialize Data
  useEffect(() => {
    const loadedCustomers = getFromStorage('customers', INITIAL_CUSTOMERS);
    const loadedInvoices = getFromStorage('invoices', []);
    const loadedProducts = getFromStorage('products', INITIAL_PRODUCTS);
    const loadedSettings = getFromStorage('settings', DEFAULT_SETTINGS);

    setCustomers(loadedCustomers);
    setInvoices(loadedInvoices);
    setProducts(loadedProducts);
    setSettings(loadedSettings);
    isLoaded.current = true;
  }, []);

  // Sync with Storage - ONLY after data is loaded
  useEffect(() => { if(isLoaded.current) saveToStorage('customers', customers); }, [customers]);
  useEffect(() => { if(isLoaded.current) saveToStorage('invoices', invoices); }, [invoices]);
  useEffect(() => { if(isLoaded.current) saveToStorage('products', products); }, [products]);
  useEffect(() => { if(isLoaded.current) saveToStorage('settings', settings); }, [settings]);

  // Actions
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCustomer = (id: string) => {
      setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addProduct = (data: Omit<Product, 'id'>) => {
      setProducts(prev => [...prev, { ...data, id: Date.now().toString() }]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addInvoice = (data: Invoice) => {
    // Decrement stock
    if (data.items) {
        setProducts(prev => prev.map(p => {
            const item = data.items.find(i => i.productId === p.id);
            if (item) return { ...p, stock: p.stock - item.quantity };
            return p;
        }));
    }

    const newInvoice = {
      ...data,
      installments: data.installments?.map(inst => ({ ...inst, invoiceId: data.id })) // ID is passed from wrapper
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  }
  
  const deleteInvoice = (id: string) => {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInstallmentStatus = (invoiceId: string, installmentId: string, status: PaymentStatus) => {
      setInvoices(prev => prev.map(inv => {
          if (inv.id !== invoiceId || !inv.installments) return inv;
          return {
              ...inv,
              installments: inv.installments.map(inst => 
                inst.id === installmentId 
                ? { ...inst, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined } 
                : inst
              )
          };
      }));
  };

  const handleImportData = (data: any) => {
      if(data.customers) setCustomers(data.customers);
      if(data.invoices) setInvoices(data.invoices);
      if(data.products) setProducts(data.products);
      if(data.settings) setSettings(data.settings);
      alert('تم استرجاع النسخة الاحتياطية بنجاح!');
  }
  
  const handleNewInstallment = () => {
      setActiveTab('invoices');
      setInvoiceInitialMode({ active: true, type: 'installment' });
      // Reset trigger after short delay to allow re-triggering later
      setTimeout(() => setInvoiceInitialMode(null), 500);
  };

  // Stats Logic
  const stats = useMemo(() => {
      const allInstallments = invoices.flatMap(i => i.installments || []);
      const totalDebts = invoices
        .filter(inv => inv.type !== 'installment')
        .reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

      return {
          totalSales: invoices.reduce((sum, i) => sum + i.finalAmount, 0),
          totalCustomers: customers.length,
          activeInstallments: allInstallments.filter(i => i.status === 'unpaid').length,
          overdueInstallments: allInstallments.filter(i => i.status === 'late').length,
          totalDebts
      };
  }, [invoices, customers]);


  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 shadow-sm z-10 p-4 flex justify-between items-center md:hidden no-print border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">نظام الإدارة</h1>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth">
          {activeTab === 'dashboard' && <Dashboard stats={stats} invoices={invoices} />}
          {activeTab === 'products' && <ProductsManager products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} />}
          {activeTab === 'customers' && <Customers customers={customers} addCustomer={addCustomer} updateCustomer={updateCustomer} deleteCustomer={deleteCustomer} />}
          {activeTab === 'invoices' && <Invoices customers={customers} products={products} addInvoice={addInvoice} updateInvoice={updateInvoice} deleteInvoice={deleteInvoice} invoices={invoices} settings={settings} initialMode={invoiceInitialMode} />}
          {activeTab === 'debts' && <Debts invoices={invoices} />}
          {activeTab === 'installments' && <Installments invoices={invoices} updateInstallmentStatus={updateInstallmentStatus} settings={settings} customers={customers} onNewInstallment={handleNewInstallment} />}
          {activeTab === 'settings' && <SettingsPage settings={settings} saveSettings={setSettings} onImportData={handleImportData} />}
        </main>
      </div>
    </div>
  );
};

export default App;
