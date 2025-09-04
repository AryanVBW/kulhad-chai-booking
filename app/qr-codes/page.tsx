"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, Eye } from "lucide-react"
import type { Table } from "@/lib/types"
import { getTables } from "@/lib/store"

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [baseUrl, setBaseUrl] = useState<string>("")

  useEffect(() => {
    setTables(getTables())
    setBaseUrl(window.location.origin)
  }, [])

  const generateQRUrl = (tableNumber: number) => {
    return `${baseUrl}/?table=${tableNumber}`
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadAll = () => {
    // Create a new window with all QR codes for download
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kulhad Chai - Table QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
            .qr-card { text-align: center; border: 2px solid #ea580c; border-radius: 12px; padding: 20px; }
            .qr-title { font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 10px; }
            .qr-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
            .qr-code { margin: 20px 0; }
            .instructions { font-size: 14px; color: #666; margin-top: 15px; }
            @media print {
              body { margin: 0; }
              .qr-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="qr-grid">
            ${tables
              .map(
                (table) => `
              <div class="qr-card">
                <div class="qr-title">Table ${table.number}</div>
                <div class="qr-subtitle">Kulhad Chai</div>
                <div class="qr-code">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <!-- QR code would be generated here -->
                  </svg>
                </div>
                <div class="instructions">
                  Scan to view menu<br/>
                  and place your order
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
          <p className="text-orange-100">Generate and print QR codes for all tables</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 print:hidden">
          <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Printer className="w-4 h-4 mr-2" />
            Print All QR Codes
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(generateQRUrl(1), "_blank")}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Menu
          </Button>
        </div>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-8">
          {tables.map((table) => (
            <Card key={table.id} className="border-orange-200 shadow-lg print:shadow-none print:border-2">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-orange-600 print:text-3xl">
                  Table {table.number}
                </CardTitle>
                <p className="text-gray-600 font-medium">Kulhad Chai</p>
              </CardHeader>
              <CardContent className="text-center">
                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG
                      value={generateQRUrl(table.number)}
                      size={160}
                      level="M"
                      includeMargin={true}
                      className="print:w-48 print:h-48"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">Scan to view menu</p>
                  <p>and place your order</p>
                </div>

                {/* Table Info */}
                <div className="mt-4 pt-4 border-t border-orange-100 print:hidden">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Capacity: {table.capacity} people</p>
                    <p>Status: {table.status}</p>
                    <p className="font-mono text-xs break-all">{generateQRUrl(table.number)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Print Instructions */}
        <div className="mt-12 p-6 bg-orange-50 rounded-lg border border-orange-200 print:hidden">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">Printing Instructions</h3>
          <div className="text-sm text-orange-700 space-y-2">
            <p>• Print on A4 paper for best results</p>
            <p>• Use high-quality print settings for clear QR codes</p>
            <p>• Laminate the QR codes to protect them from spills</p>
            <p>• Place QR codes in visible locations on each table</p>
            <p>• Test each QR code with a phone camera before placing</p>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="mt-8 print:hidden">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">QR Code Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{tables.length}</p>
                  <p className="text-sm text-gray-600">Total Tables</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {tables.filter((t) => t.status === "available").length}
                  </p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {tables.filter((t) => t.status === "occupied").length}
                  </p>
                  <p className="text-sm text-gray-600">Occupied</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{tables.reduce((sum, t) => sum + t.capacity, 0)}</p>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .print\\:gap-8 {
            gap: 2rem !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:text-3xl {
            font-size: 1.875rem !important;
          }
          .print\\:w-48 {
            width: 12rem !important;
          }
          .print\\:h-48 {
            height: 12rem !important;
          }
        }
      `}</style>
    </div>
  )
}
