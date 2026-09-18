const Course = require('../models/Course');
const Internship = require('../models/Internship');

const courses = [
  { code: 'WEB-101', title: 'Modern Web Foundations', summary: 'Build semantic, accessible web interfaces with HTML, CSS, and Git.', skills: ['html', 'css', 'git'], level: 'beginner', hours: 24, credits: 2, modules: ['Semantic HTML', 'Responsive CSS', 'Version control'] },
  { code: 'JS-201', title: 'JavaScript for Product Teams', summary: 'Move from fundamentals to asynchronous JavaScript, APIs, and practical problem solving.', skills: ['javascript', 'git'], level: 'intermediate', hours: 36, credits: 3, modules: ['ES modules', 'Async data', 'Testing fundamentals'] },
  { code: 'REACT-301', title: 'React Application Studio', summary: 'Plan, build, and ship a production-quality React application.', skills: ['react', 'javascript'], level: 'advanced', hours: 42, credits: 4, modules: ['State design', 'Routing', 'Performance'] },
  { code: 'DATA-210', title: 'Python and SQL for Data', summary: 'Use Python and SQL to clean, analyse, and communicate data responsibly.', skills: ['python', 'sql'], level: 'intermediate', hours: 40, credits: 4, modules: ['Data wrangling', 'SQL queries', 'Visual insights'] },
  { code: 'BACK-220', title: 'Backend Systems Essentials', summary: 'Create dependable APIs and data models with Node.js and MongoDB.', skills: ['nodejs', 'mongodb'], level: 'intermediate', hours: 38, credits: 4, modules: ['REST design', 'Data modelling', 'Security'] },
  { code: 'AI-315', title: 'Applied Machine Learning', summary: 'Develop a grounded ML workflow from data preparation to model evaluation.', skills: ['python', 'ml'], level: 'advanced', hours: 48, credits: 4, modules: ['Feature design', 'Model evaluation', 'Responsible AI'] },
];

const demoInternships = [
  { title: 'Frontend Engineering Internship', organization: 'Prashikshan Demo Partner', description: 'Contribute to accessible product interfaces with regular mentor feedback and weekly milestones.', skills: ['react', 'javascript', 'css'], location: 'Remote', mode: 'remote', durationWeeks: 12, stipend: 12000, credits: 4, capacity: 4, status: 'published', verified: true },
  { title: 'Data Analytics Internship', organization: 'Prashikshan Demo Partner', description: 'Support a data team with analysis notebooks, dashboards, and clear documentation.', skills: ['python', 'sql'], location: 'Bengaluru', mode: 'hybrid', durationWeeks: 16, stipend: 15000, credits: 6, capacity: 3, status: 'published', verified: true },
  { title: 'Backend API Internship', organization: 'Prashikshan Demo Partner', description: 'Design and improve API services with practical reviews from an engineering mentor.', skills: ['nodejs', 'mongodb', 'git'], location: 'Remote', mode: 'remote', durationWeeks: 12, stipend: 14000, credits: 4, capacity: 2, status: 'published', verified: true },
];

async function seedIfEnabled() {
  const enabled = process.env.SEED_DEMO_DATA === 'true' || (process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_DATA !== 'false');
  if (!enabled) return;
  if (await Course.countDocuments() === 0) await Course.insertMany(courses);
  if (await Internship.countDocuments() === 0) await Internship.insertMany(demoInternships.map((item) => ({ ...item, deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45) })));
}

module.exports = { seedIfEnabled };
