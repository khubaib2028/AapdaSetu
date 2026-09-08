// AapdaSetu Risk Engine
// Local and explainable - no external API required

function calculateRisk(data) {

    let score = 0;
    let reasons = [];

    const people = Number(data.people_affected) || 0;
    const injured = Number(data.injured) || 0;
    const children = Number(data.children) || 0;
    const elderly = Number(data.elderly) || 0;

    const waterLevel = (data.water_level || "").toLowerCase();
    const disasterType = (data.disaster_type || "").toLowerCase();
    const description = (data.description || "").toLowerCase();


    // --------------------------------
    // 1. PEOPLE AFFECTED
    // --------------------------------

    if (people >= 10) {

        score += 20;

        reasons.push(
            "Large number of people affected"
        );

    } else if (people >= 5) {

        score += 15;

        reasons.push(
            "Multiple people affected"
        );

    } else if (people >= 2) {

        score += 10;

        reasons.push(
            "More than one person affected"
        );

    } else if (people === 1) {

        score += 5;

    }


    // --------------------------------
    // 2. INJURED PEOPLE
    // --------------------------------

    if (injured >= 3) {

        score += 25;

        reasons.push(
            "Multiple injured people"
        );

    } else if (injured >= 1) {

        score += 20;

        reasons.push(
            "Injured person reported"
        );

    }


    // --------------------------------
    // 3. CHILDREN
    // --------------------------------

    if (children >= 3) {

        score += 15;

        reasons.push(
            "Multiple children involved"
        );

    } else if (children >= 1) {

        score += 8;

        reasons.push(
            "Children are involved"
        );

    }


    // --------------------------------
    // 4. ELDERLY PEOPLE
    // --------------------------------

    if (elderly >= 2) {

        score += 15;

        reasons.push(
            "Multiple elderly people involved"
        );

    } else if (elderly >= 1) {

        score += 8;

        reasons.push(
            "Elderly person is involved"
        );

    }


    // --------------------------------
    // 5. WATER LEVEL
    // --------------------------------

    if (waterLevel === "dangerous") {

        score += 25;

        reasons.push(
            "Dangerous water level"
        );

    } else if (waterLevel === "high") {

        score += 20;

        reasons.push(
            "High water level"
        );

    } else if (waterLevel === "medium") {

        score += 10;

        reasons.push(
            "Medium water level"
        );

    } else if (waterLevel === "low") {

        score += 5;

        reasons.push(
            "Low water level"
        );

    }


    // --------------------------------
    // 6. DISASTER TYPE
    // --------------------------------

    if (
        disasterType === "earthquake" ||
        disasterType === "fire" ||
        disasterType === "cyclone"
    ) {

        score += 10;

        reasons.push(
            `${data.disaster_type} can involve significant danger`
        );

    } else if (
        disasterType === "landslide"
    ) {

        score += 10;

        reasons.push(
            "Landslide can cause sudden physical danger"
        );

    }


    // --------------------------------
    // 7. DANGER KEYWORDS
    // --------------------------------

    const dangerKeywords = [
        "trapped",
        "unconscious",
        "cannot breathe",
        "can't breathe",
        "not breathing",
        "serious injury",
        "critical",
        "help immediately",
        "stuck",
        "collapsed",
        "unable to escape"
    ];

    const detectedKeywords = [];

    for (const keyword of dangerKeywords) {

        if (description.includes(keyword)) {

            detectedKeywords.push(keyword);

        }

    }


    if (detectedKeywords.length > 0) {

        score += 20;

        reasons.push(
            `Danger keywords detected: ${detectedKeywords.join(", ")}`
        );

    }


    // --------------------------------
    // LIMIT SCORE TO 100
    // --------------------------------

    score = Math.min(score, 100);


    // --------------------------------
    // DETERMINE PRIORITY
    // --------------------------------

    let priority;

    if (score >= 75) {

        priority = "CRITICAL";

    } else if (score >= 50) {

        priority = "HIGH";

    } else if (score >= 25) {

        priority = "MEDIUM";

    } else {

        priority = "LOW";

    }


    // --------------------------------
    // CREATE HUMAN-READABLE REASON
    // --------------------------------

    let riskReason;

    if (reasons.length === 0) {

        riskReason =
            "No major high-risk indicators detected.";

    } else {

        riskReason =
            reasons.join(". ") + ".";
    }


    // --------------------------------
    // RETURN RESULT
    // --------------------------------

    return {
        riskScore: score,
        priority: priority,
        riskReason: riskReason
    };
}


module.exports = {
    calculateRisk
};