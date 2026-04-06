import express from "express"
import nodemailer from "nodemailer"
import Contact from "../models/contact.js"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body

    // Save to DB
    const newMessage = await Contact.create({
      name,
      email,
      message,
    })

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Send email
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "New Portfolio Contact Message",
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    })

    res.status(200).json({ message: "Message sent successfully" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

export default router
