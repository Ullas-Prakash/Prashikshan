function Projects() {
  return (
    <section
      id="projects"
      className="min-h-screen bg-gray-900 text-white py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Projects
        </h2>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Project 1 */}
          <div className="bg-gray-600 p-6 rounded-xl shadow-lg hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">
              Pro-1
            </h3>
            <p className="text-gray-400 min-h-[80px]">
              {/* Description goes here later */}
            </p>
          </div>

          {/* Project 2 */}
          <div className="bg-gray-600 p-6 rounded-xl shadow-lg hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">
              Pro-2
            </h3>
            <p className="text-gray-400 min-h-[80px]">
              {/* Description goes here later */}
            </p>
          </div>

          {/* Project 3 */}
          <div className="bg-gray-600 p-6 rounded-xl shadow-lg hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">
              Pro-3
            </h3>
            <p className="text-gray-400 min-h-[80px]">
              {/* Description goes here later */}
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Projects
