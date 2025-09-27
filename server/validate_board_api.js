const { spawn } = require("child_process");
const path = require("path");

module.exports = async function (req, res) {
  try {
    const { board, colors } = req.body;
    if (!board || !colors)
      return res.status(400).json({ error: "Board and colors are required" });

    const boardLines = board.map((row) => row.join(""));
    const allColors = colors.flat();
    const input = `${board.length}\n${boardLines.join("\n")}\n${allColors.join(
      " "
    )}\n`;

    const execPath = path.resolve(__dirname, "../backend/validate_solution");

    const child = spawn(execPath, [], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: path.dirname(execPath),
    });

    let stdout = "";
    child.stdout.on("data", (data) => (stdout += data.toString()));

    child.on("close", (code) => {
      if (code === 0 && stdout.trim()) {
        try {
          res.status(200).json(JSON.parse(stdout));
        } catch {
          res
            .status(500)
            .json({ error: "Invalid JSON response", output: stdout });
        }
      } else {
        res.status(500).json({ error: "Process failed", code });
      }
    });

    child.stdin.write(input);
    child.stdin.end();
  } catch (err) {
    res.status(500).json({ error: "Validation failed", details: err.message });
  }
};
