#include <bits/stdc++.h>
using namespace std;

class Validator {
public:
  bool is_safe_for_user(const vector<string> &board, int row, int col, int n) {
    for (int i = 0; i < n; i++) {
      if (i != col && board[row][i] == 'Q')
        return false;
    }

    for (int i = 0; i < n; i++) {
      if (i != row && board[i][col] == 'Q')
        return false;
    }

    for (int i = -n; i < n; i++) {
      int r1 = row + i, c1 = col + i;
      if (r1 >= 0 && r1 < n && c1 >= 0 && c1 < n && !(r1 == row && c1 == col))
        if (board[r1][c1] == 'Q')
          return false;

      int r2 = row + i, c2 = col - i;
      if (r2 >= 0 && r2 < n && c2 >= 0 && c2 < n && !(r2 == row && c2 == col))
        if (board[r2][c2] == 'Q')
          return false;
    }
    return true;
  }

  pair<bool, string> validateBoard(const vector<string> &board,
                                   const vector<vector<int>> &color) {
    int n = board.size();
    set<int> used_colors;
    int queen_count = 0;

    for (int row = 0; row < n; row++) {
      for (int col = 0; col < n; col++) {
        if (board[row][col] == 'Q') {
          queen_count++;

          if (!is_safe_for_user(board, row, col, n))
            return {false, "Queen placement violates N-Queens rules!"};

          int color_id = color[row][col];
          if (used_colors.count(color_id))
            return {false, "Two queens in the same color region!"};

          used_colors.insert(color_id);
        }
      }
    }

    if (queen_count == 0) {
      return {true, "No queens placed yet."};
    } else if (queen_count == n) {
      return {true, "Congratulations! Complete valid solution!"};
    } else {
      return {true, "Valid so far. Place " + to_string(n - queen_count) +
                        " more queens."};
    }
  }
};

int main() {
  int n;
  cin >> n;

  vector<string> board(n);
  for (int i = 0; i < n; i++) {
    cin >> board[i];
  }

  vector<vector<int>> color(n, vector<int>(n));
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
      cin >> color[i][j];
    }
  }

  Validator v;
  auto [valid, message] = v.validateBoard(board, color);

  cout << "{\n";
  cout << "  \"valid\": " << (valid ? "true" : "false") << ",\n";
  cout << "  \"message\": \"" << message << "\"\n";
  cout << "}\n";

  return 0;
}