import { createClient } from '@/utils/supabase/client';

// Lazy initialization to avoid SSR issues
// The client is created only when first needed and only on the client side
let supabaseClient = null;

const getSupabase = () => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used on the client side');
  }
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
};

export const getCustomers = async () => {
  const {
    data,
    error
  } = await getSupabase().from('customers').select('*').order('created_at', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data?.map(customer => ({
    ...customer,
    createdAt: new Date(customer.created_at),
    updatedAt: new Date(customer.updated_at)
  })) || [];
};

export const saveCustomer = async customer => {
  const {
    data,
    error
  } = await getSupabase().from('customers').insert({
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address
  }).select().single();
  if (error) {
    console.error('Error saving customer:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const addCustomer = saveCustomer;

export const updateCustomer = async (id, updates) => {
  const {
    data,
    error
  } = await getSupabase().from('customers').update({
    name: updates.name,
    phone: updates.phone,
    email: updates.email,
    address: updates.address
  }).eq('id', id).select().single();
  if (error) {
    console.error('Error updating customer:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const deleteCustomer = async id => {
  const {
    error
  } = await getSupabase().from('customers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
  return true;
};


export const getProducts = async () => {
  const {
    data,
    error
  } = await getSupabase().from('products').select('*').order('created_at', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data?.map(product => ({
    ...product,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  })) || [];
};
export const saveProduct = async product => {
  const {
    data,
    error
  } = await getSupabase().from('products').insert({
    name: product.name,
    category: product.category,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    min_stock: product.minStock,
    tax_rate: product.taxRate,
    description: product.description,
    sku: product.sku,
    is_active: product.isActive
  }).select().single();
  if (error) {
    console.error('Error saving product:', error);
    return null;
  }
  return {
    ...data,
    minStock: data.min_stock,
    taxRate: data.tax_rate,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};
export const updateProduct = async (id, updates) => {
  const {
    data,
    error
  } = await getSupabase().from('products').update({
    name: updates.name,
    category: updates.category,
    price: updates.price,
    cost: updates.cost,
    stock: updates.stock,
    min_stock: updates.minStock,
    tax_rate: updates.taxRate,
    description: updates.description,
    sku: updates.sku,
    is_active: updates.isActive
  }).eq('id', id).select().single();
  if (error) {
    console.error('Error updating product:', error);
    return null;
  }
  return {
    ...data,
    minStock: data.min_stock,
    taxRate: data.tax_rate,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};
export const getLowStockProducts = async () => {
  const {
    data,
    error
  } = await getSupabase().from('products').select('*').filter('stock', 'lte', 'min_stock').eq('is_active', true);
  if (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
  return data?.map(product => ({
    ...product,
    minStock: product.min_stock,
    taxRate: product.tax_rate,
    isActive: product.is_active,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at)
  })) || [];
};


export const getInvoices = async () => {
  const {
    data,
    error
  } = await getSupabase().from('invoices').select(`
      *,
      invoice_items (*)
    `).order('created_at', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
  return data?.map(invoice => ({
    ...invoice,
    customerId: invoice.customer_id,
    customerName: invoice.customer_name,
    customerPhone: invoice.customer_phone,
    customerEmail: invoice.customer_email,
    customerAddress: invoice.customer_address,
    invoiceNumber: invoice.invoice_number,
    discountType: invoice.discount_type,
    taxAmount: invoice.tax_amount,
    totalAmount: invoice.total_amount,
    paymentStatus: invoice.payment_status,
    paymentMethod: invoice.payment_method,
    paidAmount: invoice.paid_amount,
    balanceDue: invoice.balance_due,
    dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
    createdAt: new Date(invoice.created_at),
    updatedAt: new Date(invoice.updated_at),
    createdBy: invoice.created_by,
    items: invoice.invoice_items?.map(item => ({
      ...item,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: item.unit_price,
      taxRate: item.tax_rate,
      taxAmount: item.tax_amount,
      totalAmount: item.total_amount
    })) || []
  })) || [];
};
export const saveInvoice = async invoice => {
  const {
    data: invoiceData,
    error: invoiceError
  } = await getSupabase().from('invoices').insert({
    invoice_number: invoice.invoiceNumber,
    customer_id: invoice.customerId,
    status: invoice.status,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    discount_type: invoice.discountType,
    tax_amount: invoice.taxAmount,
    total: invoice.totalAmount,
    due_date: invoice.dueDate?.toISOString(),
    notes: invoice.notes
  }).select().single();
  if (invoiceError) {
    console.error('Error saving invoice:', invoiceError);
    return null;
  }

  if (invoice.items.length > 0) {
    const {
      error: itemsError
    } = await getSupabase().from('invoice_items').insert(invoice.items.map(item => ({
      invoice_id: invoiceData.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.taxRate,
      total: item.totalAmount
    })));
    if (itemsError) {
      console.error('Error saving invoice items:', itemsError);
      return null;
    }
  }
  return {
    ...invoiceData,
    items: invoice.items,
    createdAt: new Date(invoiceData.created_at),
    updatedAt: new Date(invoiceData.updated_at),
    dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : undefined
  };
};
export const updateInvoice = async (id, updates) => {
  const {
    data,
    error
  } = await getSupabase().from('invoices').update({
    ...(updates.status && {
      status: updates.status
    }),
    ...(updates.subtotal && {
      subtotal: updates.subtotal
    }),
    ...(updates.discount && {
      discount: updates.discount
    }),
    ...(updates.discountType && {
      discount_type: updates.discountType
    }),
    ...(updates.taxAmount && {
      tax_amount: updates.taxAmount
    }),
    ...(updates.totalAmount && {
      total: updates.totalAmount
    }),
    ...(updates.dueDate && {
      due_date: updates.dueDate.toISOString()
    }),
    ...(updates.notes && {
      notes: updates.notes
    })
  }).eq('id', id).select().single();
  if (error) {
    console.error('Error updating invoice:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    dueDate: data.due_date ? new Date(data.due_date) : undefined
  };
};
export const deleteInvoice = async id => {
  const {
    error: itemsError
  } = await getSupabase().from('invoice_items').delete().eq('invoice_id', id);
  if (itemsError) {
    console.error('Error deleting invoice items:', itemsError);
    return false;
  }

  const {
    error
  } = await getSupabase().from('invoices').delete().eq('id', id);
  if (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
  return true;
};

export const getPayments = async () => {
  const {
    data,
    error
  } = await getSupabase().from('payments').select('*').order('created_at', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  return data?.map(payment => ({
    ...payment,
    createdAt: new Date(payment.created_at)
  })) || [];
};
export const savePayment = async payment => {
  const {
    data,
    error
  } = await getSupabase().from('payments').insert({
    invoice_id: payment.invoiceId,
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    notes: payment.notes
  }).select().single();
  if (error) {
    console.error('Error saving payment:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at)
  };
};
export const updatePayment = async (id, updates) => {
  const {
    data,
    error
  } = await getSupabase().from('payments').update({
    ...(updates.amount && {
      amount: updates.amount
    }),
    ...(updates.method && {
      method: updates.method
    }),
    ...(updates.reference && {
      reference: updates.reference
    }),
    ...(updates.notes && {
      notes: updates.notes
    })
  }).eq('id', id).select().single();
  if (error) {
    console.error('Error updating payment:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at)
  };
};
export const deletePayment = async id => {
  const {
    error
  } = await getSupabase().from('payments').delete().eq('id', id);
  if (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
  return true;
};

export const getUsers = async () => {
  const {
    data,
    error
  } = await getSupabase().from('users').select('*').order('created_at', {
    ascending: false
  });
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data?.map(user => ({
    ...user,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
    lastLogin: user.last_login ? new Date(user.last_login) : undefined
  })) || [];
};
export const addUser = async user => {
  const {
    data,
    error
  } = await getSupabase().from('users').insert({
    name: user.name,
    email: user.email,
    phone: user.phone,
    username: user.username,
    password: user.password,
    role: user.role,
    permissions: user.permissions,
    is_active: user.isActive
  }).select().single();
  if (error) {
    console.error('Error adding user:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    lastLogin: data.last_login ? new Date(data.last_login) : undefined
  };
};
export const updateUser = async (id, updates) => {
  const {
    data,
    error
  } = await getSupabase().from('users').update({
    ...(updates.name && {
      name: updates.name
    }),
    ...(updates.email && {
      email: updates.email
    }),
    ...(updates.phone && {
      phone: updates.phone
    }),
    ...(updates.username && {
      username: updates.username
    }),
    ...(updates.password && {
      password: updates.password
    }),
    ...(updates.role && {
      role: updates.role
    }),
    ...(updates.permissions && {
      permissions: updates.permissions
    }),
    ...(updates.isActive !== undefined && {
      is_active: updates.isActive
    })
  }).eq('id', id).select().single();
  if (error) {
    console.error('Error updating user:', error);
    return null;
  }
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    lastLogin: data.last_login ? new Date(data.last_login) : undefined
  };
};
export const deleteUser = async id => {
  const {
    error
  } = await getSupabase().from('users').delete().eq('id', id);
  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }
  return true;
};
export const getUserActivity = async () => {
  const {
    data,
    error
  } = await getSupabase().from('user_activities').select('*').order('timestamp', {
    ascending: false
  }).limit(100);
  if (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
  return data?.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp)
  })) || [];
};

export const getBusinessSettings = async () => {
  const {
    data,
    error
  } = await getSupabase().from('business_settings').select('*').single();
  if (error) {
    console.error('Error fetching business settings:', error);
    return null;
  }
  return {
    ...data,
    businessName: data.business_name,
    gstNumber: data.gst_number,
    taxRate: data.tax_rate,
    invoicePrefix: data.invoice_prefix,
    invoiceCounter: data.invoice_counter,
    logoUrl: data.logo_url
  };
};
export const updateBusinessSettings = async updates => {
  const {
    data,
    error
  } = await getSupabase().from('business_settings').update({
    business_name: updates.businessName,
    address: updates.address,
    phone: updates.phone,
    email: updates.email,
    gst_number: updates.gstNumber,
    tax_rate: updates.taxRate,
    currency: updates.currency,
    invoice_prefix: updates.invoicePrefix,
    invoice_counter: updates.invoiceCounter,
    logo_url: updates.logoUrl
  }).eq('id', '1').select().single();
  if (error) {
    console.error('Error updating business settings:', error);
    return null;
  }
  return {
    ...data,
    businessName: data.business_name,
    gstNumber: data.gst_number,
    taxRate: data.tax_rate,
    invoicePrefix: data.invoice_prefix,
    invoiceCounter: data.invoice_counter,
    logoUrl: data.logo_url
  };
};

export const generateInvoiceNumber = async () => {
  const settings = await getBusinessSettings();
  if (!settings) return 'INV-001';
  const newCounter = settings.invoiceCounter + 1;
  await updateBusinessSettings({
    invoiceCounter: newCounter
  });
  return `${settings.invoicePrefix}-${newCounter.toString().padStart(3, '0')}`;
};
export const calculateInvoiceTotal = (items, discount, discountType) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * discount / 100 : discount;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = discountedSubtotal + taxAmount;
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total
  };
};
