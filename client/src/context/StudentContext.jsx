import { createContext, useContext, useState } from "react";

const StudentContext = createContext(null);

export function StudentContextProvider({ children }) {
  const [student, setStudent] = useState(null);
  return (
    <StudentContext.Provider value={{ student, setStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  return useContext(StudentContext);
}
