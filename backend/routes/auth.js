const express = require("express");
const crypto = require("crypto");

const router = express.Router();


// =============================================
// TEMPORARY AUTHENTICATION STORE
// =============================================

const activeTokens = new Set();


// =============================================
// LOGIN
// =============================================

router.post("/login", (req, res) => {

  try {

    const { password } = req.body;


    if (!password) {

      return res.status(400).json({
        message: "Password is required."
      });

    }


    const correctPassword =
      process.env.DASHBOARD_PASSWORD;


    if (!correctPassword) {

      console.error(
        "DASHBOARD_PASSWORD is not configured in .env"
      );

      return res.status(500).json({
        message: "Authentication is not configured."
      });

    }


    // Check password
    if (password !== correctPassword) {

      return res.status(401).json({
        message: "Invalid password."
      });

    }


    // Generate a random authentication token
    const token =
      crypto.randomBytes(32).toString("hex");


    activeTokens.add(token);


    res.json({

      message:
        "Authentication successful.",

      token

    });


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message: "Login failed."
    });

  }

});


// =============================================
// VERIFY TOKEN
// =============================================

router.get("/verify", (req, res) => {

  const authHeader =
    req.headers.authorization;


  if (!authHeader) {

    return res.status(401).json({
      authenticated: false
    });

  }


  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );


  if (!activeTokens.has(token)) {

    return res.status(401).json({
      authenticated: false
    });

  }


  res.json({
    authenticated: true
  });

});


// =============================================
// LOGOUT
// =============================================

router.post("/logout", (req, res) => {

  const authHeader =
    req.headers.authorization;


  if (authHeader) {

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    activeTokens.delete(token);

  }


  res.json({
    message:
      "Logged out successfully."
  });

});


module.exports = {
  router,
  activeTokens
};