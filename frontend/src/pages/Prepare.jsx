import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// =========================================
// MAP MARKER ICONS
// =========================================

// 🔵 CITIZEN / VICTIM LOCATION

const userIcon = L.divIcon({

  className: "",

  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #2563eb;
      border: 4px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">

      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
      "></div>

    </div>
  `,

  iconSize: [42, 42],

  iconAnchor: [21, 42],

  popupAnchor: [0, -42]

});


// 🟢 AUTHORITY SAFE LOCATION

const safeLocationIcon = L.divIcon({

  className: "",

  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #16a34a;
      border: 4px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">

      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
      "></div>

    </div>
  `,

  iconSize: [42, 42],

  iconAnchor: [21, 42],

  popupAnchor: [0, -42]

});


function Prepare() {

  // =========================================
  // ALERTS
  // =========================================

  const [alerts, setAlerts] = useState([]);

  const [loadingAlerts, setLoadingAlerts] =
    useState(true);

  const [alertError, setAlertError] =
    useState("");


  // =========================================
  // CHECKLIST
  // =========================================

  const [checklist, setChecklist] = useState({

    water: false,

    medicines: false,

    phone: false,

    documents: false,

    shelter: false,

    contacts: false

  });


  // =========================================
  // SAFE LOCATIONS
  // =========================================

  const [safeLocations, setSafeLocations] =
    useState([]);

  const [safeLoading, setSafeLoading] =
    useState(false);

  const [safeError, setSafeError] =
    useState("");

  const [showSafeLocations, setShowSafeLocations] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState(null);


  // Default map location

  const defaultCenter = [

    28.4595,

    77.0266

  ];


  // =========================================
  // FETCH ACTIVE DISASTER ALERTS
  // =========================================

  useEffect(() => {

    const fetchAlerts = async () => {

      try {

        setLoadingAlerts(true);

        setAlertError("");


        const response = await fetch(
          "http://localhost:5000/api/alerts"
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch alerts"
          );

        }


        setAlerts(data);

      }

      catch (error) {

        console.error(
          "Alert fetch error:",
          error
        );


        setAlertError(
          "Unable to load disaster alerts."
        );

      }

      finally {

        setLoadingAlerts(false);

      }

    };


    fetchAlerts();

  }, []);


  // =========================================
  // CHECKLIST HANDLER
  // =========================================

  const handleChecklistChange = (item) => {

    setChecklist((previous) => ({

      ...previous,

      [item]:
        !previous[item]

    }));

  };


  // =========================================
  // FETCH SAFE LOCATIONS
  // =========================================

  const fetchSafeLocations = async () => {

    try {

      setSafeLoading(true);

      setSafeError("");


      const response = await fetch(
        "http://localhost:5000/api/safe-locations"
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to fetch safe locations"
        );

      }


      setSafeLocations(data);

    }

    catch (error) {

      console.error(
        "Safe location error:",
        error
      );


      setSafeError(
        "Unable to load safe locations."
      );

    }

    finally {

      setSafeLoading(false);

    }

  };


  // =========================================
  // FIND SAFE LOCATIONS
  // =========================================

  const findSafeLocations = () => {

    setShowSafeLocations(true);


    // Fetch authority registered locations

    fetchSafeLocations();


    // Try to get citizen location

    if (!navigator.geolocation) {

      setSafeError(
        "Geolocation is not supported by this browser."
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        setUserLocation({

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude

        });

      },


      (error) => {

        console.warn(
          "Location permission error:",
          error
        );


        // Safe locations can still be shown

        setSafeError(
          "Your location could not be detected. Registered safe locations are still shown."
        );

      },


      {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0

      }

    );

  };


  // =========================================
  // MAP CENTER
  // =========================================

  const mapCenter = userLocation

    ? [

        userLocation.latitude,

        userLocation.longitude

      ]

    : safeLocations.length > 0

    ? [

        Number(
          safeLocations[0].latitude
        ),

        Number(
          safeLocations[0].longitude
        )

      ]

    : defaultCenter;


  // =========================================
  // UI
  // =========================================

  return (

    <div className="page">


      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <h1>
          🛡️ Disaster Preparedness
        </h1>


        <p>
          Be prepared before a disaster happens.
          Follow essential safety steps and know
          where to get help.
        </p>

      </div>


      {/* =====================================
          ACTIVE DISASTER ALERTS
      ===================================== */}

      <div className="card">

        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            marginBottom: "18px",

            flexWrap: "wrap",

            gap: "10px"
          }}
        >

          <h2
            style={{
              margin: 0
            }}
          >
            🚨 Active Disaster Alerts
          </h2>


          <span
            style={{

              padding: "6px 12px",

              borderRadius: "20px",

              background: "#fee2e2",

              color: "#b91c1c",

              fontSize: "13px",

              fontWeight: "700"

            }}
          >

            🔴 LIVE ALERTS

          </span>

        </div>


        {/* LOADING */}

        {loadingAlerts && (

          <p>
            ⏳ Loading disaster alerts...
          </p>

        )}


        {/* ERROR */}

        {!loadingAlerts &&
          alertError && (

          <p
            style={{

              padding: "12px",

              borderRadius: "10px",

              background: "#fee2e2",

              color: "#b91c1c"

            }}
          >

            ❌ {alertError}

          </p>

        )}


        {/* NO ALERTS */}

        {!loadingAlerts &&
          !alertError &&
          alerts.length === 0 && (

          <div
            style={{

              padding: "20px",

              borderRadius: "12px",

              background: "#f0fdf4",

              color: "#166534"

            }}
          >

            ✅ No active disaster alerts
            at this time.

          </div>

        )}


        {/* ALERT LIST */}

        {!loadingAlerts &&
          !alertError &&
          alerts.map((alert) => {

            const instructions =
              alert.instructions
                ? alert.instructions.split("|")
                : [];


            return (

              <div
                key={alert.id}

                style={{

                  marginBottom: "18px",

                  padding: "18px",

                  borderRadius: "14px",

                  border:
                    "1px solid #fecaca",

                  background:
                    "#fff7f7"

                }}
              >


                {/* ALERT HEADER */}

                <div
                  style={{

                    display: "flex",

                    justifyContent:
                      "space-between",

                    alignItems: "center",

                    gap: "15px",

                    flexWrap: "wrap"

                  }}
                >

                  <div>

                    <h3
                      style={{

                        margin:
                          "0 0 6px",

                        fontSize:
                          "19px"

                      }}
                    >

                      ⚠️ {alert.alert_type}

                    </h3>


                    <p
                      style={{

                        margin: 0,

                        color:
                          "#475569"

                      }}
                    >

                      📍 {alert.area}

                    </p>

                  </div>


                  <span
                    style={{

                      padding:
                        "7px 13px",

                      borderRadius:
                        "20px",

                      background:
                        alert.severity ===
                        "CRITICAL"

                          ? "#991b1b"

                          : alert.severity ===
                            "HIGH"

                          ? "#dc2626"

                          : alert.severity ===
                            "MEDIUM"

                          ? "#f59e0b"

                          : "#16a34a",

                      color: "white",

                      fontSize:
                        "12px",

                      fontWeight:
                        "700"

                    }}
                  >

                    {alert.severity}

                  </span>

                </div>


                {/* ALERT MESSAGE */}

                <p
                  style={{

                    marginTop:
                      "15px",

                    marginBottom:
                      "8px",

                    lineHeight:
                      "1.6"

                  }}
                >

                  {alert.message}

                </p>


                {/* ALERT TIME */}

                <p
                  style={{

                    margin:
                      "0 0 15px",

                    fontSize:
                      "13px",

                    color:
                      "#64748b"

                  }}
                >

                  🕐 Alert issued:

                  {" "}

                  {new Date(
                    alert.created_at
                  ).toLocaleString()}

                </p>


                {/* SAFETY INSTRUCTIONS */}

                {instructions.length > 0 && (

                  <div>

                    <strong>
                      🛡️ What should you do?
                    </strong>


                    <ul
                      style={{

                        marginTop:
                          "10px",

                        paddingLeft:
                          "22px",

                        lineHeight:
                          "1.8"

                      }}
                    >

                      {instructions.map(
                        (
                          instruction,
                          index
                        ) => (

                          <li key={index}>

                            {instruction}

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}

              </div>

            );

          })}


        {/* INFO */}

        <div
          style={{

            marginTop: "8px",

            padding:
              "12px 15px",

            borderRadius:
              "10px",

            background:
              "#f8fafc",

            color:
              "#64748b",

            fontSize:
              "13px"

          }}
        >

          ℹ️ These alerts are provided by
          the AapdaSetu alert system.

        </div>

      </div>


      {/* =====================================
          PREPAREDNESS CHECKLIST
      ===================================== */}

      <div className="card">

        <h2>
          ✅ Emergency Preparedness Checklist
        </h2>


        <div className="checklist">


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.water
              }

              onChange={() =>
                handleChecklistChange(
                  "water"
                )
              }

            />

            Store sufficient drinking water

          </label>


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.medicines
              }

              onChange={() =>
                handleChecklistChange(
                  "medicines"
                )
              }

            />

            Keep essential medicines ready

          </label>


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.phone
              }

              onChange={() =>
                handleChecklistChange(
                  "phone"
                )
              }

            />

            Charge your phone and power bank

          </label>


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.documents
              }

              onChange={() =>
                handleChecklistChange(
                  "documents"
                )
              }

            />

            Keep important documents safe

          </label>


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.shelter
              }

              onChange={() =>
                handleChecklistChange(
                  "shelter"
                )
              }

            />

            Identify the nearest emergency shelter

          </label>


          <label className="check-item">

            <input
              type="checkbox"

              checked={
                checklist.contacts
              }

              onChange={() =>
                handleChecklistChange(
                  "contacts"
                )
              }

            />

            Save important emergency contacts

          </label>


        </div>

      </div>


      {/* =====================================
          SAFE LOCATIONS
      ===================================== */}

      <div className="card">

        <div
          style={{

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            gap: "15px",

            flexWrap: "wrap"

          }}
        >

          <div>

            <h2
              style={{
                marginBottom:
                  "10px"
              }}
            >

              📍 Safe Locations

            </h2>


            <p>

              Find currently available safe
              locations registered by
              disaster-management authorities.

            </p>

          </div>


          <button
            className="page-btn"

            onClick={
              findSafeLocations
            }
          >

            📍 Find Safe Locations

          </button>

        </div>


        {/* LOADING */}

        {safeLoading && (

          <p
            style={{
              marginTop: "20px"
            }}
          >

            ⏳ Loading registered safe
            locations...

          </p>

        )}


        {/* ERROR / LOCATION MESSAGE */}

        {safeError && (

          <div
            style={{

              marginTop: "15px",

              padding:
                "12px 15px",

              borderRadius:
                "10px",

              background:
                "#fff7ed",

              color:
                "#9a3412",

              fontSize:
                "14px"

            }}
          >

            ℹ️ {safeError}

          </div>

        )}


        {/* MAP */}

        {showSafeLocations &&
          !safeLoading &&
          safeLocations.length > 0 && (

          <>

            <div
              style={{

                width: "100%",

                height: "450px",

                borderRadius:
                  "14px",

                overflow:
                  "hidden",

                marginTop:
                  "20px",

                border:
                  "1px solid #e5e7eb"

              }}
            >

              <MapContainer

                center={
                  mapCenter
                }

                zoom={13}

                style={{

                  width: "100%",

                  height: "100%"

                }}

              >

                <TileLayer

                  attribution="&copy; OpenStreetMap contributors"

                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* =================================
                    🔵 CITIZEN LOCATION
                ================================= */}

                {userLocation && (

                  <Marker

                    position={[

                      userLocation.latitude,

                      userLocation.longitude

                    ]}

                    icon={userIcon}

                  >

                    <Popup>

                      <strong>
                        🔵 Your Location
                      </strong>

                      <br />

                      Your current browser
                      location.

                    </Popup>

                  </Marker>

                )}


                {/* =================================
                    🟢 AUTHORITY SAFE LOCATIONS
                ================================= */}

                {safeLocations.map(
                  (location) => (

                    <Marker

                      key={
                        location.id
                      }

                      position={[

                        Number(
                          location.latitude
                        ),

                        Number(
                          location.longitude
                        )

                      ]}

                      icon={
                        safeLocationIcon
                      }

                    >

                      <Popup>

                        <strong>
                          🟢 Safe Location
                        </strong>

                        <br />
                        <br />


                        <strong>
                          Availability:
                        </strong>

                        {" "}

                        {
                          location.availability
                        }


                        <br />


                        <strong>
                          Latitude:
                        </strong>

                        {" "}

                        {Number(
                          location.latitude
                        ).toFixed(5)}


                        <br />


                        <strong>
                          Longitude:
                        </strong>

                        {" "}

                        {Number(
                          location.longitude
                        ).toFixed(5)}

                      </Popup>

                    </Marker>

                  )
                )}

              </MapContainer>

            </div>


            {/* =================================
                MAP LEGEND
            ================================= */}

            <div
              style={{

                display: "flex",

                gap: "20px",

                alignItems:
                  "center",

                flexWrap:
                  "wrap",

                marginTop:
                  "12px",

                padding:
                  "10px 14px",

                borderRadius:
                  "10px",

                background:
                  "#f8fafc",

                fontSize:
                  "14px"

              }}
            >

              <span>

                🔵 Your Location

              </span>


              <span>

                🟢 Safe Location

              </span>

            </div>


            {/* LOCATION COUNT */}

            <div
              style={{

                marginTop:
                  "8px",

                padding:
                  "10px 14px",

                borderRadius:
                  "10px",

                background:
                  "#f0fdf4",

                color:
                  "#166534",

                fontSize:
                  "14px"

              }}
            >

              🟢{" "}

              {safeLocations.length}

              {" "}

              available safe location
              {safeLocations.length !== 1
                ? "s"
                : ""}

              {" "}
              registered by authorities.

            </div>

          </>

        )}


        {/* NO LOCATIONS */}

        {showSafeLocations &&
          !safeLoading &&
          safeLocations.length === 0 && (

          <div
            style={{

              marginTop:
                "20px",

              padding:
                "18px",

              borderRadius:
                "12px",

              background:
                "#f8fafc",

              color:
                "#64748b"

            }}
          >

            ℹ️ No available safe locations
            have been registered by the
            authorities yet.

          </div>

        )}

      </div>


    </div>

  );

}


export default Prepare;