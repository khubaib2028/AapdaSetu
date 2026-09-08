import { useState } from "react";

function Recovery() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    disaster_type: "",
    house_damage: "",
    road_damage: "",
    electricity: "",
    water_supply: "",
    agriculture_damage: "",
    families_affected: "",
    financial_loss: "",
    people_affected: "",
    damage_description: "",
    immediate_needs: [],
  });

  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNeedChange = (need) => {
    setFormData((prev) => {
      const alreadySelected = prev.immediate_needs.includes(need);

      if (alreadySelected) {
        return {
          ...prev,
          immediate_needs: prev.immediate_needs.filter(
            (item) => item !== need
          ),
        };
      }

      return {
        ...prev,
        immediate_needs: [...prev.immediate_needs, need],
      };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhoto(file);
    }
  };

  const shareLocation = () => {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("❌ Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
        });

        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));

        setMessage("📍 Location captured successfully.");
      },
      (error) => {
        if (error.code === 1) {
          setMessage(
            "⚠️ Location permission denied. You can still submit the report."
          );
        } else {
          setMessage("❌ Unable to get your location.");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!formData.name.trim()) {
      setMessage("⚠️ Please enter your name.");
      return;
    }

    if (!formData.phone.trim()) {
      setMessage("⚠️ Please enter your phone number.");
      return;
    }

    if (!formData.disaster_type) {
      setMessage("⚠️ Please select a disaster type.");
      return;
    }

    if (!formData.damage_description.trim()) {
      setMessage("⚠️ Please describe the damage.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("location", formData.location);
      data.append("disaster_type", formData.disaster_type);

      data.append("house_damage", formData.house_damage);
      data.append("road_damage", formData.road_damage);
      data.append("electricity", formData.electricity);
      data.append("water_supply", formData.water_supply);
      data.append(
        "agriculture_damage",
        formData.agriculture_damage
      );

      data.append(
        "families_affected",
        formData.families_affected || "0"
      );

      data.append(
        "financial_loss",
        formData.financial_loss || "0"
      );

      data.append(
        "people_affected",
        formData.people_affected || formData.families_affected || "0"
      );

      data.append(
        "damage_description",
        formData.damage_description
      );

      data.append(
        "immediate_needs",
        formData.immediate_needs.join(", ")
      );

      if (location.latitude !== null) {
        data.append("latitude", location.latitude);
      }

      if (location.longitude !== null) {
        data.append("longitude", location.longitude);
      }

      if (photo) {
        data.append("photo", photo);
      }

      const response = await fetch(
        "http://localhost:5000/api/recovery",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit recovery report."
        );
      }

      setMessage(
        "✅ Damage report submitted successfully!"
      );

      setFormData({
        name: "",
        phone: "",
        location: "",
        disaster_type: "",
        house_damage: "",
        road_damage: "",
        electricity: "",
        water_supply: "",
        agriculture_damage: "",
        families_affected: "",
        financial_loss: "",
        people_affected: "",
        damage_description: "",
        immediate_needs: [],
      });

      setPhoto(null);

      setLocation({
        latitude: null,
        longitude: null,
      });
    } catch (error) {
      console.error("Recovery submission error:", error);

      setMessage(
        `❌ ${error.message || "Unable to submit report."}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">

      {/* Page Header */}
      <div className="page-header">
        <h1>🏚️ Recovery & Damage Report</h1>

        <p>
          Report damage caused by a disaster and request
          assistance for recovery and rebuilding.
        </p>
      </div>


      {/* Citizen Information */}
      <div className="card">

        <h2>👤 Citizen Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>


          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

        </div>

      </div>


      {/* Location & Disaster */}
      <div className="card">

        <h2>📍 Incident Information</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter affected location"
            />
          </div>


          <div className="form-group">
            <label>Disaster Type</label>

            <select
              name="disaster_type"
              value={formData.disaster_type}
              onChange={handleChange}
            >
              <option value="">
                Select disaster type
              </option>

              <option>Flood</option>
              <option>Earthquake</option>
              <option>Fire</option>
              <option>Landslide</option>
              <option>Cyclone</option>
              <option>Other</option>
            </select>
          </div>

        </div>

      </div>


      {/* Damage Assessment */}
      <div className="card">

        <h2>🏚️ Damage Assessment</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>House / Building Damage</label>

            <select
              name="house_damage"
              value={formData.house_damage}
              onChange={handleChange}
            >
              <option value="">
                Select damage level
              </option>

              <option>No Damage</option>
              <option>Minor</option>
              <option>Moderate</option>
              <option>Severe</option>
              <option>Destroyed</option>
            </select>
          </div>


          <div className="form-group">
            <label>Road Damage</label>

            <select
              name="road_damage"
              value={formData.road_damage}
              onChange={handleChange}
            >
              <option value="">
                Select status
              </option>

              <option>No Damage</option>
              <option>Minor Damage</option>
              <option>Major Damage</option>
              <option>Blocked</option>
            </select>
          </div>


          <div className="form-group">
            <label>Electricity</label>

            <select
              name="electricity"
              value={formData.electricity}
              onChange={handleChange}
            >
              <option value="">
                Select status
              </option>

              <option>Available</option>
              <option>Partially Damaged</option>
              <option>Unavailable</option>
            </select>
          </div>


          <div className="form-group">
            <label>Water Supply</label>

            <select
              name="water_supply"
              value={formData.water_supply}
              onChange={handleChange}
            >
              <option value="">
                Select status
              </option>

              <option>Available</option>
              <option>Partially Available</option>
              <option>Unavailable</option>
            </select>
          </div>


          <div className="form-group">
            <label>Agriculture Damage</label>

            <select
              name="agriculture_damage"
              value={formData.agriculture_damage}
              onChange={handleChange}
            >
              <option value="">
                Select damage level
              </option>

              <option>No Damage</option>
              <option>Minor</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>


          <div className="form-group">
            <label>Families Affected</label>

            <input
              type="number"
              name="families_affected"
              value={formData.families_affected}
              onChange={handleChange}
              min="0"
              placeholder="Number of families"
            />
          </div>


          <div className="form-group">
            <label>People Affected</label>

            <input
              type="number"
              name="people_affected"
              value={formData.people_affected}
              onChange={handleChange}
              min="0"
              placeholder="Number of people"
            />
          </div>


          <div className="form-group">
            <label>Estimated Financial Loss</label>

            <input
              type="number"
              name="financial_loss"
              value={formData.financial_loss}
              onChange={handleChange}
              min="0"
              placeholder="Estimated loss in ₹"
            />
          </div>

        </div>

      </div>


      {/* Relief Requirements */}
      <div className="card">

        <h2>🆘 Relief Requirements</h2>

        <div className="need-grid">

          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes("Food")}
              onChange={() => handleNeedChange("Food")}
            />
            🍲 Food
          </label>


          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes(
                "Drinking Water"
              )}
              onChange={() =>
                handleNeedChange("Drinking Water")
              }
            />
            💧 Drinking Water
          </label>


          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes(
                "Temporary Shelter"
              )}
              onChange={() =>
                handleNeedChange("Temporary Shelter")
              }
            />
            🏠 Temporary Shelter
          </label>


          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes(
                "Medicines"
              )}
              onChange={() =>
                handleNeedChange("Medicines")
              }
            />
            💊 Medicines
          </label>


          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes(
                "Clothing"
              )}
              onChange={() =>
                handleNeedChange("Clothing")
              }
            />
            👕 Clothing
          </label>


          <label className="need-item">
            <input
              type="checkbox"
              checked={formData.immediate_needs.includes(
                "Electricity"
              )}
              onChange={() =>
                handleNeedChange("Electricity")
              }
            />
            ⚡ Electricity
          </label>

        </div>

      </div>


      {/* Description & Evidence */}
      <div className="card">

        <h2>📝 Damage Description</h2>

        <div className="form-group">

          <label>
            Describe the damage
          </label>

          <textarea
            name="damage_description"
            value={formData.damage_description}
            onChange={handleChange}
            placeholder="Example: Flood water damaged the ground floor of our house. The road is blocked and drinking water supply has stopped..."
          />

        </div>


        <div className="emergency-tools">

          <label className="tool-btn upload-btn">
            📷 Upload Damage Photo

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>


          <button
            type="button"
            className="tool-btn"
            onClick={shareLocation}
          >
            📍 Share Location
          </button>

        </div>


        {photo && (
          <p>
            📷 Selected photo: <strong>{photo.name}</strong>
          </p>
        )}


        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "600",
            }}
          >
            {message}
          </p>
        )}


        <button
          type="button"
          className="page-btn emergency-submit"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "⏳ Submitting..."
            : "🏚️ Submit Damage Report"}
        </button>

      </div>

    </div>
  );
}

export default Recovery;