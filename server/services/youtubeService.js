const axios = require("axios");

const getCourses = async (skill, level) => {
  try {
    console.log("🔍 Searching:", skill, level);

    const response = await axios.get(
      "https://youtube-search-and-download.p.rapidapi.com/search",
      {
        params: {
          query: `${skill} ${level} tutorial`,
          type: "video"
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com"
        }
      }
    );

    if (!response.data.contents) return [];

    return response.data.contents
      .filter(item => item.video)
      .slice(0, 5)
      .map(item => ({
        title: item.video.title,
        url: `https://www.youtube.com/watch?v=${item.video.videoId}`,
        thumbnail: item.video.thumbnails?.[0]?.url || ""
      }));

  } catch (error) {
    console.log("❌ YouTube API ERROR:", error.response?.data || error.message);
    return [];
  }
};

module.exports = { getCourses };