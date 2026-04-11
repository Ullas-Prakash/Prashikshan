const express = require('express')
const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: '✅ Question routes working!' })
})

module.exports = router
