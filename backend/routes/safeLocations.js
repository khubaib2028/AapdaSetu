const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticate = require("../middleware/auth");


// =============================================
// GET AVAILABLE SAFE LOCATIONS
// =============================================

router.get("/", async (req, res) => {

  try {

    const [locations] = await db.query(`
      SELECT
        id,
        latitude,
        longitude,
        availability,
        created_at
      FROM safe_locations
      WHERE availability = 'Available'
      ORDER BY created_at DESC
    `);

    res.json(locations);

  } catch (error) {

    console.error(
      "Error fetching safe locations:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch safe locations"
    });

  }

});


// =============================================
// ADD SAFE LOCATION
// =============================================

router.post("/", authenticate, async (req, res) => {

  try {

    const {
      latitude,
      longitude,
      availability
    } = req.body;


    if (
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        message:
          "Latitude and longitude are required."
      });

    }


    const [result] = await db.query(
      `
      INSERT INTO safe_locations
      (
        latitude,
        longitude,
        availability
      )
      VALUES (?, ?, ?)
      `,
      [
        latitude,
        longitude,
        availability || "Available"
      ]
    );


    res.status(201).json({

      message:
        "Safe location added successfully.",

      locationId:
        result.insertId

    });

  } catch (error) {

    console.error(
      "Error adding safe location:",
      error
    );

    res.status(500).json({
      message: "Failed to add safe location"
    });

  }

});


// =============================================
// UPDATE SAFE LOCATION AVAILABILITY
// =============================================

router.put("/:id", authenticate, async (req, res) => {

  try {

    const {
      availability
    } = req.body;


    if (!availability) {

      return res.status(400).json({
        message:
          "Availability is required."
      });

    }


    const [result] = await db.query(
      `
      UPDATE safe_locations
      SET availability = ?
      WHERE id = ?
      `,
      [
        availability,
        req.params.id
      ]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message:
          "Safe location not found."
      });

    }


    res.json({

      message:
        "Safe location availability updated successfully."

    });

  } catch (error) {

    console.error(
      "Error updating safe location:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update safe location"
    });

  }

});


// =============================================
// DELETE SAFE LOCATION
// =============================================

router.delete("/:id", authenticate, async (req, res) => {

  try {

    const [result] = await db.query(
      `
      DELETE FROM safe_locations
      WHERE id = ?
      `,
      [req.params.id]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message:
          "Safe location not found."
      });

    }


    res.json({

      message:
        "Safe location removed successfully."

    });

  } catch (error) {

    console.error(
      "Error deleting safe location:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete safe location"
    });

  }

});


module.exports = router;