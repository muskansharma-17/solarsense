import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogOut, Upload, MapPin, FileText, Home, BarChart3, FileCheck, ShieldCheck } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "https://solarsense-production.up.railway.app";

function ChangeMapView({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], 13);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SolarDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  const [solarLocation, setSolarLocation] = useState(
    localStorage.getItem("selectedLocation") || "Bhilai, Chhattisgarh, India"
  );

  const [solarLat, setSolarLat] = useState(21.1986);
  const [solarLng, setSolarLng] = useState(81.3395);
  const [billFile, setBillFile] = useState(null);
  const [siteDone, setSiteDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const reverseLocation = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setSolarLocation(data.display_name || "Selected Location");
    } catch {
      setSolarLocation("Selected Location");
    }
  };

  const handleMapClick = async (lat, lng) => {
    setSolarLat(lat);
    setSolarLng(lng);
    await reverseLocation(lat, lng);
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSolarLat(lat);
        setSolarLng(lng);
        await reverseLocation(lat, lng);
      },
      () => alert("Please allow location permission")
    );
  };

  const searchLocation = async () => {
    if (!solarLocation.trim()) return alert("Please enter location");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          solarLocation
        )}`
      );

      const data = await res.json();
      if (!data.length) return alert("Location not found");

      setSolarLat(Number(data[0].lat));
      setSolarLng(Number(data[0].lon));
      setSolarLocation(data[0].display_name);
    } catch {
      alert("Location search failed");
    }
  };

  const uploadBill = async () => {
    if (!billFile) return alert("Please choose bill file first");

    const formData = new FormData();
    formData.append("files", billFile);

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/upload-bills`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Bill upload failed");

      localStorage.setItem("billResult", JSON.stringify(data));
      alert("Bill uploaded successfully");
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const siteAnalysis = async () => {
    try {
      setLoading(true);

      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      const userId =
        storedUser.id ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id");

      const res = await fetch(`${API_BASE}/site-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          address: solarLocation,
          location: solarLocation,
          latitude: solarLat,
          longitude: solarLng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      localStorage.setItem("siteResult", JSON.stringify(data));
      localStorage.setItem("selectedLocation", solarLocation);
      setSiteDone(true);

      alert("Site analysis completed");
    } catch (err) {
      alert(err.message || "Site analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sd-page">
      <header className="sd-topbar">
        <div className="sd-logo">
          <img src="/assets/logo.png" alt="SolarSense" />
          <h2>
            Solar<span>Sense</span>
          </h2>
        </div>

        <div className="sd-user">
          <p>Hi, {userName}</p>
          <button onClick={logout}>
            Logout <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="sd-main">
        <aside className="sd-left">
          <div className="sd-house-card">
            <img src="/assets/solar house 2.png" alt="Solar House" />

            <div className="sd-house-text">
              <h1>Calculate Your Solar Savings</h1>
              <p>
                Bill upload karein, location select karein aur apna solar ROI,
                subsidy aur monthly saving dekhein.
              </p>
            </div>
          </div>

          <div className="sd-next-card">
            <h3>What Happens Next?</h3>

            <div className="sd-next-item">
              <div className="sd-icon">
                <FileText size={19} />
              </div>
              <div>
                <h4>1. Bill Analysis</h4>
                <p>Electricity usage automatically read hoga.</p>
              </div>
            </div>

            <div className="sd-next-item">
              <div className="sd-icon">
                <Home size={19} />
              </div>
              <div>
                <h4>2. Site Analysis</h4>
                <p>Location ke hisaab se rooftop potential check hoga.</p>
              </div>
            </div>

            <div className="sd-next-item">
              <div className="sd-icon">
                <BarChart3 size={19} />
              </div>
              <div>
                <h4>3. Solar Result</h4>
                <p>System size, subsidy, ROI aur saving milegi.</p>
              </div>
            </div>

            <div className="sd-next-item">
              <div className="sd-icon">
                <FileCheck size={19} />
              </div>
              <div>
                <h4>4. Proposal</h4>
                <p>Final solar proposal download kar sakte ho.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="sd-right">
          <div className="sd-card-row">
            <div className="sd-card">
              <div className="sd-card-title">
                <span>1</span>
                <div>
                  <h2>Upload Electricity Bill</h2>
                  <p>PDF, JPG ya PNG bill upload karein.</p>
                </div>
              </div>

              <div className="sd-upload-box">
                <div className="sd-upload-circle">
                  <Upload size={30} />
                </div>

                <h4>{billFile ? billFile.name : "No file selected"}</h4>

                <label className="sd-file-label">
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setBillFile(e.target.files[0])}
                  />
                </label>
              </div>

              <button className="sd-green-btn" onClick={uploadBill} disabled={loading}>
                <Upload size={15} />
                {loading ? "Processing..." : "Upload Bill"}
              </button>
            </div>

            <div className="sd-card">
              <div className="sd-card-title">
                <span>2</span>
                <div>
                  <h2>Select Location</h2>
                  <p>Search karein ya map par click karein.</p>
                </div>
              </div>

              <div className="sd-search-row">
                <input
                  value={solarLocation}
                  onChange={(e) => setSolarLocation(e.target.value)}
                  placeholder="Enter city or area"
                />
                <button onClick={searchLocation}>Search</button>
                <button onClick={handleCurrentLocation}>Current</button>
              </div>

              <div className="sd-map-box">
                <MapContainer
                  center={[solarLat, solarLng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <ChangeMapView lat={solarLat} lng={solarLng} />
                  <MapClickHandler onMapClick={handleMapClick} />

                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  <Marker position={[solarLat, solarLng]}>
                    <Popup>{solarLocation}</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="sd-location-box">
                <MapPin size={20} />
                <div>
                  <h4>{solarLocation}</h4>
                  <p>
                    Lat: {solarLat.toFixed(4)} | Long: {solarLng.toFixed(4)}
                  </p>
                </div>
              </div>

              <button className="sd-green-btn" onClick={siteAnalysis} disabled={loading}>
                <BarChart3 size={15} />
                {siteDone ? "Site Analysis Done" : "Site Analysis"}
              </button>
            </div>
          </div>

          <div className="sd-ready-card">
            <div className="sd-ready-icon">⚡</div>

            <div>
              <h3>Ready to see your savings?</h3>
              <p>
                Bill upload aur site analysis complete hone ke baad result dekhein.
              </p>
            </div>

            <button onClick={() => navigate("/result-dashboard")}>
              Calculate My Solar Savings →
            </button>
          </div>

          <div className="sd-safe-text">
            <ShieldCheck size={15} />
            <span>Your data is safe and secure with us. We never share your information.</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SolarDashboard;