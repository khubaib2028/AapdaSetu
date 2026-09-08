const express = require("express");
const multer = require("multer");
const path = require("path");
const authenticate = require("../middleware/auth");

const db = require("../config/db");

const { calculateRisk } = require("../services/riskEngine");
const { recommendResources } = require("../services/resourceEngine");

const router = express.Router();


// ===============================
// MULTER PHOTO UPLOAD CONFIG
// ===============================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        if (file.mimetype.startsWith("image/")) {

            cb(null, true);

        } else {

            cb(new Error("Only image files are allowed."));

        }

    }

});


// ===============================
// GET ALL REPORTS
// ===============================

router.get("/", async (req, res) => {

    try {

        const [reports] = await db.query(`
            SELECT
                id,
                name,
                phone,
                disaster_type,
                description,
                people_affected,
                injured,
                children,
                elderly,
                water_level,
                needs,
                latitude,
                longitude,
                photo_path,
                risk_score,
                priority,
                risk_reason,
                recommended_resources,
                status,
                created_at
            FROM reports
            ORDER BY
                CASE
                    WHEN priority = 'CRITICAL' THEN 1
                    WHEN priority = 'HIGH' THEN 2
                    WHEN priority = 'MEDIUM' THEN 3
                    ELSE 4
                END,
                created_at DESC
        `);

        res.json(reports);

    } catch (error) {

        console.error(
            "❌ Error fetching reports:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message
        });

    }

});

// ===============================
// SOS
// ===============================

