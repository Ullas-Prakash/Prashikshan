# Implementation Plan

- [x] 1. Set up StudentContext and update App.js routing


  - Create `src/context/StudentContext.js` with `student` state and `setStudent`
  - Wrap `App.js` with `StudentContextProvider`
  - Add `/register` route and `*` NotFound route to `App.js`
  - _Requirements: 3.1, 8.1_

- [ ] 2. Build shared Navbar component
- [x] 2.1 Create `src/components/Navbar.js`


  - Render brand link and conditional nav links based on StudentContext
  - Show Dashboard/Courses/Internships when student is set; Login/Register otherwise
  - _Requirements: 8.2_
- [-] 2.2 Add Navbar CSS in `src/components/Navbar.css`

  - Dark background, white links, flex layout
  - _Requirements: 8.2_

- [ ] 3. Implement Home page
  - Replace stub in `Home.js` with platform intro, tagline, and CTA buttons linking to `/login` and `/register`
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Implement Register (Student Onboarding) page
- [ ] 4.1 Create `src/pages/Register.js` with form fields
  - Fields: name, email, skills (comma-separated), interests (comma-separated), level selector
  - Client-side validation for all required fields before submit
  - _Requirements: 3.1, 3.5_
- [ ] 4.2 Wire Register form to API and context
  - On submit, split skills/interests strings into arrays and POST to `/api/students/add`
  - On success, call `setStudent` with response data and navigate to `/dashboard`
  - On error, display error banner above the form
  - _Requirements: 3.2, 3.3, 3.4_
- [ ] 4.3 Add `Register.css` for form styling
  - Reuse Login.css card pattern
  - _Requirements: 3.1_

- [ ] 5. Implement Login page validation
  - Add empty-field validation to existing `Login.js` before navigation
  - Display inline error messages for missing email or password
  - _Requirements: 2.4_

- [ ] 6. Implement Student Dashboard
  - Replace stub in `Dashboard.js` with welcome message, student name/level from context, and nav cards linking to `/courses` and `/internships`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Implement Courses page
  - Replace stub in `Courses.js` with a static array of 3+ course objects and render as cards
  - Show "No courses available" message when array is empty
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Implement Internships page
  - Replace stub in `Internships.js` with a static array of 3+ internship objects and render as cards
  - Show "No internships available" message when array is empty
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. Implement Industry Dashboard
- [ ] 9.1 Add GET /api/students route to backend `studentRoutes.js`
  - Add `router.get("/", ...)` that returns all students from MongoDB
  - _Requirements: 7.2_
- [ ] 9.2 Build Industry Dashboard UI in `IndustryDashboard.js`
  - Fetch students from `/api/students` on mount using `useEffect`
  - Render loading state, error state, and student cards (name, email, skills, level)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Add NotFound page
  - Create `src/pages/NotFound.js` with a 404 message and link back to `/`
  - _Requirements: 8.3_
