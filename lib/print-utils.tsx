import type { Invoice, BillTemplate } from "./business-types"
import { getDefaultBillTemplate } from "./business-store"

export interface PrintOptions {
  template?: BillTemplate
  copies?: number
  autoPrint?: boolean
}

export const printBill = async (invoice: Invoice, options: PrintOptions = {}) => {
  const { template = getDefaultBillTemplate(), copies = 1, autoPrint = false } = options

  if (!template) {
    throw new Error("No bill template available")
  }

  // Create a new window for printing
  const printWindow = window.open("", "_blank", "width=800,height=600")

  if (!printWindow) {
    throw new Error("Unable to open print window. Please check popup settings.")
  }

  // Generate the HTML content
  const htmlContent = generateBillHTML(invoice, template)

  // Write content to the new window
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    if (autoPrint) {
      printWindow.print()
      // Close window after printing (with delay to ensure print dialog appears)
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }
  }

  return printWindow
}

export const generateBillHTML = (invoice: Invoice, template: BillTemplate): string => {
  const getFontSize = () => {
    switch (template.fontSize) {
      case "small":
        return "12px"
      case "large":
        return "16px"
      default:
        return "14px"
    }
  }

  const getPaperWidth = () => {
    switch (template.paperSize) {
      case "A4":
        return "210mm"
      case "A5":
        return "148mm"
      default:
        return "80mm" // thermal
    }
  }

  const getPageSize = () => {
    switch (template.paperSize) {
      case "A4":
        return "A4"
      case "A5":
        return "A5"
      default:
        return `${getPaperWidth()} auto` // thermal - auto height
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        @page {
          size: ${getPageSize()};
          margin: ${template.paperSize === "thermal" ? "5mm" : "10mm"};
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: ${getFontSize()};
          color: ${template.colors.text};
          line-height: 1.4;
          width: 100%;
          max-width: ${getPaperWidth()};
          margin: 0 auto;
          padding: ${template.layout.compactMode ? "8px" : "16px"};
          ${template.layout.showBorder ? `border: 1px solid ${template.colors.secondary};` : ""}
        }
        
        .header {
          text-align: center;
          margin-bottom: ${template.layout.compactMode ? "8px" : "16px"};
        }
        
        .logo {
          width: 40px;
          height: 40px;
          background-color: ${template.colors.primary};
          border-radius: 50%;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        .business-name {
          font-size: ${template.fontSize === "small" ? "16px" : template.fontSize === "large" ? "20px" : "18px"};
          font-weight: bold;
          color: ${template.colors.primary};
          margin-bottom: 4px;
        }
        
        .business-info {
          font-size: ${template.fontSize === "small" ? "10px" : template.fontSize === "large" ? "14px" : "12px"};
          color: ${template.colors.secondary};
          line-height: 1.3;
        }
        
        .separator {
          border-top: 1px solid ${template.colors.secondary};
          margin: ${template.layout.compactMode ? "4px 0" : "8px 0"};
        }
        
        .invoice-details {
          margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .items-section {
          margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        .item {
          margin-bottom: ${template.layout.compactMode ? "4px" : "6px"};
        }
        
        .item-name {
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: ${template.fontSize === "small" ? "10px" : template.fontSize === "large" ? "13px" : "11px"};
          color: ${template.colors.secondary};
        }
        
        .totals {
          margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .total-final {
          font-weight: bold;
          font-size: ${template.fontSize === "small" ? "14px" : template.fontSize === "large" ? "18px" : "16px"};
          border-top: 1px solid ${template.colors.text};
          padding-top: 4px;
          margin-top: 4px;
        }
        
        .payment-status {
          text-align: center;
          font-weight: bold;
          margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        .payment-paid { color: #10b981; }
        .payment-partial { color: #f59e0b; }
        .payment-pending { color: #ef4444; }
        
        .qr-code {
          text-align: center;
          margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        .qr-placeholder {
          width: 60px;
          height: 60px;
          border: 2px dashed ${template.colors.secondary};
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: ${template.colors.secondary};
        }
        
        .footer {
          text-align: center;
          color: ${template.colors.secondary};
          font-size: ${template.fontSize === "small" ? "10px" : template.fontSize === "large" ? "13px" : "11px"};
        }
        
        .print-time {
          text-align: center;
          font-size: 10px;
          color: ${template.colors.secondary};
          margin-top: ${template.layout.compactMode ? "8px" : "12px"};
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${template.showLogo ? '<div class="logo">LOGO</div>' : ""}
        <div class="business-name">${template.businessInfo.name}</div>
        <div class="business-info">
          <div>${template.businessInfo.address}</div>
          <div>Phone: ${template.businessInfo.phone}</div>
          <div>Email: ${template.businessInfo.email}</div>
          ${template.showGST && template.businessInfo.gstNumber ? `<div>GST: ${template.businessInfo.gstNumber}</div>` : ""}
        </div>
      </div>

      <div class="separator"></div>

      ${
        template.headerText
          ? `
        <div style="text-align: center; color: ${template.colors.secondary}; font-weight: 500; margin-bottom: ${template.layout.compactMode ? "8px" : "12px"};">
          ${template.headerText}
        </div>
        <div class="separator"></div>
      `
          : ""
      }

      <div class="invoice-details">
        <div class="detail-row">
          <span>Invoice:</span>
          <span style="font-weight: bold;">${invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span>Date:</span>
          <span>${new Date(invoice.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span>Customer:</span>
          <span>${invoice.customerName}</span>
        </div>
        ${
          invoice.customerPhone
            ? `
          <div class="detail-row">
            <span>Phone:</span>
            <span>${invoice.customerPhone}</span>
          </div>
        `
            : ""
        }
      </div>

      <div class="separator"></div>

      <div class="items-section">
        <div style="font-weight: bold; margin-bottom: ${template.layout.compactMode ? "4px" : "6px"};">Items:</div>
        ${invoice.items
          .map(
            (item) => `
          <div class="item">
            <div class="item-name">${item.productName}</div>
            <div class="item-details">
              <span>${item.quantity} × ₹${item.unitPrice}</span>
              <span>₹${item.totalAmount}</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="separator"></div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${invoice.subtotal}</span>
        </div>
        ${
          invoice.taxAmount > 0
            ? `
          <div class="total-row">
            <span>Tax:</span>
            <span>₹${invoice.taxAmount}</span>
          </div>
        `
            : ""
        }
        ${
          invoice.discount > 0
            ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-₹${invoice.discount}</span>
          </div>
        `
            : ""
        }
        <div class="total-row total-final">
          <span>Total:</span>
          <span>₹${invoice.totalAmount}</span>
        </div>
      </div>

      ${
        invoice.paymentStatus
          ? `
        <div class="separator"></div>
        <div class="payment-status payment-${invoice.paymentStatus}">
          Payment Status: ${invoice.paymentStatus.toUpperCase()}
          ${invoice.balanceDue > 0 ? `<br><span style="font-size: smaller;">Balance Due: ₹${invoice.balanceDue}</span>` : ""}
        </div>
      `
          : ""
      }

      ${
        template.showQR
          ? `
        <div class="separator"></div>
        <div class="qr-code">
          <div class="qr-placeholder">QR CODE</div>
        </div>
      `
          : ""
      }

      ${
        template.footerText
          ? `
        <div class="separator"></div>
        <div class="footer">
          ${template.footerText}
        </div>
      `
          : ""
      }

      <div class="print-time">
        Printed: ${new Date().toLocaleString()}
      </div>
    </body>
    </html>
  `
}

export const autoPrintBill = async (invoice: Invoice, options: PrintOptions = {}) => {
  return printBill(invoice, { ...options, autoPrint: true })
}

export const setupAutoPrint = (enabled = true) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auto_print_enabled", enabled.toString())
  }
}

export const isAutoPrintEnabled = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auto_print_enabled") === "true"
  }
  return false
}

export const printMultipleCopies = async (invoice: Invoice, copies: number, options: PrintOptions = {}) => {
  const promises = []

  for (let i = 0; i < copies; i++) {
    promises.push(
      new Promise((resolve) => {
        setTimeout(() => {
          printBill(invoice, options).then(resolve)
        }, i * 500) // Delay between prints to avoid conflicts
      }),
    )
  }

  return Promise.all(promises)
}
