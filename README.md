# Constrained N-Queen Puzzle Solver


A full-stack web application that solves a unique and challenging variation of the classic N-Queens puzzle. In addition to the standard rules, this version introduces a randomly generated board with colored regions, where each region must contain exactly one queen.

---

## 📋 Features

* **Dynamic Board Generation:** Starts with a randomly generated board size (`n x n`) and `n` unique color regions.
* **Complex Constraint Solving:** Solves the puzzle ensuring two constraints are met:
    1.  No two queens can attack each other.
    2.  Each colored region contains exactly one queen.
* **Interactive Visualization:** A clean, responsive frontend built with React.js allows users to see the initial board with the colored regions, and the final placement of the queens.

---

## 🛠️ Tech Stack & Core Algorithms

* **Frontend:** React.js, JavaScript, HTML/CSS
* **Backend:** C++
* **Core Algorithms:**
    * Recursive Backtracking
    * Breadth-First Search (BFS) Floodfill

---

## ⚙️ How It Works

The backend generates and solves the puzzle in a three-step process:

1.  **Board Initialization:** The process begins by choosing a random integer `n` (between 4 and 10) to define the `n x n` board size.

2.  **Finding a Valid Solution:** The C++ backend uses a **recursive backtracking algorithm** to find all possible solutions to the classic N-Queens problem for the generated board size. From this complete list of solutions, it randomly selects one valid queen placement.

3.  **Generating Color Regions (BFS Floodfill):** With the `n` queens now placed on the board from the selected solution, the unique color regions are generated. The algorithm initiates a **BFS (Floodfill)** starting from each of the `n` queen positions. Each floodfill expands outwards, assigning a unique color to any uncolored cell it encounters, until the entire board is colored. This method guarantees that each queen resides within its own distinct color region.

---

## 🚀 Getting Started

This project has three main parts: the C++ backend engine, the Node.js API server, and the React frontend.

### Prerequisites

* Node.js and npm
* A C++ compiler, such as `g++`

### Installation & Setup

You will need to set up all three parts of the application.

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/shrmaanubhav/N-Queen-s-Game.git](https://github.com/shrmaanubhav/N-Queen-s-Game.git)
    cd N-Queen-s-Game
    ```

2.  **Setup the Backend Engine (C++):**
    This step compiles your C++ code into an executable that the server can run.
    ```sh
    cd backend
    g++ -std=c++17 generate_board.cpp validate_solution.cpp -o n_queen_solver
    ```

3.  **Setup the API Server (Node.js):**
    This server handles requests from the frontend and runs the C++ backend.
    ```sh
    cd ../server 
    npm install 
    ```

4.  **Setup the Frontend (React):**
    ```sh
    cd ../frontend
    npm install
    ```

### Running the Application

You will need two separate terminal windows running simultaneously.

1.  **Terminal 1: Start the API Server**
    ```sh
    cd server
    node server.js 
    ```
    This server will listen for requests from the React app.

2.  **Terminal 2: Start the Frontend**
    ```sh
    cd frontend
    npm start
    ```
    This will open the application in your browser at [http://localhost:3000](http://localhost:3000).

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---


Anubhav Sharma - [LinkedIn](https://www.linkedin.com/in/anubhav-sharma-283765327) - [GitHub](https://github.com/shrmaanubhav)

Project Link: [https://github.com/shrmaanubhav/N-Queen-s-Game](https://github.com/shrmaanubhav/N-Queen-s-Game)
