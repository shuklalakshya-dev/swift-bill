const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mytopsecret")
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ error: "Token is not valid" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" })
  }
}

module.exports = auth
