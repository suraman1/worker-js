require("dotenv").config();
const express = require("express");
const router = require("./routes");
const { consumer } = require("./worker");

const PORT = process.env.PORT || 3500;

const app = express();

app.use(router);

consumer().catch((e) => console.log(`Unexpected error ocurred ${e}`));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
