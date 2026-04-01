import "./Internships.css";

const INTERNSHIPS = [
  { id: 1, company: "TechCorp", role: "Frontend Developer Intern", skills: ["React", "CSS", "JavaScript"] },
  { id: 2, company: "DataWorks", role: "Data Analyst Intern", skills: ["Python", "SQL", "Excel"] },
  { id: 3, company: "CloudBase", role: "Backend Developer Intern", skills: ["Node.js", "MongoDB", "REST APIs"] },
  { id: 4, company: "DesignHub", role: "UI/UX Design Intern", skills: ["Figma", "CSS", "User Research"] },
];

function Internships() {
  return (
    <div className="internships-container">
      <h2>Internship Opportunities</h2>
      {INTERNSHIPS.length === 0 ? (
        <p>No internships available at the moment.</p>
      ) : (
        <div className="internships-grid">
          {INTERNSHIPS.map((item) => (
            <div key={item.id} className="internship-card">
              <h3>{item.role}</h3>
              <p className="company-name">🏢 {item.company}</p>
              <div className="skills-list">
                {item.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Internships;
