const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(
    (book) => book.author === author
  );
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(
    (book) => book.title === title
  );
  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book reviews
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Get ISBN from URL
  const book = books[isbn]; // Find book by ISBN

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.status(200).send(book.reviews); // Send reviews if available
    } else {
      res.status(404).json({ message: "No reviews for this book" }); // No reviews found
    }
  } else {
    res.status(404).json({ message: "Book not found" }); // Book not found
  }
});

// Import Axios
const axios = require('axios');

// URL of your API endpoint (adjust the endpoint based on your server URL)
const API_URL = 'http://localhost:5000/';

// Function to get the list of books
async function getBooks() {
  try {
    const response = await axios.get(`${API_URL}`); // Assuming `/` is the endpoint for getting books
    console.log('Books List:', response.data);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

// Call the function to fetch books
getBooks();

// Function to get book details based on ISBN
async function getBookDetailsByISBN(isbn) {
  try {
    const response = await axios.get(`${API_URL}isbn/${isbn}`);  // API endpoint for fetching book by ISBN
    console.log('Book Details:', response.data);
  } catch (error) {
    console.error('Error fetching book details:', error);
  }
}

// Call the function to get details of a specific book by ISBN
getBookDetailsByISBN('1');  // Replace '1' with the ISBN you want to test

// Function to get book details based on Author
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${API_URL}author/${author}`);  // API endpoint for fetching books by author
    console.log('Books by Author:', response.data);
  } catch (error) {
    console.error('Error fetching books by author:', error);
  }
}

// Call the function to get books by author
getBooksByAuthor('Chinua Achebe');  // Replace with the author's name you want to test



// Function to get book details based on Title
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${API_URL}title/${title}`);  // API endpoint for fetching books by title
    console.log('Books by Title:', response.data);
  } catch (error) {
    console.error('Error fetching books by title:', error);
  }
}

// Call the function to get books by title
getBooksByTitle('Things Fall Apart');  // Replace with the book title you want to test


module.exports.general = public_users;
