import "./VendorRegister.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Link2,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Award,
  CheckCircle,
  Lock,
} from "lucide-react";

function VendorRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    company_name: "",
    vendor_name: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    linkedin_url: "",
    city: "",
    service_area: "",
    total_installed_kw: "",
    completed_projects: "",
    experience_type: "",
    google_reviews_count: "",
    mnre_approved: false,
    discom_approved: false,
    warranty_years: "",
    panel_brands: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      google_rating: 0.0,
      rating: 0.0,
      total_installed_kw: formData.total_installed_kw ? parseFloat(formData.total_installed_kw) : 0,
      completed_projects: formData.completed_projects ? parseInt(formData.completed_projects) : 0,
      google_reviews_count: formData.google_reviews_count ? parseInt(formData.google_reviews_count) : 0,
      warranty_years: formData.warranty_years ? parseInt(formData.warranty_years) : 0,
    };

    try {
      const response = await fetch("https://solarsense-production.up.railway.app/register-vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        alert("Registration Successful");
        navigate("/login", { state: { role: "vendor" } });
      } else {
        let errorMessage = "Registration Failed";
        if (data.detail && Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = JSON.stringify(data);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.log("Registration Error:", error);
      alert("Something went wrong");
    }

  };

  return (
    <div className="vendor-page">
      <div className="vendor-left">
        <div className="logo">
          <img src="/assets/logo.png" alt="logo" />
          <h2>
            Solar<span>Sense</span>
          </h2>
        </div>

        <div className="left-text">
          <h1>
            Join SolarSense
            <br />
            <span>Vendor Network</span>
          </h1>
          <p>
            Connect with customers, receive installation leads,
            and grow your solar business across India.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-card">
            <Award size={20} />
            <div>
              <h4>Verified Vendor Badge</h4>
              <p>Build trust and credibility.</p>
            </div>
          </div>

          <div className="feature-card">
            <Briefcase size={20} />
            <div>
              <h4>More Business Leads</h4>
              <p>Get high-quality solar leads.</p>
            </div>
          </div>

          <div className="feature-card">
            <Star size={20} />
            <div>
              <h4>Showcase Projects</h4>
              <p>Display your completed work.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="vendor-right">
        <div className="vendor-box">
          <h2>Vendor Registration</h2>
          <p className="sub-text">
            Register your company to become a SolarSense Partner
          </p>

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              Company Information
            </div>

            <div className="input-row">
              <div className="input-box">
                <Building2 size={16} />
                <input
                  type="text"
                  name="company_name"
                  placeholder="Company Name"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <User size={16} />
                <input
                  type="text"
                  name="vendor_name"
                  placeholder="Vendor Name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-box">
                <Mail size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <Lock size={16} />
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-box">
              <Phone size={16} />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
              />
            </div>

            <div className="section-title">
              Online Presence
            </div>

            <div className="input-row">
              <div className="input-box">
                <Globe size={16} />
                <input
                  type="text"
                  name="website"
                  placeholder="Website"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <Link2 size={16} />
                <input
                  type="text"
                  name="linkedin_url"
                  placeholder="LinkedIn URL"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="section-title">
              Location Details
            </div>

            <div className="input-row">
              <div className="input-box">
                <MapPin size={16} />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <MapPin size={16} />
                <input
                  type="text"
                  name="service_area"
                  placeholder="Service Area"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="section-title">
              Business Details
            </div>

            <div className="input-row">
              <div className="input-box">
                <Briefcase size={16} />
                <input
                  type="number"
                  name="total_installed_kw"
                  placeholder="Total Installed KW"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <CheckCircle size={16} />
                <input
                  type="number"
                  name="completed_projects"
                  placeholder="Completed Projects"
                  onChange={handleChange}
                />
              </div>
            </div>

            <select
              name="experience_type"
              className="select-box"
              onChange={handleChange}
            >
              <option value="">Select Experience Type</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
              <option>Residential + Commercial</option>
            </select>

            <div className="section-title">
              Ratings & Approvals
            </div>

            <div className="input-box">
              <Star size={16} />
              <input
                type="number"
                name="google_reviews_count"
                placeholder="Google Reviews"
                onChange={handleChange}
              />
            </div>

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="mnre_approved"
                  onChange={handleChange}
                />
                MNRE Approved
              </label>

              <label>
                <input
                  type="checkbox"
                  name="discom_approved"
                  onChange={handleChange}
                />
                DISCOM Approved
              </label>
            </div>

            <div className="section-title">
              Warranty & Products
            </div>

            <div className="input-row">
              <div className="input-box">
                <ShieldCheck size={16} />
                <input
                  type="number"
                  name="warranty_years"
                  placeholder="Warranty Years"
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <Award size={16} />
                <input
                  type="text"
                  name="panel_brands"
                  placeholder="Panel Brands"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="register-btn">
              Register Vendor →
            </button>
          </form>

          <p className="login-link">
            Already Registered?{" "}
            <Link to="/login" state={{ role: "vendor" }}>
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VendorRegister;