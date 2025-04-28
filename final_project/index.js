const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Add your session middleware for JWT verification only to protected routes if needed
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
    req.user = user; // Attach the user to the request object
    next(); // Continue to the next middleware or route handler
  });
};

const PORT = 5000;

app.use("/customer", customer_routes); // For customer-related routes like login
app.use("/", genl_routes); // For general routes accessible to everyone

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
