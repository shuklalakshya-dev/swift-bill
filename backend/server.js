const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Import routes
const invoiceRoutes = require("./routes/invoices")
const authRoutes = require("./routes/auth")
const emailRoutes = require("./routes/email")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (for PDF storage)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://LAKSHYA:LAKSHYA123@cluster0.w8dwhc9.mongodb.net/invoice?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/invoices", invoiceRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SwiftBill API is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
