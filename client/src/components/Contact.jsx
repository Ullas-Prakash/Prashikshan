import { useState } from "react"
import axios from "axios"

function Contact() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await axios.post("http://localhost:5000/api/contact", form)
      alert("Message Sent Successfully!")
      setForm({ name: "", email: "", message: "" })
    } catch (error) {
      console.error(error)
      alert("Error sending message")
    }
  }

  return (
    <section id="contact" className="min-h-screen bg-gray-700 text-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Contact Me
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-4 rounded-lg bg-gray-800"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-4 rounded-lg bg-gray-800"
            required
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="5"
            className="w-full p-4 rounded-lg bg-gray-800"
            required
          ></textarea>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Send Message
          </button>

        </form>
      </div>
    </section>
  )
}

export default Contact
