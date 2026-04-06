# Requirements Document

## Introduction

Prashikshan is a student training and internship platform. The frontend is a React single-page application that serves two types of users: Students and Industry partners. Students can register, log in, view their dashboard, browse courses, and explore internship opportunities. Industry partners can log in and view a separate dashboard to manage or browse student profiles. The frontend communicates with a Node/Express backend via a REST API.

## Glossary

- **Prashikshan**: The name of the platform (means "training" in Marathi/Hindi)
- **Student**: A registered user who browses courses and internships
- **Industry User**: A company or recruiter who logs in to view student profiles or post opportunities
- **Dashboard**: The personalized home screen shown after login, specific to the user's role
- **Onboarding**: The process of a new student submitting their profile (name, email, skills, interests, level)
- **API**: The backend REST API running at `http://localhost:5000`
- **Route**: A URL path in the React app mapped to a specific page component
- **Student Model**: The backend data schema with fields: name, email, skills, interests, level

---

## Requirements

### Requirement 1 — Home Page

**User Story:** As a visitor, I want to see a welcoming home page, so that I understand what Prashikshan offers and can navigate to login or registration.

#### Acceptance Criteria

1. THE Home Page SHALL display the platform name "Prashikshan" and a brief description of the platform's purpose.
2. THE Home Page SHALL provide a navigation link to the Login page.
3. WHEN a visitor clicks the login link, THE Application SHALL navigate the visitor to the `/login` route.

---

### Requirement 2 — Login Page

**User Story:** As a registered user, I want to log in with my email, password, and role, so that I am directed to the correct dashboard for my role.

#### Acceptance Criteria

1. THE Login Page SHALL display input fields for email, password, and a role selector with options "Student" and "Industry".
2. WHEN a user submits the login form with role "Student", THE Application SHALL navigate the user to the `/dashboard` route.
3. WHEN a user submits the login form with role "Industry", THE Application SHALL navigate the user to the `/industry-dashboard` route.
4. IF a user submits the login form with an empty email or password field, THEN THE Login Page SHALL display a validation message indicating the missing field.

---

### Requirement 3 — Student Onboarding / Registration

**User Story:** As a new student, I want to register by submitting my profile details, so that my information is saved and I can access the platform.

#### Acceptance Criteria

1. THE Registration Page SHALL display input fields for name, email, skills (comma-separated or tag input), interests (comma-separated or tag input), and a level selector with options "beginner", "intermediate", and "advanced".
2. WHEN a student submits the registration form with all required fields, THE Application SHALL send a POST request to `/api/students/add` with the student data.
3. WHEN the API returns a success response, THE Application SHALL navigate the student to the `/dashboard` route.
4. IF the API returns an error response, THEN THE Registration Page SHALL display an error message to the student.
5. IF a student submits the form with any required field empty, THEN THE Registration Page SHALL display a validation message for each missing field.

---

### Requirement 4 — Student Dashboard

**User Story:** As a logged-in student, I want to see my personalized dashboard, so that I can access courses, internships, and my profile at a glance.

#### Acceptance Criteria

1. THE Student Dashboard SHALL display a welcome message and navigation links to the Courses and Internships pages.
2. THE Student Dashboard SHALL display the student's name and skill level when profile data is available in application state.
3. WHEN a student clicks the Courses link, THE Application SHALL navigate the student to the `/courses` route.
4. WHEN a student clicks the Internships link, THE Application SHALL navigate the student to the `/internships` route.

---

### Requirement 5 — Courses Page

**User Story:** As a student, I want to browse available courses, so that I can find learning opportunities relevant to my skills and interests.

#### Acceptance Criteria

1. THE Courses Page SHALL display a list of course cards, each showing a course title, description, and skill level tag.
2. THE Courses Page SHALL display a static or API-driven list of at least 3 sample courses.
3. WHEN no courses are available, THE Courses Page SHALL display a message indicating no courses are currently listed.

---

### Requirement 6 — Internships Page

**User Story:** As a student, I want to browse available internships, so that I can find opportunities that match my profile.

#### Acceptance Criteria

1. THE Internships Page SHALL display a list of internship cards, each showing a company name, role title, and required skills.
2. THE Internships Page SHALL display a static or API-driven list of at least 3 sample internships.
3. WHEN no internships are available, THE Internships Page SHALL display a message indicating no internships are currently listed.

---

### Requirement 7 — Industry Dashboard

**User Story:** As an industry user, I want to see a dashboard after login, so that I can view student profiles or manage opportunities.

#### Acceptance Criteria

1. THE Industry Dashboard SHALL display a heading identifying it as the Industry Partner view.
2. THE Industry Dashboard SHALL display a list of registered students fetched from the `/api/students` endpoint.
3. WHEN the API returns student data, THE Industry Dashboard SHALL render each student's name, email, skills, and level.
4. IF the API returns an error, THEN THE Industry Dashboard SHALL display an error message to the industry user.

---

### Requirement 8 — Navigation & Routing

**User Story:** As a user, I want consistent navigation across the app, so that I can move between pages without losing context.

#### Acceptance Criteria

1. THE Application SHALL use React Router to manage client-side routing for all defined routes: `/`, `/login`, `/register`, `/dashboard`, `/courses`, `/internships`, and `/industry-dashboard`.
2. THE Application SHALL render a shared navigation bar on all pages that includes links appropriate to the current user's role.
3. WHEN a user navigates to an undefined route, THE Application SHALL display a 404 not-found message.
