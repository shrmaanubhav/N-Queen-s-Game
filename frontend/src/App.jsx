"use client";

import React, { useState, useEffect, useMemo } from "react";

const API_BASE_URL = "http://localhost:5000";

// helper function to fetch api
async function fetchApi(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server responded with status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`API call to ${API_BASE_URL}${url} failed:`, error);
    throw error;
  }
}

// gets the initial board
const getBoardConfig = () => {
  console.log("API: Calling backend to generate board...");
  return fetchApi("/api/generate", { method: "POST" });
};

const validateQueenPlacement = (queens, newQueen, boardConfig) => {
  const allQueens = [...queens, newQueen];
  const boardArray = Array(boardConfig.size)
    .fill(null)
    .map(() => Array(boardConfig.size).fill("."));
  allQueens.forEach((q) => {
    if (q.row < boardConfig.size && q.col < boardConfig.size) {
      boardArray[q.row][q.col] = "Q";
    }
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // This sligns the datatype with backend
    body: JSON.stringify({
      board: boardArray, // Send a 2D array of characters
      colors: boardConfig.colorCodes, // Send with the key "colors"
    }),
  };

  return fetchApi("/api/validate", options);
};

// --- UI Components ---

const StyleLoader = () => {
  useEffect(() => {
    const tailwindScriptId = "tailwind-cdn-script";
    if (document.getElementById(tailwindScriptId)) return;

    const tailwindScript = document.createElement("script");
    tailwindScript.id = tailwindScriptId;
    tailwindScript.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(tailwindScript);

    const googleFontsLink = document.createElement("link");
    googleFontsLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    googleFontsLink.rel = "stylesheet";
    document.head.appendChild(googleFontsLink);

    const style = document.createElement("style");
    style.innerHTML = `body { font-family: 'Inter', sans-serif; }`;
    document.head.appendChild(style);
  }, []);
  return null;
};

const Button = ({ children, variant, ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variantClasses =
    variant === "outline"
      ? "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-800"
      : "bg-gray-900 text-white hover:bg-gray-800";
  return (
    <button className={`${baseClasses} ${variantClasses}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children }) => (
  <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm">
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, style, variant, className = "" }) => (
  <span
    style={style}
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
  >
    {children}
  </span>
);

const Loader2 = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// --- Helper Functions ---

function generateColors(n) {
  const predefinedColors = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Orange", value: "#F97316" },
    { name: "Pink", value: "#EC4899" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Lime", value: "#84CC16" },
  ];
  return predefinedColors
    .slice(0, n)
    .map((color, index) => ({ ...color, code: index }));
}

// --- Main Game Component ---

function NQueensBoard() {
  const [boardConfig, setBoardConfig] = useState(null);
  const [queens, setQueens] = useState([]);
  const [solutionQueens, setSolutionQueens] = useState([]); // State to hold the solution
  const [hoveredCell, setHoveredCell] = useState(null);
  const [flashingCells, setFlashingCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingMove, setValidatingMove] = useState(false);
  const [error, setError] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [winMessage, setWinMessage] = useState("Congratulations!"); // For custom win/reveal message

  const colors = useMemo(() => {
    if (!boardConfig) return [];
    return generateColors(boardConfig.size);
  }, [boardConfig]);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = await getBoardConfig();

        if (
          !config ||
          typeof config.size !== "number" ||
          !Array.isArray(config.color) ||
          !Array.isArray(config.board)
        ) {
          throw new Error(
            "Invalid board data from server. Expected 'size', 'board', and 'color' fields."
          );
        }

        // Parse and store the solution from the backend response
        const parsedSolution = [];
        config.board.forEach((rowString, r) => {
          for (let c = 0; c < rowString.length; c++) {
            if (rowString[c] === "Q") {
              parsedSolution.push({ row: r, col: c });
            }
          }
        });
        setSolutionQueens(parsedSolution);

        setBoardConfig({ size: config.size, colorCodes: config.color });
        setQueens([]);
        setIsGameComplete(false);
        setWinMessage("Congratulations!");
      } catch (err) {
        setError(
          err.message || "Failed to load game from server. Please try again."
        );
        console.error("Failed to initialize game:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeGame();
  }, []);

  useEffect(() => {
    if (boardConfig && queens.length === boardConfig.size) {
      setIsGameComplete(true);
    } else {
      setIsGameComplete(false);
    }
  }, [queens, boardConfig]);

  const flashCells = (cells) => {
    setFlashingCells(cells);
    setTimeout(() => setFlashingCells([]), 1000);
  };

  const handleCellClick = async (row, col) => {
    if (!boardConfig || validatingMove || isGameComplete) return;

    const existingQueenIndex = queens.findIndex(
      (q) => q.row === row && q.col === col
    );

    if (existingQueenIndex !== -1) {
      const newQueens = queens.filter(
        (_, index) => index !== existingQueenIndex
      );
      setQueens(newQueens);
      return;
    }

    try {
      setValidatingMove(true);
      setError(null);
      const newQueen = { row, col };
      const validation = await validateQueenPlacement(
        queens,
        newQueen,
        boardConfig
      );

      if (validation.valid) {
        const newQueens = [...queens, newQueen];
        setQueens(newQueens);
        if (newQueens.length === boardConfig.size) {
          setWinMessage("Congratulations! You solved it!");
        }
      } else {
        if (validation.conflictingPositions) {
          flashCells(validation.conflictingPositions);
        } else {
          flashCells([newQueen]);
        }
      }
    } catch (err) {
      console.error("Failed to validate move:", err);
      setError(err.message || "An unknown validation error occurred.");
    } finally {
      setValidatingMove(false);
    }
  };

  const revealSolution = () => {
    if (solutionQueens.length > 0) {
      setWinMessage("Here is the solution.");
      setQueens(solutionQueens);
    }
  };

  const isFlashing = (row, col) =>
    flashingCells.some((cell) => cell.row === row && cell.col === col);

  const getRemainingRegions = () => {
    if (!boardConfig) return [];
    const usedRegions = new Set(
      queens.map((queen) => boardConfig.colorCodes[queen.row][queen.col])
    );
    return colors.filter((color) => !usedRegions.has(color.code));
  };

  const resetBoard = () => {
    setQueens([]);
    setFlashingCells([]);
    setError(null);
    setIsGameComplete(false);
    setWinMessage("Congratulations!");
  };

  const getNewBoard = () => window.location.reload();

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Generating board from server...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !boardConfig) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-500 mb-4">
                {error || "Failed to load game board"}
              </p>
              <Button onClick={getNewBoard}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {boardConfig.size}×{boardConfig.size} Queens Placement
          </CardTitle>
          <p className="text-sm text-center text-gray-500">
            {boardConfig.size} colors for {boardConfig.size}×{boardConfig.size}{" "}
            board
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              onClick={resetBoard}
              variant="outline"
              disabled={validatingMove}
            >
              Reset
            </Button>
            <Button
              onClick={revealSolution}
              variant="outline"
              disabled={validatingMove}
            >
              Reveal Solution
            </Button>
            <Button
              onClick={getNewBoard}
              variant="outline"
              disabled={validatingMove}
            >
              New Board
            </Button>
            {validatingMove && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating move...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              {isGameComplete && (
                <div className="absolute inset-0 bg-white bg-opacity-0 flex flex-col items-center justify-center rounded-md z-10">
                  <h2 className="text-3xl font-bold text-black mb-4">
                    {winMessage}
                  </h2>
                  <p className="text-black mb-6">
                    You can start a new game or reset the board.
                  </p>
                  <Button onClick={getNewBoard}>Play Again</Button>
                </div>
              )}
              <div
                className="grid gap-1 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${boardConfig.size}, 1fr)`,
                  maxWidth: "500px",
                }}
              >
                {Array.from(
                  { length: boardConfig.size * boardConfig.size },
                  (_, i) => {
                    const row = Math.floor(i / boardConfig.size);
                    const col = i % boardConfig.size;
                    const hasQueen = queens.some(
                      (q) => q.row === row && q.col === col
                    );
                    const colorCode = boardConfig.colorCodes[row][col];
                    const color = colors[colorCode] || colors[0];
                    const flashing = isFlashing(row, col);

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`
                        aspect-square flex items-center justify-center text-3xl font-bold cursor-pointer
                        border-2 transition-all duration-200 select-none rounded-md
                        ${
                          flashing
                            ? "border-red-500 bg-red-200 animate-pulse"
                            : "border-gray-300 hover:border-blue-400"
                        }
                        ${
                          validatingMove || isGameComplete
                            ? "cursor-wait opacity-75"
                            : "hover:scale-105"
                        }
                      `}
                        style={{
                          backgroundColor: flashing
                            ? undefined
                            : `${color.value}20`,
                          color: hasQueen ? "#000" : "transparent",
                        }}
                        onClick={() => handleCellClick(row, col)}
                        onMouseEnter={() =>
                          !validatingMove && setHoveredCell({ row, col })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {hasQueen && "♛"}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <div className="w-full md:w-64 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Color Regions ({colors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                  {colors.map((color) => (
                    <div key={color.code} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border flex-shrink-0"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm truncate">{color.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Queen Positions ({queens.length}/{boardConfig.size})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-48 overflow-y-auto">
                  {queens.length === 0 ? (
                    <p className="text-sm text-gray-500">No queens placed</p>
                  ) : (
                    <div className="space-y-1">
                      {queens.map((queen, index) => {
                        const colorCode =
                          boardConfig.colorCodes[queen.row][queen.col];
                        const color = colors[colorCode] || colors[0];
                        return (
                          <div key={index} className="text-sm">
                            Row {queen.row + 1}, Col {queen.col + 1}
                            <Badge
                              variant="outline"
                              className="ml-2"
                              style={{
                                backgroundColor: `${color.value}20`,
                                borderColor: color.value,
                              }}
                            >
                              {color.name}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Available Regions ({getRemainingRegions().length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getRemainingRegions().length === 0 ? (
                    <p className="text-sm text-gray-500">
                      All regions occupied
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {getRemainingRegions().map((color) => (
                        <Badge
                          key={color.code}
                          variant="outline"
                          style={{
                            backgroundColor: `${color.value}20`,
                            borderColor: color.value,
                          }}
                        >
                          {color.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Rules</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1 text-gray-600">
                  <p>• No queen attacks another (row, column, or diagonal).</p>
                  <p>• No two queens can be in the same color region.</p>
                  <p>• Click a cell to place or remove a queen.</p>
                  <p>• Goal: Place {boardConfig.size} queens successfully.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <main>
      <StyleLoader />
      <NQueensBoard />
    </main>
  );
}
