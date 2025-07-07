const imagekit = require("./imagekit"); // config file jisme API keys hain

const uploadImage = async (buffer, fileName, mimeType) => {
  const base64 = buffer.toString("base64"); // image ko base64 banaya
  const file = `data:${mimeType};base64,${base64}`; // image format ka prefix lagaya

  const response = await imagekit.upload({
    file, // base64 wali image
    fileName: `${Date.now()}-${fileName}`, // unique name
    folder: "/users/profileImages", // ImageKit me folder (optional)
  });

  return response.url; // ye URL aap DB me save karenge
};

module.exports = uploadImage;
