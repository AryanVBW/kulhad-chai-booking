"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Plus, Edit, Trash2, Printer, Eye, Copy } from "lucide-react"
import { getBillTemplates, saveBillTemplate, updateBillTemplate, deleteBillTemplate } from "@/lib/business-store"
import { BillPrinter } from "@/components/bill-printer"
import type { BillTemplate } from "@/lib/business-types"

export default function BillTemplatesPage() {
  const [templates, setTemplates] = useState<BillTemplate[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BillTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<BillTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<BillTemplate>>({
    name: "",
    isDefault: false,
    headerText: "Thank you for your business!",
    footerText: "Visit us again soon!",
    showLogo: true,
    showGST: true,
    showQR: false,
    paperSize: "thermal",
    fontSize: "medium",
    colors: {
      primary: "#1f2937",
      secondary: "#6b7280",
      text: "#111827",
    },
    layout: {
      showBorder: true,
      showWatermark: false,
      compactMode: true,
    },
    businessInfo: {
      name: "Kulhad Chai Business",
      address: "123 Main Street, City, State 12345",
      phone: "+91 9876543210",
      email: "info@kulhadchai.com",
      gstNumber: "27AAAAA0000A1Z5",
    },
  })

  useEffect(() => {
    setTemplates(getBillTemplates())
  }, [])

  const handleAddTemplate = () => {
    if (newTemplate.name) {
      const template = saveBillTemplate(newTemplate as Omit<BillTemplate, "id" | "createdAt" | "updatedAt">)
      setTemplates(getBillTemplates())
      setIsAddDialogOpen(false)
      resetNewTemplate()
    }
  }

  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      updateBillTemplate(editingTemplate.id, editingTemplate)
      setTemplates(getBillTemplates())
      setEditingTemplate(null)
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteBillTemplate(templateId)
      setTemplates(getBillTemplates())
    }
  }

  const handleSetDefault = (templateId: string) => {
    // Remove default from all templates
    templates.forEach((template) => {
      if (template.isDefault) {
        updateBillTemplate(template.id, { isDefault: false })
      }
    })
    // Set new default
    updateBillTemplate(templateId, { isDefault: true })
    setTemplates(getBillTemplates())
  }

  const handleDuplicateTemplate = (template: BillTemplate) => {
    const duplicated = {
      ...template,
      name: `${template.name} (Copy)`,
      isDefault: false,
    }
    delete (duplicated as any).id
    delete (duplicated as any).createdAt
    delete (duplicated as any).updatedAt

    saveBillTemplate(duplicated)
    setTemplates(getBillTemplates())
  }

  const resetNewTemplate = () => {
    setNewTemplate({
      name: "",
      isDefault: false,
      headerText: "Thank you for your business!",
      footerText: "Visit us again soon!",
      showLogo: true,
      showGST: true,
      showQR: false,
      paperSize: "thermal",
      fontSize: "medium",
      colors: {
        primary: "#1f2937",
        secondary: "#6b7280",
        text: "#111827",
      },
      layout: {
        showBorder: true,
        showWatermark: false,
        compactMode: true,
      },
      businessInfo: {
        name: "Kulhad Chai Business",
        address: "123 Main Street, City, State 12345",
        phone: "+91 9876543210",
        email: "info@kulhadchai.com",
        gstNumber: "27AAAAA0000A1Z5",
      },
    })
  }

  // Sample invoice data for preview
  const sampleInvoice = {
    id: "1",
    invoiceNumber: "INV-1001",
    customerName: "John Doe",
    customerPhone: "+91 9876543210",
    customerAddress: "123 Customer Street, City",
    items: [
      {
        id: "1",
        productName: "Kulhad Chai",
        quantity: 2,
        unitPrice: 25,
        totalAmount: 50,
        taxAmount: 2.5,
      },
      {
        id: "2",
        productName: "Samosa",
        quantity: 3,
        unitPrice: 15,
        totalAmount: 45,
        taxAmount: 2.25,
      },
    ],
    subtotal: 95,
    taxAmount: 4.75,
    totalAmount: 99.75,
    createdAt: new Date(),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold">Business Admin</h1>
            <p className="text-sm text-sidebar-foreground/70">Bill Templates</p>
          </div>
          <nav className="px-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/customers")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Customers
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/products")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Products
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/invoices")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/payments")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Payments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => (window.location.href = "/admin-dashboard/reports")}
            >
              <FileText className="mr-3 h-4 w-4" />
              Reports
            </Button>
            <Button variant="default" className="w-full justify-start">
              <Printer className="mr-3 h-4 w-4" />
              Bill Templates
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bill Templates</h1>
              <p className="text-muted-foreground">Customize your bill and receipt formats</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Bill Template</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Enter template name"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDefault"
                        checked={newTemplate.isDefault}
                        onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isDefault: checked })}
                      />
                      <Label htmlFor="isDefault">Set as default template</Label>
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="headerText">Header Text</Label>
                      <Textarea
                        id="headerText"
                        value={newTemplate.headerText}
                        onChange={(e) => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                        placeholder="Header message"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footerText">Footer Text</Label>
                      <Textarea
                        id="footerText"
                        value={newTemplate.footerText}
                        onChange={(e) => setNewTemplate({ ...newTemplate, footerText: e.target.value })}
                        placeholder="Footer message"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paperSize">Paper Size</Label>
                        <Select
                          value={newTemplate.paperSize}
                          onValueChange={(value: "A4" | "A5" | "thermal") =>
                            setNewTemplate({ ...newTemplate, paperSize: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thermal">Thermal (80mm)</SelectItem>
                            <SelectItem value="A5">A5 Paper</SelectItem>
                            <SelectItem value="A4">A4 Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Select
                          value={newTemplate.fontSize}
                          onValueChange={(value: "small" | "medium" | "large") =>
                            setNewTemplate({ ...newTemplate, fontSize: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Display Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showLogo"
                            checked={newTemplate.showLogo}
                            onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, showLogo: checked })}
                          />
                          <Label htmlFor="showLogo">Show Logo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showGST"
                            checked={newTemplate.showGST}
                            onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, showGST: checked })}
                          />
                          <Label htmlFor="showGST">Show GST Number</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showQR"
                            checked={newTemplate.showQR}
                            onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, showQR: checked })}
                          />
                          <Label htmlFor="showQR">Show QR Code</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Business Information</Label>
                      <div className="space-y-2 mt-2">
                        <Input
                          placeholder="Business Name"
                          value={newTemplate.businessInfo?.name}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              businessInfo: { ...newTemplate.businessInfo!, name: e.target.value },
                            })
                          }
                        />
                        <Textarea
                          placeholder="Business Address"
                          value={newTemplate.businessInfo?.address}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              businessInfo: { ...newTemplate.businessInfo!, address: e.target.value },
                            })
                          }
                        />
                        <Input
                          placeholder="Phone Number"
                          value={newTemplate.businessInfo?.phone}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              businessInfo: { ...newTemplate.businessInfo!, phone: e.target.value },
                            })
                          }
                        />
                        <Input
                          placeholder="Email Address"
                          value={newTemplate.businessInfo?.email}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              businessInfo: { ...newTemplate.businessInfo!, email: e.target.value },
                            })
                          }
                        />
                        <Input
                          placeholder="GST Number"
                          value={newTemplate.businessInfo?.gstNumber}
                          onChange={(e) =>
                            setNewTemplate({
                              ...newTemplate,
                              businessInfo: { ...newTemplate.businessInfo!, gstNumber: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Colors</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <Label htmlFor="primaryColor" className="text-xs">
                            Primary
                          </Label>
                          <Input
                            id="primaryColor"
                            type="color"
                            value={newTemplate.colors?.primary}
                            onChange={(e) =>
                              setNewTemplate({
                                ...newTemplate,
                                colors: { ...newTemplate.colors!, primary: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryColor" className="text-xs">
                            Secondary
                          </Label>
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={newTemplate.colors?.secondary}
                            onChange={(e) =>
                              setNewTemplate({
                                ...newTemplate,
                                colors: { ...newTemplate.colors!, secondary: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="textColor" className="text-xs">
                            Text
                          </Label>
                          <Input
                            id="textColor"
                            type="color"
                            value={newTemplate.colors?.text}
                            onChange={(e) =>
                              setNewTemplate({
                                ...newTemplate,
                                colors: { ...newTemplate.colors!, text: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Layout Options</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showBorder"
                            checked={newTemplate.layout?.showBorder}
                            onCheckedChange={(checked) =>
                              setNewTemplate({
                                ...newTemplate,
                                layout: { ...newTemplate.layout!, showBorder: checked },
                              })
                            }
                          />
                          <Label htmlFor="showBorder">Show Border</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="compactMode"
                            checked={newTemplate.layout?.compactMode}
                            onCheckedChange={(checked) =>
                              setNewTemplate({
                                ...newTemplate,
                                layout: { ...newTemplate.layout!, compactMode: checked },
                              })
                            }
                          />
                          <Label htmlFor="compactMode">Compact Mode</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTemplate}>Create Template</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className={template.isDefault ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        {template.isDefault && <Badge>Default</Badge>}
                        <Badge variant="outline">{template.paperSize}</Badge>
                        <Badge variant="outline">{template.fontSize}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Header:</strong> {template.headerText}
                      </p>
                      <p>
                        <strong>Footer:</strong> {template.footerText}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                      {!template.isDefault && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefault(template.id)}>
                          Set Default
                        </Button>
                      )}
                      {!template.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview Dialog */}
          {previewTemplate && (
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto">
                  <BillPrinter invoice={sampleInvoice as any} template={previewTemplate} isPreview={true} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                    Close
                  </Button>
                  <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Test
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
