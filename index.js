const fs = require("fs");
const axios = require("axios");
const ytdl = require("ytdl-core");
/* 
  Multiple link youtube 
  Ex: ["https://www.youtube.com/watch?v=XqZsoesa55w"]
*/
const LINKS = require("./file_links.json");

const downloadVideo = async (videoUrl) => {
  //Get video info
  const videoInfo = await ytdl.getInfo(videoUrl);
  //Get video title
  const videoTitle = videoInfo.videoDetails.title;
  //Find hightest quality format with type 'mp4'
  const highestQualityFormat = videoInfo.formats
    .filter((format) => format.container === "mp4")
    .reduce((prev, current) => {
      if (!prev) return current;
      if (!current.qualityLabel) return prev;
      return prev.qualityLabel > current.qualityLabel ? prev : current;
    });

  const fileName = `${videoTitle}.mp4`;
  const file = fs.createWriteStream(`${__dirname}/videos/${fileName}`);

  //Download video
  await axios
    .get(highestQualityFormat.url, { responseType: "stream" })
    .then((response) => {
      response.data.pipe(file);
      console.log(`Video "${videoTitle}" downloaded successfully`);
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
};

const loadMultipleVideos = async () => {
  const promiseCreateVideos = LINKS.map((url) => downloadVideo(url));
  await Promise.all(promiseCreateVideos);
};

loadMultipleVideos();
