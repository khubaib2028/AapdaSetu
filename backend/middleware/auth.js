const { activeTokens } = require("../routes/auth");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!activeTokens.has(token)) {
    return res.status(401).json({
      message: "Invalid or expired authentication token."
    });
  }

  next();
}

module.exports = authenticate;