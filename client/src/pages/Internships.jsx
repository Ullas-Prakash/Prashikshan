import { useState } from 'react'

const ALL_INTERNSHIPS = [
  { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp', skills: ['react', 'javascript'], location: 'Remote', type: 'Full-time', duration: '3 months', stipend: '₹10,000/mo', link: '#' },
  { id: 2, title: 'Python Developer Intern', company: 'DataLabs', skills: ['python', 'ml'], location: 'Bengaluru', type: 'Part-time', duration: '6 months', stipend: '₹8,000/mo', link: '#' },
  { id: 3, title: 'Full Stack Intern', company: 'StartupX', skills: ['react', 'nodejs', 'mongodb'], location: 'Remote', type: 'Full-time', duration: '4 months', stipend: '₹15,000/mo', link: '#' },
  { id: 4, title: 'Data Science Intern', company: 'Analytics Co', skills: ['python', 'sql', 'ml'], location: 'Mumbai', type: 'Full-time', duration: '6 months', stipend: '₹12,000/mo', link: '#' },
  { id: 5, title: 'Backend Developer Intern', company: 'CloudBase', skills: ['nodejs', 'mongodb'], location: 'Hyderabad', type: 'Part-time', duration: '3 months', stipend: '₹8,000/mo', link: '#' },
  { id: 6, title: 'UI/UX Design Intern', company: 'DesignHub', skills: ['figma'], location: 'Remote', type: 'Full-time', duration: '2 months', stipend: '₹6,000/mo', link: '#' },
]

const LOCATIONS = ['all', 'Remote', 'Bengaluru', 'Mumbai', 'Hyderabad']
const TYPES = ['all', 'Full-time', 'Part-time']
const SKILLS = ['all', 'react', 'javascript', 'python', 'nodejs', 'mongodb', 'ml', 'sql', 'figma']

export default function Internships() {
  const [locationFilter, setLocationFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_INTERNSHIPS.filter(job => {
    const matchLocation = locationFilter === 'all' || job.location === locationFilter
    const matchType = typeFilter === 'all' || job.type === typeFilter
    const matchSkill = skillFilter === 'all' || job.skills.includes(skillFilter)
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                        job.company.toLowerCase().includes(search.toLowerCase())
    return matchLocation && matchType && matchSkill && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">💼 Internships</h1>
          <p className="text-gray-500 mt-1">Find internships that match your skills</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search by title or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-8">

          {/* Skill */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Skill</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button key={s} onClick={() => setSkillFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition
                    ${skillFilter === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Location</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(l => (
                <button key={l} onClick={() => setLocationFilter(l)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition
                    ${locationFilter === l ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Type</p>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition
                    ${typeFilter === t ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} internship{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Internship List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-lg font-medium">No internships found</p>
            <p className="text-sm">Try changing your filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{job.company} · {job.location}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${job.type === 'Full-time' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {job.type}
                  </span>
                </div>

                {/* Details */}
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>⏱ {job.duration}</span>
                  <span>💰 {job.stipend}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.map((s, i) => (
                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{s}</span>
                  ))}
                </div>

                {/* Apply Button */}
                <a
                  href={job.link}
                  className="inline-block mt-4 bg-blue-700 text-white text-sm px-6 py-2 rounded-xl hover:bg-blue-800 transition"
                >
                  Apply Now →
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}