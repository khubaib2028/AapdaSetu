const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const reportsRoutes = require("./routes/reports");
const alertsRoutes = require("./routes/alerts");
const safeLocationsRoutes = require("./routes/safeLocations");
const recoveryRoutes = require("./routes/recovery");
const authRoutes = require("./routes/auth");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Serve uploaded images
app.use("/uploads",express.static(path.join(__dirname, "uploads")));


// Reports routes
app.use("/api/reports", reportsRoutes);


// Alerts routes
app.use("/api/alerts", alertsRoutes);

// Safe location routes
app.use("/api/safe-locations",safeLocationsRoutes);

// Recovery routes
app.use("/api/recovery", recoveryRoutes);

// Authentic routes
app.use("/api/auth", authRoutes.router);



// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AapdaSetu Backend is running 🚨"
  });
});


// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `AapdaSetu server running on http://localhost:${PORT}`
  );
});