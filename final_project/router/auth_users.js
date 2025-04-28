const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  return user !== undefined;
};

// Middleware to authenticate JWT and extract user information
const authenticateJWT = (req, res, next) => {
  const token =
    req.session.authorization?.accessToken ||
    req.headers["authorization"]?.split(" ")[1]; // Token from session or Authorization header

  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication" });
  }

  jwt.verify(token, "fingerprint_customer", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user; // Attach the user to the request
    next(); // Proceed to the next middleware or route handler
  });
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      { username: username },
      "fingerprint_customer",
      { expiresIn: "1h" }
    );

    req.session.authorization = { accessToken }; // Store token in session
    return res
      .status(200)
      .json({ message: "User logged in successfully", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review (protected route)
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const { review } = req.body;
  const { isbn } = req.params;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review; // Add or update the review
    return res
      .status(200)
      .json({ message: "Review added/updated successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// Optional: Delete a review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
