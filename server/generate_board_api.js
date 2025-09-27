const { execFile } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execFileAsync = promisify(execFile);

module.exports = async function (req, res) {
  try {
    const execPath = path.resolve(__dirname, "../backend/generate_board");
    const { stdout } = await execFileAsync(execPath);
    const data = JSON.parse(stdout);
    res.status(200).json(data);
  } catch (err) {
    console.error("generate_board error:", err);
    res.status(500).json({
      error: "Failed to generate board",
      details: err.message,
    });
  }
};
