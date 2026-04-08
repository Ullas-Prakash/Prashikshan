const axios = require("axios");

const getCourses = async (skill) => {
    try {
        console.log("🔑 BACKEND KEY:", process.env.RAPID_API_KEY);

        const response = await axios.get(
            "https://youtube-search-and-download.p.rapidapi.com/search",
            {
                params: {
                    query: `${skill} tutorial`,
                    type: "video"
                },
                headers: {
                    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
                    "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com"
                }
            }
        );
        const contents = response.data.contents;

        console.log("📦 TOTAL ITEMS:", contents.length);

        const courses = [];

        for (let item of contents) {
            console.log("👉 ITEM STRUCTURE:", item);   // 🔥 IMPORTANT DEBUG

            if (item.video) {
                console.log("✅ FOUND VIDEO:", item.video.title);

                courses.push({
                    title: item.video.title,
                    url: `https://www.youtube.com/watch?v=${item.video.videoId}`
                });
            }
        }

        console.log("🎯 FINAL COURSES:", courses);

        return courses.slice(0, 5);

    } catch (error) {
        console.log("❌ ERROR:", error.response?.data || error.message);
        return [];
    }
};

module.exports = { getCourses };