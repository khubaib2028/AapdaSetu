const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const db = require("../config/db");


// =============================================
// PHOTO STORAGE
// =============================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      path.join(__dirname, "../uploads")
    );

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName +
      path.extname(file.originalname)
    );

  }

});

const upload = multer({
  storage
});


// =============================================
// CREATE RECOVERY REPORT
// =============================================

router.post(
  "/",
  upload.single("photo"),
  async (req, res) => {

    try {

      const {
        name,
        phone,
        disaster_type,

        house_damage,
        road_damage,
        electricity,
        water_supply,
        agriculture_damage,

        families_affected,
        financial_loss,

        people_affected,

        damage_description,
        immediate_needs,

        latitude,
        longitude

      } = req.body;


      // =========================================
      // VALIDATION
      // =========================================

      if (
        !name ||
        !phone ||
        !disaster_type ||
        !damage_description
      ) {

        return res.status(400).json({

          message:
            "Name, phone, disaster type and damage description are required."

        });

      }


      // =========================================
      // BUILD DAMAGE TYPE
      // =========================================

      const damageParts = [];


      if (house_damage) {

        damageParts.push(
          `House: ${house_damage}`
        );

      }


      if (road_damage) {

        damageParts.push(
          `Road: ${road_damage}`
        );

      }


      if (electricity) {

        damageParts.push(
          `Electricity: ${electricity}`
        );

      }


      if (water_supply) {

        damageParts.push(
          `Water Supply: ${water_supply}`
        );

      }


      if (agriculture_damage) {

        damageParts.push(
          `Agriculture: ${agriculture_damage}`
        );

      }


      const damageType =
        damageParts.length > 0
          ? damageParts.join(" | ")
          : "General Damage";


      // =========================================
      // BUILD COMPLETE DESCRIPTION
      // =========================================

      const detailedDescription = `

${damage_description}

Damage Assessment:
House / Building: ${house_damage || "Not specified"}
Road: ${road_damage || "Not specified"}
Electricity: ${electricity || "Not specified"}
Water Supply: ${water_supply || "Not specified"}
Agriculture: ${agriculture_damage || "Not specified"}
Families Affected: ${families_affected || 0}
Estimated Financial Loss: ₹${financial_loss || 0}

`.trim();


      // =========================================
      // PHOTO PATH
      // =========================================

      const photoPath = req.file
        ? `uploads/${req.file.filename}`
        : null;


      // =========================================
      // INSERT INTO DATABASE
      // =========================================

      const [result] = await db.execute(

        `
        INSERT INTO recovery_reports
        (
          name,
          phone,
          disaster_type,
          damage_type,
          damage_description,
          people_affected,
          immediate_needs,
          latitude,
          longitude,
          photo_path
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,

        [

          name,

          phone,

          disaster_type,

          damageType,

          detailedDescription,

          Number(
            people_affected
          ) || 0,

          immediate_needs ||
            null,

          latitude ||
            null,

          longitude ||
            null,

          photoPath

        ]

      );


      // =========================================
      // SUCCESS
      // =========================================

      res.status(201).json({

        message:
          "Recovery report submitted successfully.",

        reportId:
          result.insertId

      });


    } catch (error) {

      console.error(
        "Recovery report error:",
        error
      );


      res.status(500).json({

        message:
          "Failed to submit recovery report."

      });

    }

  }
);


// =============================================
// GET ALL RECOVERY REPORTS
// =============================================

router.get(
  "/",
  async (req, res) => {

    try {

      const [rows] = await db.execute(

        `
        SELECT *
        FROM recovery_reports
        ORDER BY created_at DESC
        `

      );


      res.json(rows);


    } catch (error) {

      console.error(
        "Fetch recovery reports error:",
        error
      );


      res.status(500).json({

        message:
          "Failed to fetch recovery reports."

      });

    }

  }
);


// =============================================
// UPDATE RECOVERY STATUS
// =============================================

router.put(
  "/:id/status",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {
        recovery_status
      } = req.body;


      if (!recovery_status) {

        return res.status(400).json({

          message:
            "Recovery status is required."

        });

      }


      const [result] = await db.execute(

        `
        UPDATE recovery_reports

        SET recovery_status = ?

        WHERE id = ?
        `,

        [
          recovery_status,
          id
        ]

      );


      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({

          message:
            "Recovery report not found."

        });

      }


      res.json({

        message:
          "Recovery status updated successfully."

      });


    } catch (error) {

      console.error(
        "Update recovery status error:",
        error
      );


      res.status(500).json({

        message:
          "Failed to update recovery status."

      });

    }

  }
);


module.exports = router;