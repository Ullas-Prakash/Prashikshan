import API from "./api";

export const getCourses = async () => {
  const res = await API.get("/courses");
  return res.data;
};