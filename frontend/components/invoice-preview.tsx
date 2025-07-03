import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { forwardRef } from "react"

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

interface InvoicePreviewProps {
  invoiceData: InvoiceData
  totals: {
    subtotal: number
    taxAmount: number
    total: number
  }
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ invoiceData, totals }, ref) => {
  return (
    <Card className="w-full">
      <CardContent>
        <div ref={ref} className="bg-white p-8 border rounded-lg" id="invoice-preview">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
              <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">{invoiceData.businessName}</h2>
              {invoiceData.businessGST && <p className="text-sm text-gray-600">GST: {invoiceData.businessGST}</p>}
              <div className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.businessAddress}</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm">
                <p className="font-medium">{invoiceData.clientName}</p>
                {invoiceData.clientEmail && <p>{invoiceData.clientEmail}</p>}
                {invoiceData.clientPhone && <p>{invoiceData.clientPhone}</p>}
                {invoiceData.clientGST && <p>GST: {invoiceData.clientGST}</p>}
                <div className="whitespace-pre-line">{invoiceData.clientAddress}</div>
              </div>
            </div>
            <div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Invoice Date:</span>
                  <span>{new Date(invoiceData.date).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{new Date(invoiceData.dueDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Tax %</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.taxPercent}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span>₹{totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoiceData.notes || invoiceData.terms) && (
            <div className="space-y-4">
              {invoiceData.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
                </div>
              )}
              {invoiceData.terms && (
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p>Generated by SwiftBill - Professional Invoice Generator</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

InvoicePreview.displayName = "InvoicePreview"
