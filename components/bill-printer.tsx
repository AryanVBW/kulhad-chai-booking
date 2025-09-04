"use client"

import { forwardRef } from "react"
import { Separator } from "@/components/ui/separator"
import type { Invoice, BillTemplate } from "@/lib/business-types"

interface BillPrinterProps {
  invoice: Invoice
  template: BillTemplate
  isPreview?: boolean
}

export const BillPrinter = forwardRef<HTMLDivElement, BillPrinterProps>(
  ({ invoice, template, isPreview = false }, ref) => {
    const getFontSize = () => {
      switch (template.fontSize) {
        case "small":
          return "text-xs"
        case "large":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    const getPaperWidth = () => {
      switch (template.paperSize) {
        case "A4":
          return "max-w-[210mm]"
        case "A5":
          return "max-w-[148mm]"
        default:
          return "max-w-[80mm]" // thermal
      }
    }

    const styles = {
      color: template.colors.text,
      fontSize: template.fontSize === "small" ? "12px" : template.fontSize === "large" ? "16px" : "14px",
    }

    return (
      <div
        ref={ref}
        className={`
          ${getPaperWidth()} mx-auto bg-white p-4 
          ${template.layout.showBorder ? "border border-gray-300" : ""}
          ${template.layout.compactMode ? "space-y-1" : "space-y-2"}
          ${isPreview ? "shadow-lg" : ""}
        `}
        style={styles}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          {template.showLogo && (
            <div className="mb-2">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: template.colors.primary }}
              >
                LOGO
              </div>
            </div>
          )}

          <h1 className="font-bold text-lg" style={{ color: template.colors.primary }}>
            {template.businessInfo.name}
          </h1>

          <div className={`${getFontSize()} text-center`}>
            <p>{template.businessInfo.address}</p>
            <p>Phone: {template.businessInfo.phone}</p>
            <p>Email: {template.businessInfo.email}</p>
            {template.showGST && template.businessInfo.gstNumber && <p>GST: {template.businessInfo.gstNumber}</p>}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Header Text */}
        {template.headerText && (
          <div className="text-center">
            <p className={`${getFontSize()} font-medium`} style={{ color: template.colors.secondary }}>
              {template.headerText}
            </p>
          </div>
        )}

        <Separator className="my-2" />

        {/* Invoice Details */}
        <div className={`${getFontSize()} space-y-1`}>
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span className="font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{invoice.customerName}</span>
          </div>
          {invoice.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{invoice.customerPhone}</span>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        {/* Items */}
        <div className={getFontSize()}>
          <div className="font-medium mb-1">Items:</div>
          {invoice.items.map((item, index) => (
            <div key={index} className="space-y-1 mb-2">
              <div className="flex justify-between">
                <span className="font-medium">{item.productName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>
                  {item.quantity} × ₹{item.unitPrice}
                </span>
                <span>₹{item.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Totals */}
        <div className={`${getFontSize()} space-y-1`}>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{invoice.taxAmount}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{invoice.discount}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-bold text-base">
            <span>Total:</span>
            <span>₹{invoice.totalAmount}</span>
          </div>
        </div>

        {/* Payment Status */}
        {invoice.paymentStatus && (
          <>
            <Separator className="my-2" />
            <div className={`${getFontSize()} text-center`}>
              <span
                className="font-medium"
                style={{
                  color:
                    invoice.paymentStatus === "paid"
                      ? "#10b981"
                      : invoice.paymentStatus === "partial"
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              >
                Payment Status: {invoice.paymentStatus.toUpperCase()}
              </span>
              {invoice.balanceDue > 0 && <p className="text-xs mt-1">Balance Due: ₹{invoice.balanceDue}</p>}
            </div>
          </>
        )}

        {/* QR Code */}
        {template.showQR && (
          <>
            <Separator className="my-2" />
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto border-2 border-dashed flex items-center justify-center text-xs"
                style={{ borderColor: template.colors.secondary }}
              >
                QR CODE
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        {template.footerText && (
          <>
            <Separator className="my-2" />
            <div className="text-center">
              <p className={`${getFontSize()}`} style={{ color: template.colors.secondary }}>
                {template.footerText}
              </p>
            </div>
          </>
        )}

        {/* Print timestamp */}
        <div className="text-center text-xs mt-4" style={{ color: template.colors.secondary }}>
          Printed: {new Date().toLocaleString()}
        </div>
      </div>
    )
  },
)

BillPrinter.displayName = "BillPrinter"
