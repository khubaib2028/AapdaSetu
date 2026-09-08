const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticate = require("../middleware/auth");

// =====================================
// GET ACTIVE DISASTER ALERTS
// =====================================

router.get("/", async (req, res) => {

  try {

    const [alerts] = await db.query(
      `
      SELECT
        id,
        alert_type,
        area,
        severity,
        message,
        instructions,
        status,
        created_at
      FROM disaster_alerts
      WHERE status = 'ACTIVE'
      ORDER BY created_at DESC
      `
    );

    res.json(alerts);

  } catch (error) {

    console.error(
      "Error fetching disaster alerts:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch disaster alerts"
    });

  }

});


// =====================================
// CREATE NEW DISASTER ALERT
// =====================================

router.post("/", authenticate, async (req, res) => {

  try {

    const {
      alert_type,
      area,
      severity,
      message,
      instructions
    } = req.body;


    // Basic validation
    if (
      !alert_type ||
      !area ||
      !severity ||
      !message
    ) {

      return res.status(400).json({
        message:
          "Alert type, area, severity and message are required."
      });

    }


    // Insert alert into database
    const [result] = await db.query(
      `
      INSERT INTO disaster_alerts
      (
        alert_type,
        area,
        severity,
        message,
        instructions
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        alert_type,
        area,
        severity,
        message,
        instructions || ""
      ]
    );


    res.status(201).json({

      message:
        "Disaster alert created successfully.",

      alertId: result.insertId

    });

  } catch (error) {

    console.error(
      "Error creating disaster alert:",
      error
    );

    res.status(500).json({

      message:
        "Failed to create disaster alert"

    });

  }

});


module.exports = router;