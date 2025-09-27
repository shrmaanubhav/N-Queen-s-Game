const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const generateBoardAPI = require("./generate_board_api");
const validateBoardAPI = require("./validate_board_api");

app.post("/api/generate", generateBoardAPI);
app.post("/api/validate", validateBoardAPI);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
