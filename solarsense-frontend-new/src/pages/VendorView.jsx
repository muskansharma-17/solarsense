import "./VendorView.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Star,
  Zap,
  Briefcase,
  Award,
  Search,
  RotateCcw,
  Heart,
  ArrowRight,
  ArrowLeft,
  UserCircle,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  BadgeCheck,
  Factory,
  PanelsTopLeft,
} from "lucide-react";

import Logo from "../assets/logo.png";
import SolarEvs from "../assets/solarevs.png";

function VendorView() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minKw, setMinKw] = useState("");
  const [minProjects, setMinProjects] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const userName = localStorage.getItem("userName") || "User";

  const normalizeVendors = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.vendors)) return data.vendors;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadAllVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://solarsense-production.up.railway.app/vendors");
      const data = await res.json();
      setVendors(normalizeVendors(data));
    } catch (error) {
      console.log(error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        city: city.trim(),
        min_rating: minRating || 0,
        min_kw: minKw || 0,
        min_projects: minProjects || 0,
        sort_by: sortBy,
        order: "desc",
      });

      const res = await fetch(
        `https://solarsense-production.up.railway.app/vendors/filter?${params.toString()}`
      );

      const data = await res.json();
      setVendors(normalizeVendors(data));
    } catch (error) {
      console.log(error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllVendors();
  }, []);

  const resetFilters = () => {
    setCity("");
    setMinRating("");
    setMinKw("");
    setMinProjects("");
    setSortBy("rating");
    loadAllVendors();
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    
    <div className="vendor-view-page">
      <header className="vv-navbar">
        <div className="vv-logo">
          <img src={Logo} alt="SolarSense" />
          <h2>
            Solar<span>Sense</span>
          </h2>
        </div>

        <div className="vv-right-head">
          <div className="vv-user">
            <span>👤</span>
            <span>Hi, {userName}</span>
          </div>

          <button className="vv-header-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} />
            Back
          </button>
        </div>
      </header>

      {selectedVendor ? (
        <main className="vv-main">
          <button
            className="vv-page-back"
            onClick={() => setSelectedVendor(null)}
          >
            <ArrowLeft size={18} />
            Back to Vendors
          </button>

          <section className="vv-detail-card">
            <div className="vv-detail-top">
              <div className="vv-detail-icon">
                <Building2 size={75} />
              </div>

              <div>
                <h1>{selectedVendor.company_name}</h1>
                <p>
                  <MapPin size={16} />
                  {selectedVendor.city} • {selectedVendor.service_area}
                </p>
              </div>
            </div>

            <div className="vv-detail-grid">
              <div className="vv-detail-box">
                <UserCircle />
                <span>Vendor Name</span>
                <h4>{selectedVendor.vendor_name || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <Phone />
                <span>Phone</span>
                <h4>{selectedVendor.phone || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <Mail />
                <span>Email</span>
                <h4>{selectedVendor.email || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <Globe />
                <span>Website</span>
                <h4>{selectedVendor.website || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <Star />
                <span>Rating</span>
                <h4>{selectedVendor.google_rating || selectedVendor.rating || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <Zap />
                <span>Installed Capacity</span>
                <h4>{selectedVendor.total_installed_kw || 0}+ kW</h4>
              </div>

              <div className="vv-detail-box">
                <Briefcase />
                <span>Completed Projects</span>
                <h4>{selectedVendor.completed_projects || 0}+</h4>
              </div>

              <div className="vv-detail-box">
                <Award />
                <span>Warranty</span>
                <h4>{selectedVendor.warranty_years || 0} Years</h4>
              </div>

              <div className="vv-detail-box">
                <ShieldCheck />
                <span>MNRE Approved</span>
                <h4>{selectedVendor.mnre_approved ? "Yes" : "No"}</h4>
              </div>

              <div className="vv-detail-box">
                <BadgeCheck />
                <span>DISCOM Approved</span>
                <h4>{selectedVendor.discom_approved ? "Yes" : "No"}</h4>
              </div>

              <div className="vv-detail-box">
                <Factory />
                <span>Experience Type</span>
                <h4>{selectedVendor.experience_type || "N/A"}</h4>
              </div>

              <div className="vv-detail-box">
                <PanelsTopLeft />
                <span>Panel Brands</span>
                <h4>{selectedVendor.panel_brands || "N/A"}</h4>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="vv-main">
          <section className="vv-hero">
            <div>
              <h1>Find Trusted Solar Vendors</h1>
              <p>Compare, choose and install with confidence</p>
            </div>

            <img src={SolarEvs} alt="Solar" />
          </section>

          <section className="vv-filter-card">
            <div className="vv-field city-field">
              <label>City</label>
              <div className="vv-input-box">
                <MapPin size={16} />
                <input
                  type="text"
                  placeholder="Search city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="vv-field">
              <label>Rating</label>
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </div>

            <div className="vv-field">
              <label>Installed kW</label>
              <select value={minKw} onChange={(e) => setMinKw(e.target.value)}>
                <option value="">Any</option>
                <option value="100">100+</option>
                <option value="500">500+</option>
                <option value="1000">1000+</option>
                <option value="3000">3000+</option>
              </select>
            </div>

            <div className="vv-field">
              <label>Projects</label>
              <select value={minProjects} onChange={(e) => setMinProjects(e.target.value)}>
                <option value="">Any</option>
                <option value="10">10+</option>
                <option value="50">50+</option>
                <option value="100">100+</option>
                <option value="300">300+</option>
              </select>
            </div>

            <div className="vv-field">
              <label>Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rating">Rating</option>
                <option value="kw">Installed kW</option>
                <option value="projects">Projects</option>
                <option value="city">City</option>
              </select>
            </div>

            <div className="vv-filter-buttons">
              <button className="vv-search-btn" onClick={fetchVendors}>
                <Search size={16} />
                Search
              </button>

              <button className="vv-reset-btn" onClick={resetFilters}>
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </section>

          <section className="vv-result-top">
            <h3>{vendors.length} Vendors Found</h3>
          </section>

          <section className="vv-list">
            {loading ? (
              <div className="vv-empty">Loading vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="vv-empty">No vendors found</div>
            ) : (
              vendors.map((vendor, index) => (
                <div className="vv-card" key={vendor.id || index}>
                  <div className="vv-card-icon">
                    <Building2 size={58} />
                  </div>

                  <div className="vv-card-content">
                    <div className="vv-card-head">
                      <div>
                        <div className="vv-title-row">
                          <h2>{vendor.company_name}</h2>

                          {vendor.mnre_approved && (
                            <span className="vv-badge green">MNRE Approved</span>
                          )}

                          {vendor.discom_approved && (
                            <span className="vv-badge blue">DISCOM Approved</span>
                          )}
                        </div>

                        <p className="vv-location">
                          {vendor.city} <b>•</b> {vendor.service_area}
                        </p>
                      </div>

                      <button
                        className={`vv-like ${liked[vendor.id] ? "liked" : ""}`}
                        onClick={() => toggleLike(vendor.id)}
                      >
                        <Heart size={21} fill={liked[vendor.id] ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="vv-stats">
                      <div className="vv-stat">
                        <div className="vv-round yellow">
                          <Star size={18} fill="currentColor" />
                        </div>
                        <div>
                          <h4>{vendor.google_rating || vendor.rating}</h4>
                          <p>Rating</p>
                        </div>
                      </div>

                      <div className="vv-stat">
                        <div className="vv-round green">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h4>{vendor.total_installed_kw}+ kW</h4>
                          <p>Installed</p>
                        </div>
                      </div>

                      <div className="vv-stat">
                        <div className="vv-round blue">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <h4>{vendor.completed_projects}+</h4>
                          <p>Projects</p>
                        </div>
                      </div>

                      <div className="vv-stat last">
                        <div className="vv-round purple">
                          <Award size={18} />
                        </div>
                        <div>
                          <h4>{vendor.warranty_years} Years</h4>
                          <p>Warranty</p>
                        </div>
                      </div>
                    </div>

                    <p className="vv-brands">
                      <strong>Panel Brands:</strong> {vendor.panel_brands}
                    </p>
                  </div>

                  <div className="vv-actions">
                    <button
                      className="vv-details"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      View Details
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default VendorView;