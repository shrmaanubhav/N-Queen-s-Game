const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

const generateBoardAPI = require("./generate_board_api");
const validateBoardAPI = require("./validate_board_api");

app.post("/api/generate", generateBoardAPI);
app.post("/api/validate", validateBoardAPI);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
