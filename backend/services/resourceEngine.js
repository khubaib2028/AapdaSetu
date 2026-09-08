// AapdaSetu Resource Recommendation Engine
// Local and explainable - no external API required

function recommendResources(data, riskResult) {

    const resources = [];

    const disasterType = (data.disaster_type || "").toLowerCase();
    const needs = (data.needs || "")
        .toLowerCase()
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    const injured = Number(data.injured) || 0;


    // --------------------------------
    // 1. DISASTER-SPECIFIC RESOURCES
    // --------------------------------

    if (disasterType === "flood") {

        resources.push("Rescue Team");
        resources.push("Boats / Water Rescue Equipment");
        resources.push("Drinking Water");
        resources.push("Food Supplies");

    }

    else if (disasterType === "earthquake") {

        resources.push("Search & Rescue Team");
        resources.push("Medical Team");
        resources.push("Emergency Shelter");

    }

    else if (disasterType === "fire") {

        resources.push("Fire & Rescue Team");
        resources.push("Ambulance");
        resources.push("Medical Team");

    }

    else if (disasterType === "landslide") {

        resources.push("Search & Rescue Team");
        resources.push("Heavy Rescue Equipment");
        resources.push("Medical Team");

    }

    else if (disasterType === "cyclone") {

        resources.push("Rescue Team");
        resources.push("Emergency Shelter");
        resources.push("Food Supplies");
        resources.push("Drinking Water");

    }

    else {

        resources.push("Emergency Response Team");

    }


    // --------------------------------
    // 2. CITIZEN REQUESTED RESOURCES
    // --------------------------------

    const resourceMap = {

        food: "Food Supplies",
        water: "Drinking Water",
        medical: "Medical Team",
        rescue: "Rescue Team",
        shelter: "Emergency Shelter",
        ambulance: "Ambulance",
        oxygen: "Oxygen Support",
        electricity: "Electricity Restoration Team"

    };


    for (const need of needs) {

        if (resourceMap[need]) {

            resources.push(resourceMap[need]);

        }

    }


    // --------------------------------
    // 3. INJURY-BASED RECOMMENDATION
    // --------------------------------

    if (injured > 0) {

        resources.push("Emergency Medical Support");

    }


    // --------------------------------
    // 4. CRITICAL PRIORITY
    // --------------------------------

    if (riskResult.priority === "CRITICAL") {

        resources.push("Immediate Response Team");

    }

    else if (riskResult.priority === "HIGH") {

        resources.push("Priority Response Team");

    }


    // --------------------------------
    // REMOVE DUPLICATES
    // --------------------------------

    const uniqueResources = [
        ...new Set(resources)
    ];


    // --------------------------------
    // RETURN RESULT
    // --------------------------------

    return uniqueResources;
}


module.exports = {
    recommendResources
};