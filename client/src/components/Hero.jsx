import { Github, Linkedin, Mail } from "lucide-react"

function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-24 px-6"
    >
      <div className="max-w-4xl text-center">

        {/* Small Intro */}
        <p className="text-blue-400 text-lg mb-4">
          Hello, I'm
        </p>

        {/* Name */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Ullas <span className="text-blue-500">P</span>
        </h1>

        {/* Role */}
        <h2 className="text-2xl md:text-3xl text-gray-300 mb-6">
          Full Stack Developer | Building Scalable Web Applications
        </h2>

        {/* Short Description */}
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          .....MY DESCRIPTION.....
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="#projects"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-lg"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-6 py-3 border border-gray-500 hover:border-blue-500 rounded-lg transition text-lg"
          >
            Contact Me
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-blue-400 transition">
            <Github size={28} />
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            <Linkedin size={28} />
          </a>
          <a href="#" className="hover:text-blue-400 transition">
            <Mail size={28} />
          </a>
        </div>

      </div>
    </section>
  )
}

export default Hero