router.post("/sos", async (req, res) => {

    const {
        name,
        phone,
        latitude,
        longitude
    } = req.body;


    const sosData = {

        name: name || "SOS Citizen",

        phone: phone || "Not Provided",

        disaster_type: "SOS",

        description:
            "SOS activated by citizen. Immediate assistance required.",

        people_affected: 1,

        injured: 0,

        children: 0,

        elderly: 0,

        water_level: "",

        needs: "Rescue, Medical, Ambulance",

        latitude: latitude || null,

        longitude: longitude || null

    };


    const riskScore = 100;

    const priority = "CRITICAL";

    const riskReason =
        "SOS emergency activated. Immediate assistance required.";


    const recommendedResources = [

        "Immediate Response Team",

        "Rescue Team",

        "Ambulance",

        "Medical Team"

    ];


    const sql = `

        INSERT INTO reports

        (

            name,
            phone,
            disaster_type,
            description,
            people_affected,
            injured,
            children,
            elderly,
            water_level,
            needs,
            latitude,
            longitude,
            risk_score,
            priority,
            risk_reason,
            recommended_resources

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;


    const values = [

        sosData.name,

        sosData.phone,

        sosData.disaster_type,

        sosData.description,

        sosData.people_affected,

        sosData.injured,

        sosData.children,

        sosData.elderly,

        sosData.water_level,

        sosData.needs,

        sosData.latitude,

        sosData.longitude,

        riskScore,

        priority,

        riskReason,

        recommendedResources.join(", ")

    ];


    try {

        const [result] = await db.query(
            sql,
            values
        );


        console.log(
            "🚨 SOS ALERT RECEIVED"
        );

        console.log(
            "SOS Report ID:",
            result.insertId
        );

        console.log(
            "Location:",
            sosData.latitude,
            sosData.longitude
        );


        res.status(201).json({

            message:
                "SOS alert activated successfully 🚨",

            reportId:
                result.insertId,

            riskScore,

            priority,

            riskReason,

            recommendedResources

        });

    } catch (err) {

        console.error(
            "❌ Error saving SOS:",
            err.message
        );

        res.status(500).json({

            message:
                "Failed to save SOS alert",

            error:
                err.message

        });

    }

});


// ===============================
// NORMAL EMERGENCY REPORT
// ===============================

router.post(
    "/",
    upload.single("photo"),
    async (req, res) => {

        const {

            name,
            phone,
            disaster_type,
            description,
            people_affected,
            injured,
            children,
            elderly,
            water_level,
            needs,
            latitude,
            longitude

        } = req.body;


        // -------------------------------
        // VALIDATION
        // -------------------------------

        if (
            !name ||
            !phone ||
            !disaster_type ||
            !description
        ) {

            return res.status(400).json({

                message:
                    "Name, phone, disaster type and description are required."

            });

        }


        // -------------------------------
        // PREPARE DATA
        // -------------------------------

        const reportData = {

            name,

            phone,

            disaster_type,

            description,

            people_affected:
                Number(people_affected) || 0,

            injured:
                Number(injured) || 0,

            children:
                Number(children) || 0,

            elderly:
                Number(elderly) || 0,

            water_level:
                water_level || "",

            needs:
                needs || ""

        };


        // -------------------------------
        // RISK ENGINE
        // -------------------------------

        const riskResult =
            calculateRisk(reportData);


        // -------------------------------
        // RESOURCE ENGINE
        // -------------------------------

        const recommendedResources =
            recommendResources(
                reportData,
                riskResult
            );


        console.log(
            "🧠 Risk Analysis:"
        );

        console.log(
            "Risk Score:",
            riskResult.riskScore
        );

        console.log(
            "Priority:",
            riskResult.priority
        );

        console.log(
            "Reason:",
            riskResult.riskReason
        );


        console.log(
            "📦 Recommended Resources:"
        );

        console.log(
            recommendedResources
        );


        // -------------------------------
        // PHOTO PATH
        // -------------------------------

        const photoPath =
            req.file
                ? req.file.path
                : null;


        if (req.file) {

            console.log(
                "📷 Photo uploaded:",
                req.file.filename
            );

        } else {

            console.log(
                "📷 No photo uploaded"
            );

        }


        // -------------------------------
        // DATABASE INSERT
        // -------------------------------

        const sql = `

            INSERT INTO reports

            (

                name,
                phone,
                disaster_type,
                description,
                people_affected,
                injured,
                children,
                elderly,
                water_level,
                needs,
                latitude,
                longitude,
                photo_path,
                risk_score,
                priority,
                risk_reason,
                recommended_resources

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `;


        const values = [

            name,

            phone,

            disaster_type,

            description,

            reportData.people_affected,

            reportData.injured,

            reportData.children,

            reportData.elderly,

            reportData.water_level,

            reportData.needs,

            latitude || null,

            longitude || null,

            photoPath,

            riskResult.riskScore,

            riskResult.priority,

            riskResult.riskReason,

            recommendedResources.join(", ")

        ];


        try {

            const [result] = await db.query(
                sql,
                values
            );


            console.log(
                "✅ Report saved. ID:",
                result.insertId
            );


            res.status(201).json({

                message:
                    "Emergency report analyzed and saved successfully 🚨",

                reportId:
                    result.insertId,

                riskScore:
                    riskResult.riskScore,

                priority:
                    riskResult.priority,

                riskReason:
                    riskResult.riskReason,

                recommendedResources,

                photoUploaded:
                    !!req.file

            });

        } catch (err) {

            console.error(
                "❌ Error saving report:",
                err.message
            );

            res.status(500).json({

                message:
                    "Failed to save report",

                error:
                    err.message

            });

        }

    }

);


// =====================================
// UPDATE REPORT STATUS
// =====================================

router.put("/:id/status", authenticate, async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "Team Assigned",
        "In Progress",
        "Resolved"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message: "Invalid status"
        });

    }


    const sql = `
        UPDATE reports
        SET status = ?
        WHERE id = ?
    `;


    try {

        const [result] = await db.query(
            sql,
            [status, id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Report not found"
            });

        }


        console.log(
            `🔄 Report #${id} status changed to ${status}`
        );


        res.json({

            message:
                "Status updated successfully",

            reportId:
                id,

            status:
                status

        });

    } catch (err) {

        console.error(
            "❌ Error updating status:",
            err.message
        );

        res.status(500).json({

            message:
                "Failed to update status",

            error:
                err.message

        });

    }

});


module.exports = router;