const mongoose = require("mongoose")

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  taxPercent: {
    type: Number,
    required: true,
    enum: [0, 5, 12, 18, 28],
  },
  amount: {
    type: Number,
    required: true,
  },
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessGST: String,
    businessAddress: String,
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: String,
    clientPhone: String,
    clientGST: String,
    clientAddress: String,
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: String,
    terms: String,
    pdfPath: String,
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Invoice", invoiceSchema)
