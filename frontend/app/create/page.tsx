"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Trash2, Plus, Download, Share2, Mail, CheckCircle2, Info, ArrowRight, Sparkles } from "lucide-react"
import { InvoicePreview } from "../../components/invoice-preview"
import { useToast } from "../../hooks/use-toast"
import ClickSpark from "../../components/ClickSpark"
// Import PDF libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti';
import { Progress } from "../../components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"

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

  // New state for interactive elements
  const [activeSection, setActiveSection] = useState("business")
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null)
  const [animatePreview, setAnimatePreview] = useState(false)
  const [showTips, setShowTips] = useState(true)
  
  const sectionRefs = {
    business: useRef<HTMLDivElement>(null),
    client: useRef<HTMLDivElement>(null),
    invoice: useRef<HTMLDivElement>(null),
    items: useRef<HTMLDivElement>(null),
    additional: useRef<HTMLDivElement>(null)
  }

  // Calculate completion percentage based on filled fields
  useEffect(() => {
    let completed = 0;
    let total = 0;
    
    // Business section (3 fields)
    if (invoiceData.businessName) completed++;
    if (invoiceData.businessGST) completed++;
    if (invoiceData.businessAddress) completed++;
    total += 3;
    
    // Client section (5 fields)
    if (invoiceData.clientName) completed++;
    if (invoiceData.clientEmail) completed++;
    if (invoiceData.clientPhone) completed++;
    if (invoiceData.clientGST) completed++;
    if (invoiceData.clientAddress) completed++;
    total += 5;
    
    // Invoice details (3 fields)
    if (invoiceData.invoiceNumber) completed++;
    if (invoiceData.date) completed++;
    if (invoiceData.dueDate) completed++;
    total += 3;
    
    // Items (count each completed item)
    invoiceData.items.forEach(item => {
      if (item.description) completed++;
      if (item.quantity > 0) completed++;
      if (item.rate > 0) completed++;
      total += 3;
    });
    
    // Additional info (2 fields)
    if (invoiceData.notes) completed++;
    if (invoiceData.terms) completed++;
    total += 2;
    
    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
    
    // Trigger animation when reaching certain thresholds
    
    // Animate preview when data changes
    setAnimatePreview(true);
    setTimeout(() => setAnimatePreview(false), 500);
    
  }, [invoiceData]);

  // Function to scroll to a section
  const scrollToSection = (section: keyof typeof sectionRefs) => {
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  // Trigger confetti effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Function to show success toast when field is completed
  const handleFieldCompletion = (fieldName: string) => {
    if (Math.random() > 0.7) { // Only show messages occasionally
      toast({
        title: "Good progress!",
        description: `You've completed the ${fieldName} field!`,
        variant: "default"
      });
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ClickSpark
        sparkColor='#000'
        sparkSize={15}
        sparkRadius={18}
        sparkCount={8}
        duration={400}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Create Invoice
            </h1>
            <p className="text-gray-600">Generate professional GST-ready invoices</p>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {completionPercentage}% complete
                </span>
                {showTips && (
                  <button 
                    onClick={() => setShowTips(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Hide tips
                  </button>
                )}
              </div>
              <Progress value={completionPercentage} className="h-2 bg-gray-200" />
              
              {/* Section navigation pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.keys(sectionRefs).map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section as keyof typeof sectionRefs)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      activeSection === section
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Success message */}
            <AnimatePresence>
              {recentlyCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">
                      {recentlyCompleted === "halfway" 
                        ? "You're halfway there! Keep going!" 
                        : "Amazing! You've completed all fields!"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Business Information */}
              <motion.div 
                ref={sectionRefs.business}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`border-l-4 transition-all ${
                  activeSection === 'business' ? 'border-l-blue-500 shadow-lg' : 'border-l-transparent'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="businessName" className="inline-flex">
                        Business Name
                        {showTips && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">Enter your registered business name as it should appear on the invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </Label>
                      <Input
                        id="businessName"
                        value={invoiceData.businessName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          setInvoiceData((prev) => ({ ...prev, businessName: value }));
                          if (value && !invoiceData.businessName) {
                            handleFieldCompletion("Business Name");
                          }
                        }}
                        placeholder="Your Business Name"
                        className="border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500 transition-all"
                      />
                      {invoiceData.businessName && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    
                    {/* Continue with other business fields following the same pattern */}
                    <div className="relative">
                      <Label htmlFor="businessGST">GST Number (Optional)</Label>
                      <Input
                        id="businessGST"
                        value={invoiceData.businessGST}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setInvoiceData((prev) => ({ ...prev, businessGST: e.target.value }));
                          if (e.target.value && !invoiceData.businessGST) {
                            handleFieldCompletion("GST Number");
                          }
                        }}
                        placeholder="22AAAAA0000A1Z5"
                        className="border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500 transition-all"
                      />
                      {invoiceData.businessGST && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        value={invoiceData.businessAddress}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          setInvoiceData((prev) => ({ ...prev, businessAddress: e.target.value }));
                          if (e.target.value && !invoiceData.businessAddress) {
                            handleFieldCompletion("Business Address");
                          }
                        }}
                        placeholder="Your business address"
                        rows={3}
                        className="border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500 transition-all resize-none"
                      />
                      {invoiceData.businessAddress && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    
                    {invoiceData.businessName && invoiceData.businessAddress && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end"
                      >
                        <Button 
                          onClick={() => scrollToSection('client')} 
                          variant="ghost" 
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Next: Client Info <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Client Information */}
              <motion.div 
                ref={sectionRefs.client}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`border-l-4 transition-all ${
                  activeSection === 'client' ? 'border-l-purple-500 shadow-lg' : 'border-l-transparent'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Client fields with similar enhancements */}
                    <div className="relative">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={invoiceData.clientName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setInvoiceData((prev) => ({ ...prev, clientName: e.target.value }));
                          if (e.target.value && !invoiceData.clientName) {
                            handleFieldCompletion("Client Name");
                          }
                        }}
                        placeholder="Client Name"
                        className="border-gray-300 focus-within:border-purple-500 focus-within:ring-purple-500 transition-all"
                      />
                      {invoiceData.clientName && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={invoiceData.clientEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                          placeholder="client@example.com"
                          className="border-gray-300 focus-within:border-purple-500 focus-within:ring-purple-500 transition-all"
                        />
                        {invoiceData.clientEmail && (
                          <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="absolute right-3 top-9 text-green-500"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.span>
                        )}
                      </div>
                      <div className="relative">
                        <Label htmlFor="clientPhone">Phone</Label>
                        <Input
                          id="clientPhone"
                          value={invoiceData.clientPhone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientPhone: e.target.value }))}
                          placeholder="+91 9876543210"
                          className="border-gray-300 focus-within:border-purple-500 focus-within:ring-purple-500 transition-all"
                        />
                        {invoiceData.clientPhone && (
                          <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="absolute right-3 top-9 text-green-500"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="clientGST">Client GST (Optional)</Label>
                      <Input
                        id="clientGST"
                        value={invoiceData.clientGST}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceData((prev) => ({ ...prev, clientGST: e.target.value }))}
                        placeholder="22BBBBB0000B1Z5"
                        className="border-gray-300 focus-within:border-purple-500 focus-within:ring-purple-500 transition-all"
                      />
                      {invoiceData.clientGST && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    <div className="relative">
                      <Label htmlFor="clientAddress">Client Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={invoiceData.clientAddress}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                        placeholder="Client address"
                        rows={3}
                        className="border-gray-300 focus-within:border-purple-500 focus-within:ring-purple-500 transition-all resize-none"
                      />
                      {invoiceData.clientAddress && (
                        <motion.span 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-9 text-green-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                    
                    {invoiceData.clientName && invoiceData.clientEmail && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-end"
                      >
                        <Button 
                          onClick={() => scrollToSection('invoice')} 
                          variant="ghost" 
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Next: Invoice Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Invoice Details */}
              <motion.div 
                ref={sectionRefs.invoice}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`border-l-4 transition-all ${
                  activeSection === 'invoice' ? 'border-l-green-500 shadow-lg' : 'border-l-transparent'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                      Invoice Details
                    </CardTitle>
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
              </motion.div>

              {/* Items */}
              <motion.div 
                ref={sectionRefs.items}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`border-l-4 transition-all ${
                  activeSection === 'items' ? 'border-l-amber-500 shadow-lg' : 'border-l-transparent'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
                      Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div id="items-container" className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {invoiceData.items.map((item, index) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-12 gap-2 items-end p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="col-span-4">
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Item description"
                              className="border-gray-300 focus-within:border-amber-500 focus-within:ring-amber-500"
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
                              className="border-gray-300 focus-within:border-amber-500 focus-within:ring-amber-500"
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
                              className="border-gray-300 focus-within:border-amber-500 focus-within:ring-amber-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Tax %</Label>
                            <Select
                              value={item.taxPercent.toString()}
                              onValueChange={(value: string) => updateItem(item.id, "taxPercent", Number.parseFloat(value))}
                            >
                              <SelectTrigger className="border-gray-300 focus:ring-amber-500 focus:border-amber-500">
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
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addItem}
                      className="mt-4 w-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-700 py-2.5 rounded-lg flex items-center justify-center hover:from-amber-100 hover:to-amber-200 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </motion.button>

                    {/* Totals */}
                    <motion.div 
                      className="mt-6 space-y-2 text-right bg-gray-50 p-4 rounded-lg border border-gray-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Amount:</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                      </div>
                      <motion.div 
                        className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2"
                        animate={{ 
                          scale: [1, 1.02, 1],
                          transition: { 
                            duration: 0.5,
                            repeat: 0,
                            repeatType: "reverse" 
                          }
                        }}
                      >
                        <span>Total:</span>
                        <span className="text-blue-700">₹{total.toFixed(2)}</span>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notes and Terms */}
              <motion.div 
                ref={sectionRefs.additional}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className={`border-l-4 transition-all ${
                  activeSection === 'additional' ? 'border-l-red-500 shadow-lg' : 'border-l-transparent'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-red-100 text-red-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
                      Additional Information
                    </CardTitle>
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
                        className="border-gray-300 focus-within:border-red-500 focus-within:ring-red-500 transition-all resize-none"
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
                        className="border-gray-300 focus-within:border-red-500 focus-within:ring-red-500 transition-all resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadPDF}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleShareWhatsApp}
                  className="flex-1 min-w-[200px] bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share WhatsApp
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendEmail}
                  className="flex-1 min-w-[200px] bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </motion.button>
              </motion.div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-8">
              <motion.div 
                ref={invoicePreviewRef}
                animate={animatePreview ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-xl text-gray-800">Live Preview</h3>
                  {completionPercentage >= 70 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center text-green-600 text-sm font-medium"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Looking great!
                    </motion.div>
                  )}
                </div>
                <InvoicePreview invoiceData={invoiceData} totals={{ subtotal, taxAmount, total }} />
              </motion.div>
            </div>
          </div>
        </div>
      </ClickSpark>
    </div>
  )
}
