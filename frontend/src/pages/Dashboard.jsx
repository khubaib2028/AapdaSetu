import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import {
  Pie,
  Doughnut
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import "leaflet/dist/leaflet.css";


// =============================================
// CHART.JS
// =============================================

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);


// =============================================
// MAP AUTO FIT
// =============================================

function MapViewUpdater({ reports }) {

  const map = useMap();

  useEffect(() => {

    const validReports = reports.filter(
      (report) =>
        report.latitude !== null &&
        report.longitude !== null
    );

    if (validReports.length === 0) {
      return;
    }

    const bounds = validReports.map(
      (report) => [
        Number(report.latitude),
        Number(report.longitude)
      ]
    );

    map.fitBounds(
      bounds,
      {
        padding: [40, 40]
      }
    );

  }, [reports, map]);

  return null;
}


// =============================================
// DASHBOARD
// =============================================

function Dashboard() {

  // =============================================
  // STATES
  // =============================================

  const [reports, setReports] = useState([]);

  const [recoveryReports, setRecoveryReports] = useState([]);

  const [recoveryLoading, setRecoveryLoading] = useState(true);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [selectedRecoveryReport, setSelectedRecoveryReport] =
    useState(null);

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  const [recoveryStatusUpdating, setRecoveryStatusUpdating] =
    useState(false);

  const [fullMap, setFullMap] =
    useState(false);


    const [alertForm, setAlertForm] = useState({
    alert_type: "",
    area: "",
    severity: "HIGH",
    message: "",
    instructions: ""
    });

    const [alertMessage, setAlertMessage] = useState("");
    const [alertSubmitting, setAlertSubmitting] = useState(false);

    // =============================================
    // SAFE LOCATION MANAGEMENT
    // =============================================

    const [safeLocations, setSafeLocations] = useState([]);

    const [safeLocationForm, setSafeLocationForm] = useState({
      latitude: "",
      longitude: "",
      availability: "Available"
    });

    const [safeLocationMessage, setSafeLocationMessage] = useState("");
    const [safeLocationSubmitting, setSafeLocationSubmitting] = useState(false);



    // =============================================
    // FETCH RECOVERY REPORTS
    // =============================================

    const fetchRecoveryReports = async () => {
    try {
        setRecoveryLoading(true);

        const response = await fetch(
        "http://localhost:5000/api/recovery"
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch recovery reports"
        );
        }

        setRecoveryReports(data);

    } catch (error) {

        console.error(
        "Recovery reports fetch error:",
        error
        );

    } finally {

        setRecoveryLoading(false);

    }
    };



  // =============================================
  // FETCH REPORTS
  // =============================================

  const fetchReports = async () => {

    try {

      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/reports"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch reports"
        );
      }

      const data = await response.json();

      setReports(data);

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      setMessage(
        "❌ Cannot connect to AapdaSetu server."
      );

    } finally {

      setLoading(false);

    }

  };


  // =============================================
  // UPDATE STATUS
  // =============================================

  const updateStatus = async (newStatus) => {

    if (!selectedReport) {
      return;
    }

    try {

      setStatusUpdating(true);

      const response = await fetch(
        `http://localhost:5000/api/reports/${selectedReport.id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to update status"
        );

      }


      setReports(
        (previousReports) =>
          previousReports.map(
            (report) =>
              report.id === selectedReport.id
                ? {
                    ...report,
                    status: newStatus
                  }
                : report
          )
      );


      setSelectedReport({
        ...selectedReport,
        status: newStatus
      });


      setMessage(
        `✅ Report #${selectedReport.id} status updated to ${newStatus}`
      );


    } catch (error) {

      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "❌ Failed to update report status."
      );

    } finally {

      setStatusUpdating(false);

    }

  };


    // =============================================
    // UPDATE RECOVERY STATUS
    // =============================================

    const updateRecoveryStatus = async (newStatus) => {

      if (!selectedRecoveryReport) {
        return;
      }

      try {

        setRecoveryStatusUpdating(true);

        const response = await fetch(
          `http://localhost:5000/api/recovery/${selectedRecoveryReport.id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              recovery_status: newStatus
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to update recovery status"
          );
        }

        setRecoveryReports(
          (previousReports) =>
            previousReports.map(
              (report) =>
                report.id === selectedRecoveryReport.id
                  ? {
                      ...report,
                      recovery_status: newStatus
                    }
                  : report
            )
        );

        setSelectedRecoveryReport({
          ...selectedRecoveryReport,
          recovery_status: newStatus
        });

        setMessage(
          `Recovery report #${selectedRecoveryReport.id} status updated to ${newStatus}`
        );

      } catch (error) {

        console.error(
          "Recovery status update error:",
          error
        );

        setMessage(
          "❌ Failed to update recovery status."
        );

      } finally {

        setRecoveryStatusUpdating(false);

      }

    };


    // =============================================
    // CREATE DISASTER ALERT
    // =============================================

    const createAlert = async (event) => {

    event.preventDefault();

    try {

        setAlertSubmitting(true);
        setAlertMessage("");

        const response = await fetch(
        "http://localhost:5000/api/alerts",
        {
            method: "POST",

            headers: {
            "Content-Type": "application/json"
            },

            body: JSON.stringify(alertForm)
        }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create alert"
        );
        }

        setAlertMessage(
        "✅ Disaster alert published successfully."
        );

        setAlertForm({
        alert_type: "",
        area: "",
        severity: "HIGH",
        message: "",
        instructions: ""
        });

    } catch (error) {

        console.error(
        "Alert creation error:",
        error
        );

        setAlertMessage(
        "❌ Failed to publish disaster alert."
        );

    } finally {

        setAlertSubmitting(false);

    }

    };


  // =============================================
  // SAFE LOCATION MANAGEMENT
  // =============================================

  const fetchSafeLocations = async () => {

    try {

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

    } catch (error) {

      console.error(
        "Safe location fetch error:",
        error
      );

      setSafeLocationMessage(
        "❌ Failed to load safe locations."
      );

    }

  };


  const addSafeLocation = async (event) => {

    event.preventDefault();

    try {

      setSafeLocationSubmitting(true);
      setSafeLocationMessage("");

      const latitude = Number(
        safeLocationForm.latitude
      );

      const longitude = Number(
        safeLocationForm.longitude
      );

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error(
          "Please enter valid latitude and longitude."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/safe-locations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latitude,
            longitude,
            availability: safeLocationForm.availability
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to add safe location"
        );
      }

      setSafeLocationMessage(
        "✅ Safe location added successfully."
      );

      setSafeLocationForm({
        latitude: "",
        longitude: "",
        availability: "Available"
      });

      fetchSafeLocations();

    } catch (error) {

      console.error(
        "Safe location add error:",
        error
      );

      setSafeLocationMessage(
        `❌ ${error.message}`
      );

    } finally {

      setSafeLocationSubmitting(false);

    }

  };


  const updateSafeLocationAvailability = async (id, availability) => {

    try {

      setSafeLocationMessage("");

      const response = await fetch(
        `http://localhost:5000/api/safe-locations/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ availability })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update safe location"
        );
      }

      setSafeLocationMessage(
        `✅ Safe location #${id} marked ${availability}.`
      );

      fetchSafeLocations();

    } catch (error) {

      console.error(
        "Safe location update error:",
        error
      );

      setSafeLocationMessage(
        `❌ ${error.message}`
      );

    }

  };


  const deleteSafeLocation = async (id) => {

    const confirmed = window.confirm(
      `Delete safe location #${id}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      setSafeLocationMessage("");

      const response = await fetch(
        `http://localhost:5000/api/safe-locations/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to delete safe location"
        );
      }

      setSafeLocationMessage(
        `✅ Safe location #${id} deleted.`
      );

      fetchSafeLocations();

    } catch (error) {

      console.error(
        "Safe location delete error:",
        error
      );

      setSafeLocationMessage(
        `❌ ${error.message}`
      );

    }

  };


  // =============================================
  // LOAD REPORTS
  // =============================================

  useEffect(() => {

    fetchReports();
    fetchSafeLocations();
    fetchRecoveryReports();

  }, []);


  // =============================================
  // STATISTICS
  // =============================================

  const criticalCount =
    reports.filter(
      (report) =>
        report.priority === "CRITICAL"
    ).length;

  const highCount =
    reports.filter(
      (report) =>
        report.priority === "HIGH"
    ).length;

  const mediumCount =
    reports.filter(
      (report) =>
        report.priority === "MEDIUM"
    ).length;

  const lowCount =
    reports.filter(
      (report) =>
        report.priority === "LOW"
    ).length;


  // =============================================
  // DISASTER COUNTS
  // =============================================

  const disasterCounts = {};

  reports.forEach((report) => {

    const type =
      report.disaster_type ||
      "Other";

    disasterCounts[type] =
      (disasterCounts[type] || 0) + 1;

  });


  // =============================================
  // DISASTER CHART
  // =============================================

  const disasterChartData = {

    labels:
      Object.keys(disasterCounts),

    datasets: [

      {

        label: "Reports",

        data:
          Object.values(disasterCounts),

        backgroundColor: [
          "#3b82f6",
          "#ef4444",
          "#f97316",
          "#22c55e",
          "#eab308",
          "#8b5cf6",
          "#06b6d4"
        ],

        borderColor: "#ffffff",

        borderWidth: 2

      }

    ]

  };


  // =============================================
  // PRIORITY CHART
  // =============================================

  const priorityChartData = {

    labels: [
      "Critical",
      "High",
      "Medium",
      "Low"
    ],

    datasets: [

      {

        label: "Reports",

        data: [
          criticalCount,
          highCount,
          mediumCount,
          lowCount
        ],

        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e"
        ],

        borderColor: "#ffffff",

        borderWidth: 2

      }

    ]

  };


  // =============================================
  // FORMAT DISASTER
  // =============================================

  const formatDisaster = (type) => {

    if (!type) {
      return "Unknown";
    }

    return (
      type.charAt(0).toUpperCase() +
      type.slice(1)
    );

  };


  // =============================================
  // FORMAT TIME
  // =============================================

  const formatTime = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleString();

  };


  // =============================================
  // PRIORITY CLASS
  // =============================================

  const getPriorityClass = (priority) => {

    if (priority === "CRITICAL") {
      return "critical-text";
    }

    if (priority === "HIGH") {
      return "high-text";
    }

    if (priority === "MEDIUM") {
      return "medium-text";
    }

    return "low-text";

  };


  // =============================================
  // PRIORITY ICON
  // =============================================

  const getPriorityIcon = (priority) => {

    if (priority === "CRITICAL") {
      return "🔴";
    }

    if (priority === "HIGH") {
      return "🟠";
    }

    if (priority === "MEDIUM") {
      return "🟡";
    }

    return "🟢";

  };


  // =============================================
  // STATUS CLASS
  // =============================================

  const getStatusClass = (status) => {

    if (status === "Pending") {
      return "pending";
    }

    if (status === "Team Assigned") {
      return "assigned";
    }

    if (status === "In Progress") {
      return "progress";
    }

    if (status === "Resolved") {
      return "resolved";
    }

    return "pending";

  };


  // =============================================
  // RECENT REPORTS
  // =============================================

  const recentReports =
  [...reports]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 4);


  // =============================================
  // RETURN
  // =============================================

  return (

    <div className="dashboard-layout">


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">
            🚨
          </div>

          <div>

            <strong>
              AapdaSetu
            </strong>

            <span>
              Disaster Response
            </span>

          </div>

        </div>


        <nav className="sidebar-nav">

          <a
            href="/dashboard"
            className="sidebar-link active"
          >
            <span>🏠</span>
            Dashboard
          </a>


          <a
            href="#reports"
            className="sidebar-link"
          >
            <span>📋</span>
            Reports
          </a>


          <a
            href="#incident-map"
            className="sidebar-link"
          >
            <span>🗺️</span>
            Map
          </a>


          <a
            href="#analytics"
            className="sidebar-link"
          >
            <span>📊</span>
            Analytics
          </a>


          <a
            href="#alerts"
            className="sidebar-link"
          >
            <span>🔔</span>
            Alerts
          </a>


          <a
            href="#teams"
            className="sidebar-link"
          >
            <span>👥</span>
            Teams
          </a>

        </nav>


        <div className="sidebar-sos">

          <div className="sos-icon">
            🚨
          </div>

          <strong>
            SOS
          </strong>

          <span>
            Need urgent help?
          </span>

          <button
            onClick={() =>
              window.location.href =
                "/emergency"
            }
          >
            Send SOS
          </button>

        </div>


        <div className="sidebar-footer">

          <p>
            Together we build
            <br />
            a safer tomorrow.
          </p>

        </div>

      </aside>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="dashboard-main">


        {/* =========================================
            HEADER
        ========================================= */}

        <div className="dashboard-topbar">

          <div className="dashboard-brand">

            <div className="brand-icon">
              🚨
            </div>

            <div>

              <p className="dashboard-label">
                AAPDASETU
              </p>

              <h1>
                Emergency Control Room
              </h1>

              <p>
                Real-time disaster response
                & coordination
              </p>

            </div>

          </div>


          <div className="control-status">

            <span className="live-dot"></span>

            <div>

              <strong>
                System Live
              </strong>

              <small>
                Monitoring active
              </small>

            </div>

          </div>

        </div>


        {/* =========================================
            STATISTICS
        ========================================= */}

        <div className="stats-grid">

          <div className="stat-card critical">

            <div className="stat-icon">
              🚨
            </div>

            <div>

              <p>Critical</p>

              <h2>
                {criticalCount}
              </h2>

              <span>
                Immediate response
              </span>

            </div>

          </div>


          <div className="stat-card high">

            <div className="stat-icon">
              ⚠️
            </div>

            <div>

              <p>High Risk</p>

              <h2>
                {highCount}
              </h2>

              <span>
                Priority response
              </span>

            </div>

          </div>


          <div className="stat-card medium">

            <div className="stat-icon">
              🟡
            </div>

            <div>

              <p>Medium</p>

              <h2>
                {mediumCount}
              </h2>

              <span>
                Needs attention
              </span>

            </div>

          </div>


          <div className="stat-card low">

            <div className="stat-icon">
              🟢
            </div>

            <div>

              <p>Low Risk</p>

              <h2>
                {lowCount}
              </h2>

              <span>
                Under monitoring
              </span>

            </div>

          </div>


          <div className="stat-card total">

            <div className="stat-icon">
              📋
            </div>

            <div>

              <p>Total Reports</p>

              <h2>
                {reports.length}
              </h2>

              <span>
                All incidents
              </span>

            </div>

          </div>

        </div>


        {/* =========================================
            ALERT MANAGEMENT
        ========================================= */}

        <div
          className="dashboard-card"
          id="alerts"
          style={{
            marginBottom: "24px"
          }}
        >

          <div className="card-heading">

            <div>

              <h2>
                🚨 Alert Management
              </h2>

              <p>
                Create and publish disaster alerts for citizens
              </p>

            </div>

          </div>


          <form onSubmit={createAlert}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "16px"
              }}
            >

              {/* ALERT TYPE */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Alert Type
                </label>

                <input
                  type="text"
                  placeholder="e.g. Flood Warning"
                  value={alertForm.alert_type}
                  onChange={(event) =>
                    setAlertForm({
                      ...alertForm,
                      alert_type:
                        event.target.value
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "9px",
                    boxSizing: "border-box"
                  }}
                />

              </div>


              {/* AREA */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Affected Area
                </label>

                <input
                  type="text"
                  placeholder="e.g. Gurugram & Nearby Areas"
                  value={alertForm.area}
                  onChange={(event) =>
                    setAlertForm({
                      ...alertForm,
                      area:
                        event.target.value
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "9px",
                    boxSizing: "border-box"
                  }}
                />

              </div>


              {/* SEVERITY */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Severity
                </label>

                <select
                  value={alertForm.severity}
                  onChange={(event) =>
                    setAlertForm({
                      ...alertForm,
                      severity:
                        event.target.value
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "9px",
                    background: "#ffffff",
                    boxSizing: "border-box"
                  }}
                >

                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>

                  <option value="CRITICAL">
                    CRITICAL
                  </option>

                </select>

              </div>


              {/* MESSAGE */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600
                  }}
                >
                  Alert Message
                </label>

                <input
                  type="text"
                  placeholder="Enter warning message"
                  value={alertForm.message}
                  onChange={(event) =>
                    setAlertForm({
                      ...alertForm,
                      message:
                        event.target.value
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #cbd5e1",
                    borderRadius: "9px",
                    boxSizing: "border-box"
                  }}
                />

              </div>

            </div>


            {/* INSTRUCTIONS */}

            <div style={{ marginTop: "16px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 600
                }}
              >
                Safety Instructions
              </label>

              <textarea
                rows="4"
                placeholder="Enter safety instructions separated by |"
                value={alertForm.instructions}
                onChange={(event) =>
                  setAlertForm({
                    ...alertForm,
                    instructions:
                      event.target.value
                  })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "9px",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />

            </div>


            {/* BUTTON + MESSAGE */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "18px"
              }}
            >

              <button
                type="submit"
                disabled={alertSubmitting}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  background: "#e53935",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor:
                    alertSubmitting
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    alertSubmitting
                      ? 0.7
                      : 1
                }}
              >
                {alertSubmitting
                  ? "Publishing..."
                  : "🚨 Publish Alert"}
              </button>


              {alertMessage && (

                <span
                  style={{
                    fontWeight: 600
                  }}
                >
                  {alertMessage}
                </span>

              )}

            </div>

          </form>

        </div>



        {/* =========================================
            SAFE LOCATION MANAGEMENT
        ========================================= */}

        <div
          className="dashboard-card"
          style={{ marginBottom: "24px" }}
        >

          <div className="card-heading">
            <div>
              <h2>📍 Safe Location Management</h2>
              <p>Register and manage currently available safe locations for citizens.</p>
            </div>
          </div>

          <form onSubmit={addSafeLocation}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "16px"
              }}
            >

              <div>
                <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="e.g. 28.4595"
                  value={safeLocationForm.latitude}
                  onChange={(event) =>
                    setSafeLocationForm({
                      ...safeLocationForm,
                      latitude: event.target.value
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="e.g. 77.0266"
                  value={safeLocationForm.longitude}
                  onChange={(event) =>
                    setSafeLocationForm({
                      ...safeLocationForm,
                      longitude: event.target.value
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>
                  Availability
                </label>
                <select
                  value={safeLocationForm.availability}
                  onChange={(event) =>
                    setSafeLocationForm({
                      ...safeLocationForm,
                      availability: event.target.value
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    background: "#ffffff",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "18px",
                flexWrap: "wrap"
              }}
            >

              <button
                type="submit"
                disabled={safeLocationSubmitting}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: safeLocationSubmitting ? "not-allowed" : "pointer",
                  opacity: safeLocationSubmitting ? 0.7 : 1
                }}
              >
                {safeLocationSubmitting ? "Adding..." : "📍 Add Safe Location"}
              </button>

              <button
                type="button"
                onClick={fetchSafeLocations}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  padding: "11px 20px",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                ↻ Refresh
              </button>

              {safeLocationMessage && (
                <span style={{ fontWeight: 600 }}>
                  {safeLocationMessage}
                </span>
              )}

            </div>

          </form>

          <div style={{ marginTop: "26px" }}>
            <h3 style={{ marginBottom: "14px" }}>
              Registered Safe Locations
            </h3>

            {safeLocations.length === 0 ? (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  color: "#64748b"
                }}
              >
                No safe locations registered yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {safeLocations.map((location) => (
                  <div
                    key={location.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      padding: "15px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                      flexWrap: "wrap"
                    }}
                  >

                    <div>
                      <strong>📍 Location #{location.id}</strong>
                      <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Latitude: {Number(location.latitude).toFixed(5)}
                        {"  "}
                        Longitude: {Number(location.longitude).toFixed(5)}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background: location.availability === "Available" ? "#dcfce7" : "#fee2e2",
                        color: location.availability === "Available" ? "#166534" : "#991b1b",
                        fontSize: "13px",
                        fontWeight: 700
                      }}
                    >
                      {location.availability === "Available" ? "🟢 Available" : "🔴 Unavailable"}
                    </span>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                      {location.availability === "Available" ? (
                        <button
                          type="button"
                          onClick={() => updateSafeLocationAvailability(location.id, "Unavailable")}
                          style={{
                            border: "1px solid #f59e0b",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            background: "#fff7ed",
                            color: "#9a3412",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Mark Unavailable
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateSafeLocationAvailability(location.id, "Available")}
                          style={{
                            border: "1px solid #22c55e",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            background: "#f0fdf4",
                            color: "#166534",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Mark Available
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteSafeLocation(location.id)}
                        style={{
                          border: "1px solid #ef4444",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          background: "#fff1f2",
                          color: "#b91c1c",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>


        {/* =========================================
            MAP + ANALYTICS
        ========================================= */}

        <div className="control-room-grid">


          {/* MAP */}

          <div
            className="dashboard-card map-panel"
            id="incident-map"
          >

            <div className="card-heading">

              <div>

                <h2>
                  🗺️ Live Incident Map
                </h2>

                <p>
                  Current emergency locations
                </p>

              </div>


              <button
                className="map-button"
                onClick={() =>
                  setFullMap(true)
                }
              >
                View Full Map
              </button>

            </div>


            <div className="map-placeholder">

              <MapContainer
                center={[
                  20.5937,
                  78.9629
                ]}
                zoom={5}
                style={{
                  height: "100%",
                  width: "100%"
                }}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapViewUpdater
                  reports={reports}
                />


                {reports
                  .filter(
                    (report) =>
                      report.latitude !== null &&
                      report.longitude !== null
                  )
                  .map((report) => {

                    let markerColor =
                      "green";


                    if (
                      report.priority ===
                      "CRITICAL"
                    ) {

                      markerColor =
                        "red";

                    } else if (
                      report.priority ===
                      "HIGH"
                    ) {

                      markerColor =
                        "orange";

                    } else if (
                      report.priority ===
                      "MEDIUM"
                    ) {

                      markerColor =
                        "yellow";

                    }


                    return (

                      <CircleMarker
                        key={report.id}
                        center={[
                          Number(
                            report.latitude
                          ),
                          Number(
                            report.longitude
                          )
                        ]}
                        radius={10}
                        pathOptions={{
                          color:
                            markerColor,

                          fillColor:
                            markerColor,

                          fillOpacity:
                            0.8
                        }}
                      >

                        <Popup>

                          <strong>
                            Report #{report.id}
                          </strong>

                          <br />

                          Priority:
                          {" "}
                          {report.priority}

                          <br />

                          Disaster:
                          {" "}
                          {formatDisaster(
                            report.disaster_type
                          )}

                          <br />

                          Risk Score:
                          {" "}
                          {report.risk_score}

                          <br />

                          Status:
                          {" "}
                          {report.status}

                          <br />

                          Location:
                          <br />

                          {Number(
                            report.latitude
                          ).toFixed(6)}

                          ,
                          {" "}

                          {Number(
                            report.longitude
                          ).toFixed(6)}

                        </Popup>

                      </CircleMarker>

                    );

                  })}

              </MapContainer>

            </div>

          </div>


          {/* RIGHT ANALYTICS */}

          <div
            className="analytics-column"
            id="analytics"
          >


            {/* DISASTER TYPE */}

            <div className="analytics-card">

              <h3>
                Reports by Disaster Type
              </h3>


              {reports.length > 0 ? (

                <div className="chart-container">

                  <Pie
                    data={
                      disasterChartData
                    }

                    options={{
                      responsive: true,

                      maintainAspectRatio:
                        false,

                      plugins: {

                        legend: {
                          position:
                            "bottom",

                          labels: {
                            boxWidth: 12,

                            font: {
                              size: 10
                            }
                          }
                        }

                      }
                    }}
                  />

                </div>

              ) : (

                <p>
                  No reports available yet.
                </p>

              )}

            </div>


            {/* PRIORITY */}

            <div className="analytics-card">

              <h3>
                Reports by Priority
              </h3>


              {reports.length > 0 ? (

                <div className="chart-container">

                  <Doughnut
                    data={
                      priorityChartData
                    }

                    options={{
                      responsive: true,

                      maintainAspectRatio:
                        false,

                      cutout: "60%",

                      plugins: {

                        legend: {
                          position:
                            "bottom",

                          labels: {
                            boxWidth: 12,

                            font: {
                              size: 10
                            }
                          }
                        }

                      }
                    }}
                  />

                </div>

              ) : (

                <p>
                  No reports available yet.
                </p>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            FULL WIDTH RECENT REPORTS
        ================================================= */}

        <div
          className="dashboard-card recent-reports-full"
        >

          <div className="card-heading">

            <div>

              <h2>
                🚨 Recent Reports
              </h2>

              <p>
                Latest emergency incidents
              </p>

            </div>


            <button
              className="view-button"
              onClick={() =>
                document
                  .getElementById("reports")
                  ?.scrollIntoView({
                    behavior: "smooth"
                  })
              }
            >
              View All
            </button>

          </div>


          <div className="recent-reports-list">


            {recentReports.length === 0 ? (

              <p>
                No recent reports.
              </p>

            ) : (

              recentReports.map(
                (report) => (

                  <div
                    className="recent-report-card"
                    key={report.id}
                  >


                    {/* PHOTO */}

                    <div className="recent-report-photo">

                      {report.photo_path ? (

                        <img
                          src={`http://localhost:5000/${report.photo_path.replaceAll("\\", "/")}`}
                          alt="Emergency evidence"
                        />

                      ) : (

                        <div className="no-photo">

                          <span className="no-photo-icon">
                            📷
                          </span>

                          <span>
                            No evidence
                          </span>

                        </div>

                      )}

                    </div>


                    {/* INCIDENT INFO */}

                    <div className="recent-report-info">

                      <strong
                        className={`priority ${getPriorityClass(
                          report.priority
                        )}`}
                      >

                        {getPriorityIcon(
                          report.priority
                        )}

                        {" "}

                        {report.priority}

                      </strong>


                      <h4>

                        {formatDisaster(
                          report.disaster_type
                        )}

                        {" "}
                        Emergency

                      </h4>


                      <p className="recent-description">

                        {report.description ||
                          "No description provided."}

                      </p>


                      <p className="recent-location">

                        📍{" "}

                        {report.latitude !== null &&
                        report.longitude !== null

                          ? `${Number(
                              report.latitude
                            ).toFixed(4)}, ${Number(
                              report.longitude
                            ).toFixed(4)}`

                          : "Location unavailable"}

                      </p>

                    </div>


                    {/* REPORTER */}

                    <div className="recent-report-meta">

                      <p>

                        👤{" "}

                        <strong>
                          {report.name ||
                            "Unknown"}
                        </strong>

                      </p>


                      <p>

                        📞{" "}

                        {report.phone ||
                          "Not available"}

                      </p>


                      <p>

                        👥{" "}

                        {report.people_affected ||
                          0}

                        {" "}
                        people affected

                      </p>


                      <p>

                        🔄{" "}

                        <span
                          className={`status ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>

                      </p>

                    </div>


                    {/* VIEW DETAILS */}

                    <button
                      className="recent-details-button"
                      onClick={() =>
                        setSelectedReport(
                          report
                        )
                      }
                    >
                      View Details
                    </button>


                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =========================================
            EMERGENCY REPORTS TABLE
        ========================================= */}

        <div
          className="dashboard-card"
          id="reports"
        >

          <div className="card-heading">

            <div>

              <h2>
                🚨 Emergency Reports
              </h2>

              <p>
                Critical and recent incidents
                appear first
              </p>

            </div>


            <button
              className="refresh-button"
              onClick={fetchReports}
            >
              ↻ Refresh
            </button>

          </div>


          {loading && (

            <p>
              ⏳ Loading emergency reports...
            </p>

          )}


          {message && (

            <p>
              {message}
            </p>

          )}


          {!loading &&
            !message &&
            reports.length === 0 && (

              <p>
                No emergency reports found.
              </p>

            )}


          {!loading &&
            !message &&
            reports.length > 0 && (

              <div className="report-table">


                <div
                  className="report-row report-header"
                >

                  <span>
                    Priority
                  </span>

                  <span>
                    Disaster
                  </span>

                  <span>
                    Location
                  </span>

                  <span>
                    Affected
                  </span>

                  <span>
                    Status
                  </span>

                  <span>
                    Action
                  </span>

                </div>


                {reports.map(
                  (report) => (

                    <div
                      className="report-row"
                      key={report.id}
                    >

                      <span>

                        <strong
                          className={`priority ${getPriorityClass(
                            report.priority
                          )}`}
                        >

                          {getPriorityIcon(
                            report.priority
                          )}

                          {" "}

                          {report.priority}

                        </strong>

                      </span>


                      <span>

                        {formatDisaster(
                          report.disaster_type
                        )}

                      </span>


                      <span>

                        {report.latitude !== null &&
                        report.longitude !== null

                          ? `${Number(
                              report.latitude
                            ).toFixed(4)}, ${Number(
                              report.longitude
                            ).toFixed(4)}`

                          : "Location unavailable"}

                      </span>


                      <span>

                        {report.people_affected ||
                          0}

                        {" "}
                        people

                      </span>


                      <span>

                        <span
                          className={`status ${getStatusClass(
                            report.status
                          )}`}
                        >

                          {report.status}

                        </span>

                      </span>


                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedReport(
                            report
                          )
                        }
                      >
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

        </div>


        {/* =========================================
            RECOVERY & DAMAGE REPORTS
        ========================================= */}

        <div
          className="dashboard-card"
          style={{ marginBottom: "24px" }}
        >

          <div className="card-heading">

            <div>

              <h2>
                🟢 Recovery & Damage Reports
              </h2>

              <p>
                Damage assessment and post-disaster recovery progress
              </p>

            </div>

            <button
              className="refresh-button"
              onClick={fetchRecoveryReports}
            >
              ↻ Refresh
            </button>

          </div>

          {recoveryLoading ? (

            <p>⏳ Loading recovery reports...</p>

          ) : recoveryReports.length === 0 ? (

            <p>No recovery reports found.</p>

          ) : (

            <div className="report-table">

              <div className="report-row report-header">
                <span>ID</span>
                <span>Disaster</span>
                <span>Damage</span>
                <span>Affected</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {recoveryReports.map((report) => (

                <div
                  className="report-row"
                  key={`recovery-${report.id}`}
                >

                  <span>#{report.id}</span>

                  <span>
                    {formatDisaster(report.disaster_type)}
                  </span>

                  <span>
                    {report.damage_type || "General Damage"}
                  </span>

                  <span>
                    {report.people_affected || 0} people
                  </span>

                  <span>

                    <span
                      className={`status ${
                        report.recovery_status === "Recovered"
                          ? "resolved"
                          : report.recovery_status === "Recovery In Progress"
                            ? "progress"
                            : report.recovery_status === "Relief Provided"
                              ? "assigned"
                              : "pending"
                      }`}
                    >
                      {report.recovery_status || "Reported"}
                    </span>

                  </span>

                  <button
                    className="view-button"
                    onClick={() =>
                      setSelectedRecoveryReport(report)
                    }
                  >
                    View
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* =========================================
            RECENT ACTIVITY
        ========================================= */}

        <div className="dashboard-card">

          <div className="card-heading">

            <div>

              <h2>
                🕒 Recent Activity
              </h2>

              <p>
                Latest emergency reporting activity
              </p>

            </div>

          </div>


          <div className="activity-list">

            {recentReports.length === 0 ? (

              <p>
                No recent activity.
              </p>

            ) : (

              recentReports.map(
                (report) => (

                  <div
                    className="activity-item"
                    key={report.id}
                  >

                    <span>
                      {getPriorityIcon(
                        report.priority
                      )}
                    </span>


                    <div>

                      <strong>
                        New emergency reported
                      </strong>

                      <p>

                        {formatDisaster(
                          report.disaster_type
                        )}

                        {" "}
                        — Report #{report.id}

                      </p>

                    </div>


                    <small>

                      {formatTime(
                        report.created_at
                      )}

                    </small>

                  </div>

                )
              )

            )}

          </div>

        </div>


      </main>


      {/* =========================================
          FULL SCREEN MAP
      ========================================= */}

      {fullMap && (

        <div className="full-map-overlay">


          <div className="full-map-header">

            <div>

              <h2>
                🗺️ Live Incident Map
              </h2>

              <small>
                AapdaSetu Emergency Locations
              </small>

            </div>


            <button
              className="map-button"
              onClick={() =>
                setFullMap(false)
              }
            >
              ✕ Close Map
            </button>

          </div>


          <div className="full-map-container">

            <MapContainer
              center={[
                20.5937,
                78.9629
              ]}
              zoom={5}
              style={{
                height: "100%",
                width: "100%"
              }}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewUpdater
                reports={reports}
              />


              {reports
                .filter(
                  (report) =>
                    report.latitude !== null &&
                    report.longitude !== null
                )
                .map((report) => {

                  let markerColor =
                    "green";


                  if (
                    report.priority ===
                    "CRITICAL"
                  ) {

                    markerColor =
                      "red";

                  } else if (
                    report.priority ===
                    "HIGH"
                  ) {

                    markerColor =
                      "orange";

                  } else if (
                    report.priority ===
                    "MEDIUM"
                  ) {

                    markerColor =
                      "yellow";

                  }


                  return (

                    <CircleMarker
                      key={report.id}

                      center={[
                        Number(
                          report.latitude
                        ),
                        Number(
                          report.longitude
                        )
                      ]}

                      radius={10}

                      pathOptions={{
                        color:
                          markerColor,

                        fillColor:
                          markerColor,

                        fillOpacity:
                          0.8
                      }}
                    >

                      <Popup>

                        <strong>
                          Report #{report.id}
                        </strong>

                        <br />

                        Priority:
                        {" "}
                        {report.priority}

                        <br />

                        Disaster:
                        {" "}
                        {formatDisaster(
                          report.disaster_type
                        )}

                        <br />

                        Risk Score:
                        {" "}
                        {report.risk_score}

                        <br />

                        Status:
                        {" "}
                        {report.status}

                      </Popup>

                    </CircleMarker>

                  );

                })}

            </MapContainer>

          </div>

        </div>

      )}


      {/* =========================================
          RECOVERY REPORT DETAILS MODAL
      ========================================= */}

      {selectedRecoveryReport && (

        <div
          onClick={() => setSelectedRecoveryReport(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            overflowY: "auto"
          }}
        >

          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(900px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.30)",
              color: "#172033"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                padding: "22px 26px",
                borderBottom: "1px solid #e8edf3"
              }}
            >

              <div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "#64748b"
                  }}
                >
                  AAPDASETU RECOVERY
                </p>

                <h2
                  style={{
                    margin: "5px 0 0",
                    fontSize: "28px",
                    lineHeight: 1.15,
                    color: "#14213d"
                  }}
                >
                  Recovery Report #{selectedRecoveryReport.id}
                </h2>

              </div>

              <button
                onClick={() => setSelectedRecoveryReport(null)}
                aria-label="Close recovery report"
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid #dbe2ea",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>

            </div>

            <div style={{ padding: "24px 26px 28px" }}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0"
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "7px"
                    }}
                  >
                    Recovery Status
                  </span>

                  <select
                    value={
                      selectedRecoveryReport.recovery_status ||
                      "Reported"
                    }
                    onChange={(event) =>
                      updateRecoveryStatus(event.target.value)
                    }
                    disabled={recoveryStatusUpdating}
                    style={{
                      width: "100%",
                      padding: "9px 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "9px",
                      background: "#ffffff",
                      color: "#172033",
                      fontWeight: 600,
                      cursor:
                        recoveryStatusUpdating
                          ? "not-allowed"
                          : "pointer"
                    }}
                  >
                    <option value="Reported">Reported</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Relief Provided">
                      Relief Provided
                    </option>
                    <option value="Recovery In Progress">
                      Recovery In Progress
                    </option>
                    <option value="Recovered">Recovered</option>
                  </select>

                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f8fbff",
                    border: "1px solid #dbeafe"
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "7px"
                    }}
                  >
                    Disaster
                  </span>

                  <strong
                    style={{
                      fontSize: "18px",
                      color: "#172554"
                    }}
                  >
                    {formatDisaster(
                      selectedRecoveryReport.disaster_type
                    )}
                  </strong>

                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "7px"
                    }}
                  >
                    People Affected
                  </span>

                  <strong
                    style={{
                      fontSize: "22px",
                      color: "#172033"
                    }}
                  >
                    {selectedRecoveryReport.people_affected || 0}
                  </strong>

                </div>

              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  border: "1px solid #e5eaf0",
                  borderRadius: "15px",
                  background: "#ffffff"
                }}
              >

                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "18px"
                  }}
                >
                  👤 Reporter Information
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "14px"
                  }}
                >

                  {[
                    [
                      "Name",
                      selectedRecoveryReport.name ||
                        "Not provided"
                    ],
                    [
                      "Phone",
                      selectedRecoveryReport.phone ||
                        "Not provided"
                    ],
                    [
                      "Damage Type",
                      selectedRecoveryReport.damage_type ||
                        "General Damage"
                    ]
                  ].map(([label, value]) => (

                    <div
                      key={label}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b",
                          marginBottom: "5px"
                        }}
                      >
                        {label}
                      </span>

                      <strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#1e293b",
                          wordBreak: "break-word"
                        }}
                      >
                        {value}
                      </strong>

                    </div>

                  ))}

                </div>

              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  borderRadius: "15px",
                  background: "#f8fafc",
                  border: "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "18px"
                  }}
                >
                  📝 Damage Description
                </h3>

                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.65,
                    color: "#475569",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {selectedRecoveryReport.damage_description ||
                    "No damage description provided."}
                </p>

              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  borderRadius: "15px",
                  background: "#f5fbff",
                  border: "1px solid #bae6fd"
                }}
              >

                <h3
                  style={{
                    margin: "0 0 13px",
                    fontSize: "18px"
                  }}
                >
                  🆘 Immediate Needs
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#075985",
                    lineHeight: 1.6
                  }}
                >
                  {selectedRecoveryReport.immediate_needs ||
                    "No immediate needs specified."}
                </p>

              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  borderRadius: "15px",
                  background: "#f8fafc",
                  border: "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "18px"
                  }}
                >
                  📍 Location
                </h3>

                {selectedRecoveryReport.latitude !== null &&
                selectedRecoveryReport.longitude !== null ? (

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px"
                    }}
                  >

                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b"
                        }}
                      >
                        Latitude
                      </span>
                      <strong>
                        {Number(
                          selectedRecoveryReport.latitude
                        ).toFixed(6)}
                      </strong>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b"
                        }}
                      >
                        Longitude
                      </span>
                      <strong>
                        {Number(
                          selectedRecoveryReport.longitude
                        ).toFixed(6)}
                      </strong>
                    </div>

                  </div>

                ) : (

                  <p style={{ margin: 0, color: "#64748b" }}>
                    Location unavailable
                  </p>

                )}

              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  borderRadius: "15px",
                  background: "#ffffff",
                  border: "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin: "0 0 13px",
                    fontSize: "18px"
                  }}
                >
                  📷 Damage Evidence
                </h3>

                {selectedRecoveryReport.photo_path ? (

                  <img
                    src={`http://localhost:5000/${selectedRecoveryReport.photo_path.replaceAll("\\", "/")}`}
                    alt="Damage evidence"
                    style={{
                      display: "block",
                      width: "420px",
                      height: "260px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      margin: "0 auto"
                    }}
                  />

                ) : (

                  <div
                    style={{
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      color: "#64748b"
                    }}
                  >
                    <span style={{ fontSize: "30px" }}>📷</span>
                    <span>No photo uploaded</span>
                  </div>

                )}

              </div>

              <div
                style={{
                  marginBottom: "22px",
                  padding: "15px 18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e5eaf0"
                }}
              >

                <strong style={{ marginRight: "8px" }}>
                  🕒 Report Time
                </strong>

                <span style={{ color: "#64748b" }}>
                  {formatTime(
                    selectedRecoveryReport.created_at
                  )}
                </span>

              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >

                <button
                  className="page-btn"
                  onClick={() =>
                    setSelectedRecoveryReport(null)
                  }
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 22px",
                    background: "#16a34a",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Close Recovery Report
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================================
          REPORT DETAILS MODAL
      ========================================= */}

      {selectedReport && (

        <div
          className="report-modal-overlay"

          onClick={() =>
            setSelectedReport(null)
          }

          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background:
              "rgba(15, 23, 42, 0.72)",
            backdropFilter:
              "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            overflowY: "auto"
          }}
        >


          <div
            className="report-modal"

            onClick={(event) =>
              event.stopPropagation()
            }

            style={{
              width:
                "min(900px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.30)",
              color: "#172033"
            }}
          >


            {/* MODAL HEADER */}

            <div
              className="report-modal-header"

              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "20px",
                padding:
                  "22px 26px",
                background: "#ffffff",
                borderBottom:
                  "1px solid #e8edf3"
              }}
            >

              <div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "#64748b"
                  }}
                >
                  AAPDASETU INCIDENT
                </p>


                <h2
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize:
                      "28px",
                    lineHeight:
                      1.15,
                    color:
                      "#14213d"
                  }}
                >
                  Report #
                  {selectedReport.id}
                </h2>

              </div>


              <button
                className="modal-close"

                onClick={() =>
                  setSelectedReport(
                    null
                  )
                }

                aria-label="Close report"

                style={{
                  width: "38px",
                  height: "38px",
                  border:
                    "1px solid #dbe2ea",
                  borderRadius:
                    "10px",
                  background:
                    "#f8fafc",
                  color:
                    "#475569",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer"
                }}
              >
                ✕
              </button>

            </div>


            {/* MODAL BODY */}

            <div
              style={{
                padding:
                  "24px 26px 28px"
              }}
            >


              {/* PRIORITY / RISK / STATUS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "14px",
                  marginBottom:
                    "22px"
                }}
              >


                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "14px",
                    background:
                      "#fff7f7",
                    border:
                      "1px solid #fee2e2"
                  }}
                >

                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginBottom:
                        "7px"
                    }}
                  >
                    Priority
                  </span>


                  <strong
                    className={getPriorityClass(
                      selectedReport.priority
                    )}

                    style={{
                      fontSize:
                        "18px"
                    }}
                  >

                    {getPriorityIcon(
                      selectedReport.priority
                    )}

                    {" "}

                    {selectedReport.priority}

                  </strong>

                </div>


                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "14px",
                    background:
                      "#f8fbff",
                    border:
                      "1px solid #dbeafe"
                  }}
                >

                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginBottom:
                        "7px"
                    }}
                  >
                    Risk Score
                  </span>


                  <strong
                    style={{
                      fontSize:
                        "22px",
                      color:
                        "#172554"
                    }}
                  >
                    {selectedReport.risk_score}
                    /100
                  </strong>

                </div>


                <div
                  style={{
                    padding:
                      "16px",
                    borderRadius:
                      "14px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0"
                  }}
                >

                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginBottom:
                        "7px"
                    }}
                  >
                    Response Status
                  </span>


                  <select
                    value={
                      selectedReport.status
                    }

                    onChange={(event) =>
                      updateStatus(
                        event.target.value
                      )
                    }

                    disabled={
                      statusUpdating
                    }

                    style={{
                      width: "100%",
                      padding:
                        "9px 10px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "9px",
                      background:
                        "#ffffff",
                      color:
                        "#172033",
                      fontWeight:
                        600,
                      cursor:
                        statusUpdating
                          ? "not-allowed"
                          : "pointer"
                    }}
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Team Assigned">
                      Team Assigned
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                  </select>

                </div>

              </div>


              {/* REPORTER INFORMATION */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  border:
                    "1px solid #e5eaf0",
                  borderRadius:
                    "15px",
                  background:
                    "#ffffff"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 16px",
                    fontSize:
                      "18px",
                    color:
                      "#172033"
                  }}
                >
                  👤 Reporter Information
                </h3>


                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap:
                      "14px"
                  }}
                >

                  {[
                    [
                      "Name",
                      selectedReport.name ||
                        "Not provided"
                    ],

                    [
                      "Phone",
                      selectedReport.phone ||
                        "Not provided"
                    ],

                    [
                      "Disaster",
                      formatDisaster(
                        selectedReport.disaster_type
                      )
                    ],

                    [
                      "People Affected",
                      selectedReport.people_affected ||
                        0
                    ],

                    [
                      "Injured",
                      selectedReport.injured ||
                        0
                    ],

                    [
                      "Children",
                      selectedReport.children ||
                        0
                    ],

                    [
                      "Elderly",
                      selectedReport.elderly ||
                        0
                    ],

                    [
                      "Water Level",
                      selectedReport.water_level ||
                        "Not specified"
                    ]

                  ].map(
                    ([label, value]) => (

                      <div
                        key={label}
                        style={{
                          padding:
                            "12px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc"
                        }}
                      >

                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "11px",
                            color:
                              "#64748b",
                            marginBottom:
                              "5px"
                          }}
                        >
                          {label}
                        </span>


                        <strong
                          style={{
                            display:
                              "block",
                            fontSize:
                              "14px",
                            color:
                              "#1e293b",
                            wordBreak:
                              "break-word"
                          }}
                        >
                          {value}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* DESCRIPTION */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  borderRadius:
                    "15px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    fontSize:
                      "18px"
                  }}
                >
                  📝 Description
                </h3>


                <p
                  style={{
                    margin: 0,
                    lineHeight:
                      1.65,
                    color:
                      "#475569",
                    whiteSpace:
                      "pre-wrap"
                  }}
                >
                  {selectedReport.description ||
                    "No description provided."}
                </p>

              </div>


              {/* RISK ANALYSIS */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  borderRadius:
                    "15px",
                  background:
                    "#fffaf5",
                  border:
                    "1px solid #fed7aa"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    fontSize:
                      "18px"
                  }}
                >
                  🧠 Risk Analysis
                </h3>


                <p
                  style={{
                    margin: 0,
                    lineHeight:
                      1.65,
                    color:
                      "#57534e"
                  }}
                >
                  {selectedReport.risk_reason ||
                    "Risk reasoning unavailable."}
                </p>

              </div>


              {/* RESOURCES */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  borderRadius:
                    "15px",
                  background:
                    "#f5fbff",
                  border:
                    "1px solid #bae6fd"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 13px",
                    fontSize:
                      "18px"
                  }}
                >
                  🚑 Recommended Resources
                </h3>


                <div
                  style={{
                    display:
                      "flex",
                    flexWrap:
                      "wrap",
                    gap:
                      "9px"
                  }}
                >

                  {selectedReport.recommended_resources ? (

                    selectedReport
                      .recommended_resources
                      .split(",")
                      .map(
                        (
                          resource,
                          index
                        ) => (

                          <span
                            key={index}
                            style={{
                              padding:
                                "8px 12px",
                              borderRadius:
                                "999px",
                              background:
                                "#e0f2fe",
                              border:
                                "1px solid #bae6fd",
                              color:
                                "#075985",
                              fontSize:
                                "13px",
                              fontWeight:
                                600
                            }}
                          >
                            {resource.trim()}
                          </span>

                        )
                      )

                  ) : (

                    <span
                      style={{
                        color:
                          "#64748b"
                      }}
                    >
                      No resources specified.
                    </span>

                  )}

                </div>

              </div>


              {/* LOCATION */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  borderRadius:
                    "15px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 10px",
                    fontSize:
                      "18px"
                  }}
                >
                  📍 Location
                </h3>


                {selectedReport.latitude !== null &&
                selectedReport.longitude !== null ? (

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "12px"
                    }}
                  >

                    <div>

                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "11px",
                          color:
                            "#64748b"
                        }}
                      >
                        Latitude
                      </span>

                      <strong>
                        {Number(
                          selectedReport.latitude
                        ).toFixed(6)}
                      </strong>

                    </div>


                    <div>

                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "11px",
                          color:
                            "#64748b"
                        }}
                      >
                        Longitude
                      </span>

                      <strong>
                        {Number(
                          selectedReport.longitude
                        ).toFixed(6)}
                      </strong>

                    </div>

                  </div>

                ) : (

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#64748b"
                    }}
                  >
                    Location unavailable
                  </p>

                )}

              </div>


              {/* EVIDENCE */}

              <div
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "20px",
                  borderRadius:
                    "15px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5eaf0"
                }}
              >

                <h3
                  style={{
                    margin:
                      "0 0 13px",
                    fontSize:
                      "18px"
                  }}
                >
                  📷 Evidence
                </h3>


                {selectedReport.photo_path ? (

                  <img
                    src={`http://localhost:5000/${selectedReport.photo_path.replaceAll("\\", "/")}`}

                    alt="Emergency evidence"

                    style={{
                    display: "block",
                    width: "420px",
                    height: "260px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    margin: "0 auto"
                    }}
                  />

                ) : (

                  <div
                    style={{
                      minHeight:
                        "120px",
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius:
                        "12px",
                      background:
                        "#f8fafc",
                      color:
                        "#64748b"
                    }}
                  >

                    <span
                      style={{
                        fontSize:
                          "30px"
                      }}
                    >
                      📷
                    </span>

                    <span>
                      No photo uploaded
                    </span>

                  </div>

                )}

              </div>


              {/* REPORT TIME */}

              <div
                style={{
                  marginBottom:
                    "22px",
                  padding:
                    "15px 18px",
                  borderRadius:
                    "12px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5eaf0"
                }}
              >

                <strong
                  style={{
                    marginRight:
                      "8px"
                  }}
                >
                  🕒 Report Time
                </strong>

                <span
                  style={{
                    color:
                      "#64748b"
                  }}
                >
                  {formatTime(
                    selectedReport.created_at
                  )}
                </span>

              </div>


              {/* CLOSE */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end"
                }}
              >

                <button
                  className="page-btn"

                  onClick={() =>
                    setSelectedReport(
                      null
                    )
                  }

                  style={{
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 22px",
                    background:
                      "#e53935",
                    color:
                      "#ffffff",
                    fontWeight:
                      700,
                    cursor:
                      "pointer"
                  }}
                >
                  Close Report
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Dashboard;