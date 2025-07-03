const express = require("express")
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs").promises
const Invoice = require("../models/Invoice")
const auth = require("../middleware/auth")

const router = express.Router()

// Create invoice
router.post("/", async (req, res) => {
  try {
    const invoiceData = req.body

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = invoiceData.items.reduce((sum, item) => {
      return sum + (item.amount * item.taxPercent) / 100
    }, 0)
    const total = subtotal + taxAmount

    const invoice = new Invoice({
      ...invoiceData,
      subtotal,
      taxAmount,
      total,
    })

    await invoice.save()

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice)
    invoice.pdfPath = pdfPath
    await invoice.save()

    res.status(201).json({
      success: true,
      invoice,
      pdfUrl: `/uploads/${path.basename(pdfPath)}`,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    res.status(500).json({ error: "Failed to create invoice" })
  }
})

// Get invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" })
    }
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" })
  }
})

// Get user invoices (protected route)
router.get("/user/all", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" })
  }
})

// Generate PDF function
async function generateInvoicePDF(invoice) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()

  const html = generateInvoiceHTML(invoice)

  await page.setContent(html, { waitUntil: "networkidle0" })

  const uploadsDir = path.join(__dirname, "../uploads")
  await fs.mkdir(uploadsDir, { recursive: true })

  const pdfPath = path.join(uploadsDir, `invoice-${invoice.invoiceNumber}.pdf`)

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  })

  await browser.close()
  return pdfPath
}

// Generate HTML template for PDF
function generateInvoiceHTML(invoice) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-title { color: #2563eb; font-size: 36px; font-weight: bold; }
        .business-info { text-align: right; }
        .client-info { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { width: 300px; margin-left: auto; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="invoice-title">INVOICE</div>
          <div>#${invoice.invoiceNumber}</div>
        </div>
        <div class="business-info">
          <h2>${invoice.businessName}</h2>
          ${invoice.businessGST ? `<div>GST: ${invoice.businessGST}</div>` : ""}
          <div>${invoice.businessAddress || ""}</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div class="client-info">
          <h3>Bill To:</h3>
          <div><strong>${invoice.clientName}</strong></div>
          ${invoice.clientEmail ? `<div>${invoice.clientEmail}</div>` : ""}
          ${invoice.clientPhone ? `<div>${invoice.clientPhone}</div>` : ""}
          ${invoice.clientGST ? `<div>GST: ${invoice.clientGST}</div>` : ""}
          <div>${invoice.clientAddress || ""}</div>
        </div>
        <div>
          <div><strong>Invoice Date:</strong> ${new Date(invoice.date).toLocaleDateString("en-IN")}</div>
          <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-center">Tax %</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">₹${item.rate.toFixed(2)}</td>
              <td class="text-center">${item.taxPercent}%</td>
              <td class="text-right">₹${item.amount.toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">₹${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax Amount:</td>
            <td class="text-right">₹${invoice.taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">₹${invoice.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      ${
        invoice.notes
          ? `
        <div style="margin-top: 30px;">
          <h4>Notes:</h4>
          <p>${invoice.notes}</p>
        </div>
      `
          : ""
      }
      
      ${
        invoice.terms
          ? `
        <div style="margin-top: 20px;">
          <h4>Terms & Conditions:</h4>
          <p>${invoice.terms}</p>
        </div>
      `
          : ""
      }
      
      <div class="footer">
        <p>Generated by SwiftBill - Professional Invoice Generator</p>
      </div>
    </body>
    </html>
  `
}

module.exports = router
