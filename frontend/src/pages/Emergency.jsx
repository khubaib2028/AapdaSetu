import { useState, useRef } from "react";

function Emergency() {

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    disaster_type: "",
    people_affected: "",
    injured: "",
    children: "",
    elderly: "",
    water_level: "",
    needs: [],
    description: "",
  });

  const [photo, setPhoto] = useState(null);

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // ===============================
  // VOICE INPUT STATE
  // ===============================

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);


  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

  };


  // ===============================
  // HANDLE NEED CHANGE
  // ===============================

  const handleNeedChange = (e) => {

    const { value, checked } = e.target;

    if (checked) {

      setFormData({
        ...formData,
        needs: [...formData.needs, value],
      });

    } else {

      setFormData({
        ...formData,
        needs: formData.needs.filter(
          (need) => need !== value
        ),
      });

    }

  };


  // ===============================
  // VOICE INPUT
  // ===============================

  const handleVoiceInput = () => {

    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setMessage(
        "❌ Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;

    }


    // If already listening, stop
    if (isListening && recognitionRef.current) {

      recognitionRef.current.stop();

      return;

    }


    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;


    // Indian English
    recognition.lang = "en-IN";

    // Return results while speaking
    recognition.interimResults = true;

    // We only need one voice input
    recognition.continuous = false;


    recognition.onstart = () => {

      setIsListening(true);

      setMessage(
        "🎤 Listening... Please describe the emergency."
      );

    };


    recognition.onresult = (event) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0].transcript;

      }


      // Put recognized speech into description
      setFormData((prev) => ({
        ...prev,
        description: transcript,
      }));

    };


    recognition.onerror = (event) => {

      console.error(
        "Voice recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {

        setMessage(
          "❌ Microphone permission was denied. Please allow microphone access."
        );

      } else if (event.error === "no-speech") {

        setMessage(
          "⚠️ No speech detected. Please try again."
        );

      } else {

        setMessage(
          "❌ Voice input failed. Please try again."
        );

      }

    };


    recognition.onend = () => {

      setIsListening(false);

    };


    recognition.start();

  };


  // ===============================
  // NORMAL REPORT SUBMIT
  // ===============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");


    try {

      // Create FormData
      const data = new FormData();


      // Add normal form fields
      data.append(
        "name",
        formData.name
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "disaster_type",
        formData.disaster_type
      );

      data.append(
        "people_affected",
        Number(formData.people_affected) || 0
      );

      data.append(
        "injured",
        Number(formData.injured) || 0
      );

      data.append(
        "children",
        Number(formData.children) || 0
      );

      data.append(
        "elderly",
        Number(formData.elderly) || 0
      );

      data.append(
        "water_level",
        formData.water_level
      );

      data.append(
        "needs",
        formData.needs.join(", ")
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "latitude",
        location.latitude || ""
      );

      data.append(
        "longitude",
        location.longitude || ""
      );


      // Add photo if selected
      if (photo) {

        data.append(
          "photo",
          photo
        );

      }


      const response = await fetch(
        "http://localhost:5000/api/reports",
        {
          method: "POST",
          body: data,
        }
      );


      const result =
        await response.json();


      if (response.ok) {

        setMessage(
          `✅ Emergency report submitted successfully! Report ID: ${result.reportId}`
        );


        if (result.photoUploaded) {

          setMessage(
            `✅ Report submitted successfully! Report ID: ${result.reportId} 📷 Photo uploaded`
          );

        }


        // Reset form
        setFormData({
          name: "",
          phone: "",
          disaster_type: "",
          people_affected: "",
          injured: "",
          children: "",
          elderly: "",
          water_level: "",
          needs: [],
          description: "",
        });


        setPhoto(null);


      } else {

        setMessage(
          `❌ ${
            result.message ||
            "Failed to submit report"
          }`
        );

      }


    } catch (error) {

      console.error(
        "Submit error:",
        error
      );

      setMessage(
        "❌ Cannot connect to AapdaSetu server. Make sure the backend is running."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===============================
  // SOS
  // ===============================

  const handleSOS = async () => {

    const confirmSOS =
      window.confirm(
        "🚨 ACTIVATE SOS?\n\nThis will create a CRITICAL emergency alert for the response team."
      );

    if (!confirmSOS) {

      return;

    }


    setSosLoading(true);
    setMessage("");


    try {

      let latitude = null;
      let longitude = null;


      if (navigator.geolocation) {

        try {

          const position =
            await new Promise(
              (resolve, reject) => {

                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                  }
                );

              }
            );


          latitude =
            position.coords.latitude;

          longitude =
            position.coords.longitude;


        } catch (locationError) {

          console.log(
            "Location unavailable:",
            locationError.message
          );

        }

      }


      const response =
        await fetch(
          "http://localhost:5000/api/reports/sos",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              name:
                formData.name ||
                "SOS Citizen",

              phone:
                formData.phone ||
                "Not Provided",

              latitude,

              longitude,

            }),

          }
        );


      const result =
        await response.json();


      if (response.ok) {

        setMessage(
          `🚨 SOS ACTIVATED! Report ID: ${result.reportId} | CRITICAL | Risk Score: 100`
        );

      } else {

        setMessage(
          `❌ ${
            result.message ||
            "Failed to activate SOS"
          }`
        );

      }


    } catch (error) {

      console.error(
        "SOS error:",
        error
      );

      setMessage(
        "❌ Cannot connect to AapdaSetu server. Make sure the backend is running."
      );

    } finally {

      setSosLoading(false);

    }

  };


  // ===============================
  // RETURN UI
  // ===============================

  return (

    <div className="page">


      <div className="page-header">

        <h1>🚨 Report Emergency</h1>

        <p>
          Tell us what is happening.
          Your report will be analyzed
          and prioritized to help
          emergency teams respond faster.
        </p>

      </div>


      {/* ===============================
          SOS
      =============================== */}

      <div className="card sos-card">

        <h2>🆘 Need Immediate Help?</h2>

        <p>
          If you are in immediate danger
          and cannot complete the full
          emergency form, activate SOS.
        </p>


        <button
          type="button"
          className="sos-btn"
          onClick={handleSOS}
          disabled={sosLoading}
        >

          {sosLoading
            ? "⏳ Activating SOS..."
            : "🆘 ACTIVATE SOS"
          }

        </button>

      </div>


      {/* ===============================
          PERSONAL INFORMATION
      =============================== */}

      <div className="card">

        <h2>👤 Personal Information</h2>


        <div className="form-grid">


          <div className="form-group">

            <label>Your Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />

          </div>


        </div>

      </div>


      {/* ===============================
          EMERGENCY DETAILS
      =============================== */}

      <div className="card">

        <h2>⚠️ Emergency Details</h2>


        <div className="form-grid">


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

              <option value="flood">
                Flood
              </option>

              <option value="earthquake">
                Earthquake
              </option>

              <option value="fire">
                Fire
              </option>

              <option value="landslide">
                Landslide
              </option>

              <option value="cyclone">
                Cyclone
              </option>

              <option value="other">
                Other
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>People Affected</label>

            <input
              type="number"
              name="people_affected"
              min="1"
              placeholder="Number of people"
              value={formData.people_affected}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>Injured People</label>

            <input
              type="number"
              name="injured"
              min="0"
              placeholder="Number injured"
              value={formData.injured}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>Children</label>

            <input
              type="number"
              name="children"
              min="0"
              placeholder="Number of children"
              value={formData.children}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>Elderly People</label>

            <input
              type="number"
              name="elderly"
              min="0"
              placeholder="Number of elderly"
              value={formData.elderly}
              onChange={handleChange}
            />

          </div>


          <div className="form-group">

            <label>Water Level</label>

            <select
              name="water_level"
              value={formData.water_level}
              onChange={handleChange}
            >

              <option value="">
                Select water level
              </option>

              <option value="none">
                No Water
              </option>

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

              <option value="dangerous">
                Dangerous
              </option>

            </select>

          </div>


        </div>

      </div>


      {/* ===============================
          NEEDS
      =============================== */}

      <div className="card">

        <h2>🆘 What do you need right now?</h2>


        <div className="need-grid">


          {[
            ["Food", "🍲 Food"],
            ["Water", "💧 Water"],
            ["Medical", "🏥 Medical"],
            ["Rescue", "🚒 Rescue"],
            ["Shelter", "🏠 Shelter"],
            ["Ambulance", "🚑 Ambulance"],
            ["Oxygen", "🫁 Oxygen"],
            ["Electricity", "⚡ Electricity"],
          ].map(([value, label]) => (

            <label
              className="need-item"
              key={value}
            >

              <input
                type="checkbox"
                value={value}
                checked={formData.needs.includes(value)}
                onChange={handleNeedChange}
              />

              {label}

            </label>

          ))}


        </div>

      </div>


      {/* ===============================
          DESCRIPTION + PHOTO + VOICE
      =============================== */}

      <div className="card">

        <h2>📝 Describe the Situation</h2>


        <div className="form-group">

          <label>
            Tell us what is happening
          </label>


          <textarea
            name="description"
            placeholder="Example: Water has entered our house. 5 people are trapped on the second floor and one person is injured..."
            value={formData.description}
            onChange={handleChange}
          />

        </div>


        <div className="emergency-tools">


          {/* ===============================
              VOICE INPUT BUTTON
          =============================== */}

          <button
            type="button"
            className="tool-btn"
            onClick={handleVoiceInput}
          >

            {isListening
              ? "🛑 Stop Listening"
              : "🎤 Voice Input"
            }

          </button>


          {/* ===============================
              PHOTO UPLOAD
          =============================== */}

          <label className="tool-btn upload-btn">

            📷 Upload Photo

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(
                  e.target.files[0]
                )
              }
            />

          </label>


          {/* ===============================
              SHARE LOCATION
          =============================== */}

          <button
            type="button"
            className="tool-btn"
            onClick={() => {

              if (!navigator.geolocation) {

                setMessage(
                  "❌ Geolocation is not supported by this browser."
                );

                return;

              }


              navigator.geolocation.getCurrentPosition(

                (position) => {

                  const latitude =
                    position.coords.latitude;

                  const longitude =
                    position.coords.longitude;


                  setLocation({
                    latitude,
                    longitude,
                  });


                  setMessage(
                    "📍 Location captured successfully!"
                  );

                },


                (error) => {

                  console.log(
                    "Location error:",
                    error.message
                  );


                  setMessage(
                    "❌ Unable to get your location. Please allow location permission."
                  );

                },


                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
                }

              );

            }}
          >

            📍 Share Location

          </button>


        </div>


        {/* ===============================
            VOICE STATUS
        =============================== */}

        {isListening && (

          <p
            style={{
              marginTop: "10px",
              fontWeight: "600",
            }}
          >

            🎤 Listening... Speak clearly
            about the emergency.

          </p>

        )}


        {/* ===============================
            SELECTED PHOTO
        =============================== */}

        {photo && (

          <p style={{ marginTop: "10px" }}>

            📷 Selected:
            {" "}
            {photo.name}

          </p>

        )}


        {/* ===============================
            LOCATION STATUS
        =============================== */}

        {location.latitude &&
          location.longitude && (

          <p
            style={{
              marginTop: "10px",
            }}
          >

            📍 Location:
            {" "}
            {location.latitude.toFixed(6)},
            {" "}
            {location.longitude.toFixed(6)}

          </p>

        )}


        {/* ===============================
            SUBMIT
        =============================== */}

        <button
          type="button"
          className="page-btn emergency-submit"
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading
            ? "⏳ Submitting..."
            : "🚨 Submit Emergency Report"
          }

        </button>


        {/* ===============================
            MESSAGE
        =============================== */}

        {message && (

          <p
            style={{
              marginTop: "15px",
            }}
          >

            {message}

          </p>

        )}


      </div>


    </div>

  );

}


export default Emergency;