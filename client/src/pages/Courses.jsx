import "./Courses.css";

const COURSES = [
  { id: 1, title: "React Fundamentals", description: "Learn the basics of React including components, state, and props.", level: "beginner" },
  { id: 2, title: "Node.js & Express API", description: "Build RESTful APIs with Node.js, Express, and MongoDB.", level: "intermediate" },
  { id: 3, title: "Full Stack Development", description: "End-to-end web development with React, Node, and deployment.", level: "advanced" },
  { id: 4, title: "JavaScript ES6+", description: "Modern JavaScript features: arrow functions, promises, async/await.", level: "beginner" },
];

function Courses() {
  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      {COURSES.length === 0 ? (
        <p>No courses available at the moment.</p>
      ) : (
        <div className="courses-grid">
          {COURSES.map((course) => (
            <div key={course.id} className="course-card">
              <span className={`level-tag ${course.level}`}>{course.level}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
