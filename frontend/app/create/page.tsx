"use client"

import { useState, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Trash2, Plus, Download, Share2, Mail } from "lucide-react"
import { InvoicePreview } from "../../components/invoice-preview"
import { useToast } from "../../hooks/use-toast"
import ClickSpark from "../../components/ClickSpark"
// Import PDF libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  taxPercent: number
  amount: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  businessName: string
  businessGST: string
  businessAddress: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientGST: string
  clientAddress: string
  items: InvoiceItem[]
  notes: string
  terms: string
}

export default function CreateInvoicePage() {
  const { toast } = useToast()
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    businessName: "",
    businessGST: "",
    businessAddress: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientGST: "",
    clientAddress: "",
    items: [
      {
        id: "1",
        description: "",
        quantity: 1,
        rate: 0,
        taxPercent: 18,
        amount: 0,
      },
    ],
    notes: "",
    terms: "Payment is due within 30 days of invoice date.",
  })
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  
  const invoicePreviewRef = useRef<HTMLDivElement>(null)

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      taxPercent: 18,
      amount: 0,
    }
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Calculate amount when quantity or rate changes
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = invoiceData.items.reduce((sum, item) => {
      return sum + (item.amount * item.taxPercent) / 100
    }, 0)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const handleDownloadPDF = async () => {
    if (!invoicePreviewRef.current) return;

    toast({
      title: "Generating PDF...",
      description: "Your invoice PDF is being generated.",
    })

    try {
      // Capture the invoice preview as an image
      const canvas = await html2canvas(invoicePreviewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Calculate dimensions to fit on A4 page
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If image height is greater than page height, add more pages
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save PDF
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
      
      toast({
        title: "PDF Generated!",
        description: "Your invoice has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleShareWhatsApp = () => {
    const message = `Hi ${invoiceData.clientName}, please find your invoice for ₹${total.toFixed(2)}. Invoice #${invoiceData.invoiceNumber}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSendEmail = () => {
    setEmailTo(invoiceData.clientEmail || "");
    setEmailSubject(`Invoice #${invoiceData.invoiceNumber} from ${invoiceData.businessName}`);
    setEmailMessage(`Dear ${invoiceData.clientName},\n\nPlease find attached the invoice #${invoiceData.invoiceNumber} for ₹${total.toFixed(2)}.\n\nPayment is due by ${invoiceData.dueDate}.\n\nRegards,\n${invoiceData.businessName}`);
    setIsEmailDialogOpen(true);
  }

  const handleEmailSubmit = async () => {
    if (!invoicePreviewRef.current) return;

    toast({
      title: "Preparing email...",
      description: "Generating attachment and sending email.",
    });

    try {
      // Generate PDF for email attachment
      const canvas = await html2canvas(invoicePreviewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Convert PDF to base64
      const pdfBase64 = pdf.output('datauristring');
      
      // Create mailto link with attachment (this is a simplified approach)
      // Note: Email clients have size limits for mailto links
      // For production, use a backend email service
      
      // For now, just open the default email client with prefilled fields
      const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
      
      window.open(mailtoLink, '_blank');
      
      // Close dialog
      setIsEmailDialogOpen(false);
      
      toast({
        title: "Email Prepared!",
        description: "Your default email client has been opened with the invoice information.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to prepare email. Please try again.",
        variant: "destructive"
      });
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50">
      <ClickSpark
        sparkColor='#000'
        sparkSize={15}
        sparkRadius={18}
        sparkCount={8}
        duration={400}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600">Generate professional GST-ready invoices</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={invoiceData.businessName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessGST">GST Number (Optional)</Label>
                    <Input
                      id="businessGST"
                      value={invoiceData.businessGST}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, businessGST: e.target.value }))}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={invoiceData.businessAddress}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceData((prev) => ({ ...prev, businessAddress: e.target.value }))}
                      placeholder="Your business address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={invoiceData.clientName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Client Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoiceData.clientEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        value={invoiceData.clientPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clientGST">Client GST (Optional)</Label>
                    <Input
                      id="clientGST"
                      value={invoiceData.clientGST}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientGST: e.target.value }))}
                      placeholder="22BBBBB0000B1Z5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Client Address</Label>
                    <Textarea
                      id="clientAddress"
                      value={invoiceData.clientAddress}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                      placeholder="Client address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceData.invoiceNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={invoiceData.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoiceData.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Rate (₹)</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Tax %</Label>
                          <Select
                            value={item.taxPercent.toString()}
                            onValueChange={(value: string) => updateItem(item.id, "taxPercent", Number.parseFloat(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Label>Amount</Label>
                          <div className="text-sm font-medium py-2">₹{item.amount.toFixed(2)}</div>
                        </div>
                        <div className="col-span-1">
                          {invoiceData.items.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addItem} className="mt-4 w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>

                  {/* Totals */}
                  <div className="mt-6 space-y-2 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes and Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for the client"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={invoiceData.terms}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceData((prev) => ({ ...prev, terms: e.target.value }))}
                      placeholder="Payment terms and conditions"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleDownloadPDF} className="flex-1 min-w-[200px]">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleShareWhatsApp} className="flex-1 min-w-[200px] bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share WhatsApp
                </Button>
                <Button variant="outline" onClick={handleSendEmail} className="flex-1 min-w-[200px] bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
              
              {/* Email Dialog */}
              <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Send Invoice by Email</DialogTitle>
                    <DialogDescription>
                      Send this invoice directly to your client via email.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="emailTo" className="text-right">
                        To
                      </Label>
                      <Input
                        id="emailTo"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="client@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailSubject" className="text-right">
                        Subject
                      </Label>
                      <Input
                        id="emailSubject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailMessage" className="text-right">
                        Message
                      </Label>
                      <Textarea
                        id="emailMessage"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEmailSubmit}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-8">
              <div ref={invoicePreviewRef}>
                <InvoicePreview invoiceData={invoiceData} totals={{ subtotal, taxAmount, total }} />
              </div>
            </div>
          </div>
        </div>
      </ClickSpark>
    </div>
  )
}
