interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  price: number
  special_instructions?: string
}

interface Order {
  id: string
  table_id: string
  customer_name: string
  customer_phone: string
  status: string
  total_amount: number
  notes?: string
  created_at: string
  items: OrderItem[]
}

export function printBill(order: Order) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print the bill')
    return
  }

  const billContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill - Order #${order.id.slice(-6)}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .order-info {
          margin-bottom: 15px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .items-table th,
        .items-table td {
          text-align: left;
          padding: 5px 0;
          border-bottom: 1px dashed #ccc;
        }
        .items-table th {
          font-weight: bold;
          border-bottom: 1px solid #000;
        }
        .total-section {
          border-top: 2px solid #000;
          padding-top: 10px;
          text-align: right;
        }
        .total {
          font-size: 14px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 1px dashed #ccc;
          padding-top: 10px;
          font-size: 10px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">KULHAD CHAI RESTAURANT</div>
        <div>Order Receipt</div>
      </div>
      
      <div class="order-info">
        <div><strong>Order ID:</strong> #${order.id.slice(-6)}</div>
        <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
        <div><strong>Time:</strong> ${new Date(order.created_at).toLocaleTimeString()}</div>
        <div><strong>Customer:</strong> ${order.customer_name}</div>
        <div><strong>Phone:</strong> ${order.customer_phone}</div>
        <div><strong>Table:</strong> ${order.table_id.slice(-6)}</div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>Menu Item</td>
              <td>${item.quantity}</td>
              <td>₹${item.price}</td>
              <td>₹${item.price * item.quantity}</td>
            </tr>
            ${item.special_instructions ? `
              <tr>
                <td colspan="4" style="font-style: italic; color: #666; font-size: 10px;">
                  Note: ${item.special_instructions}
                </td>
              </tr>
            ` : ''}
          `).join('')}
        </tbody>
      </table>
      
      ${order.notes ? `
        <div style="margin-bottom: 15px;">
          <strong>Order Notes:</strong> ${order.notes}
        </div>
      ` : ''}
      
      <div class="total-section">
        <div class="total">TOTAL: ₹${order.total_amount}</div>
      </div>
      
      <div class="footer">
        <div>Thank you for your order!</div>
        <div>Visit us again soon</div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(billContent)
  printWindow.document.close()
}