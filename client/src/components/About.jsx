function About() {
  return (
    <section
      id="about"
      className="min-h-screen bg-gray-800 text-white py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          About Me
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Side - Description */}
          <div>
            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
              I am a passionate Full Stack Developer who enjoys building
              scalable and efficient web applications. I focus on writing clean,
              maintainable code and designing intuitive user experiences.
            </p>

            <p className="text-gray-400 leading-relaxed text-lg">
              My expertise includes frontend development with React and modern
              UI frameworks, backend systems using Node.js and Express, and
              database design with MongoDB. I enjoy solving real-world problems
              through technology.
            </p>
          </div>

          {/* Right Side - Skills */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-blue-400">
              Technical Skills
            </h3>

            <div className="grid grid-cols-2 gap-4 text-gray-300">

              <div className="bg-gray-700 p-4 rounded-lg">React</div>
              <div className="bg-gray-700 p-4 rounded-lg">Node.js</div>
              <div className="bg-gray-700 p-4 rounded-lg">Express.js</div>
              <div className="bg-gray-700 p-4 rounded-lg">MongoDB</div>
              <div className="bg-gray-700 p-4 rounded-lg">Tailwind CSS</div>
              <div className="bg-gray-700 p-4 rounded-lg">REST APIs</div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default About
