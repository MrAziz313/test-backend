const multer = require("multer");

const storage = multer.memoryStorage(); // we will use in-memory buffer
const upload = multer({ storage });

module.exports = upload;
