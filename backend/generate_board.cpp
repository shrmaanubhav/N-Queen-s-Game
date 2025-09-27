#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
  bool is_safe(vector<string> &board, int row, int col, int n) {
    for (int i = 0; i < n; i++) {
      if (board[row][i] == 'Q' || board[i][col] == 'Q')
        return false;
    }
    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] == 'Q')
        return false;
    }
    for (int i = row, j = col; i >= 0 && j < n; i--, j++) {
      if (board[i][j] == 'Q')
        return false;
    }
    return true;
  }

  void queen(vector<string> &board, int row, int n,
             vector<vector<string>> &ans) {
    if (row == n) {
      ans.push_back(board);
      return;
    }
    for (int i = 0; i < n; i++) {
      if (is_safe(board, row, i, n)) {
        board[row][i] = 'Q';
        queen(board, row + 1, n, ans);
        board[row][i] = '.';
      }
    }
  }

  vector<vector<string>> solveNQueens(int n) {
    vector<string> board(n, string(n, '.'));
    vector<vector<string>> ans;
    queen(board, 0, n, ans);
    return ans;
  }
};

void assignColorRegions(int n, const vector<string> &board,
                        vector<vector<int>> &color) {
  vector<pair<int, int>> queens;
  color = vector<vector<int>>(n, vector<int>(n, -1));
  vector<vector<bool>> visited(n, vector<bool>(n, false));

  for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
      if (board[i][j] == 'Q')
        queens.emplace_back(i, j);

  vector<pair<int, int>> dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
  mt19937 rng(std::random_device{}());

  for (int id = 0; id < n; id++) {
    int filled = 0;
    queue<pair<int, int>> q;
    auto [sx, sy] = queens[id];
    q.push({sx, sy});
    visited[sx][sy] = true;
    color[sx][sy] = id;
    filled++;

    while (!q.empty() && filled < (n * n) / n + 1) {
      auto [x, y] = q.front();
      q.pop();
      shuffle(dirs.begin(), dirs.end(), rng);
      for (auto [dx, dy] : dirs) {
        int nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < n && ny >= 0 && ny < n && !visited[nx][ny] &&
            color[nx][ny] == -1) {
          visited[nx][ny] = true;
          color[nx][ny] = id;
          q.push({nx, ny});
          filled++;
          if (filled >= (n * n) / n + 1)
            break;
        }
      }
    }
  }

  for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
      if (color[i][j] == -1) {
        if (i == 0 && j == 0) {
          if (color[0][1] != -1)
            color[0][0] = color[0][1];
          else if (color[1][0] != -1)
            color[0][0] = color[1][0];
          else
            color[0][0] = 0;
        } else if (j > 0) {
          color[i][j] = color[i][j - 1];
        } else if (i > 0) {
          color[i][j] = color[i - 1][j];
        }
      }
}

void printBoard(const vector<string> &board) {
  for (auto &row : board)
    cout << row << "\n";
  cout << "\n";
}

void printColorGrid(const vector<vector<int>> &color) {
  for (auto &row : color) {
    for (auto cell : row)
      cout << setw(2) << cell << " ";
    cout << "\n";
  }
  cout << "\n";
}

int main() {
  srand(time(0));
  int n = 4 + rand() % 5;

  Solution solver;
  vector<vector<string>> solutions = solver.solveNQueens(n);
  if (solutions.empty()) {
    cout << R"({"error": "No solutions exist"})" << endl;
    return 0;
  }

  vector<string> one_solution = solutions[rand() % solutions.size()];
  vector<vector<int>> color;
  assignColorRegions(n, one_solution, color);

  // Output JSON
  cout << "{\n";

  cout << "\"size\": " << n << ",\n";

  cout << R"("board": [)";
  for (int i = 0; i < n; i++) {
    cout << "\"" << one_solution[i] << "\"";
    if (i != n - 1)
      cout << ", ";
  }
  cout << "],\n";

  cout << R"("color": [)";
  for (int i = 0; i < n; i++) {
    cout << "[";
    for (int j = 0; j < n; j++) {
      cout << color[i][j];
      if (j != n - 1)
        cout << ", ";
    }
    cout << "]";
    if (i != n - 1)
      cout << ", ";
  }
  cout << "]\n";

  cout << "}" << endl;

  return 0;
}
