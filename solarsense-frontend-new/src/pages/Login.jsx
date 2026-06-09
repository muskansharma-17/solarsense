import "./Login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  User,
  Building2,
  Shield,
  Mail,
  Lock,
  TrendingUp,
  Users,
  Star,
  ShieldCheck,
  Headphones,
  Leaf,
  Globe,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role || "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const roleData = {
    user: {
      title: "Login to SolarSense",
      subtitle: "Choose your role and sign in to continue",
      button: "Login →",
      api: "https://solarsense-production.up.railway.app/login",
      redirect: "/dashboard",
    },
    vendor: {
      title: "Vendor Login",
      subtitle: "Access your vendor dashboard and manage leads",
      button: "Login as Vendor →",
      api: "https://solarsense-production.up.railway.app/vendor/login",
      redirect: "/vendor-list",
    },
    admin: {
      title: "Admin Login",
      subtitle: "Manage vendors, users and platform activities",
      button: "Login as Admin →",
      api: "https://solarsense-production.up.railway.app/admin/login",
      redirect: "/admin-dashboard",
    },
  };

  const handleLogin = async () => {
    const loginData = {
      email: email.trim().toLowerCase(),
      password: password,
    };

    try {
      const response = await fetch(roleData[role].api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      console.log("Login Response:", data);

      if (response.ok && (data.success === true || data.success === undefined)) {
        localStorage.setItem("userName", data.name || data.vendor_name || "User");
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("role", role);

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user_id,
            name: data.name || data.vendor_name || "User",
            email: data.email,
          })
        );

        alert("Login Successful");

        navigate(roleData[role].redirect);
      } else {
        let errorMessage = "Login Failed";
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
      console.log("Login Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo">
          <img src="/assets/logo.png" alt="logo" />
          <h2>
            Solar<span>Sense</span>
          </h2>
        </div>

        <div className="left-text">
          <h1>
            Welcome to SolarSense
            <br />
            <span>Smarter Solar</span> Decisions,
            <br />
            Better Tomorrow
          </h1>

          <p>
            Login to access your dashboard and manage savings, leads, projects,
            and performance seamlessly.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-card">
            <div className="icon-box">
              <TrendingUp size={22} />
            </div>
            <div>
              <h4>Track Savings</h4>
              <p>Monitor savings, ROI, and system performance.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <Users size={22} />
            </div>
            <div>
              <h4>Manage Leads & Projects</h4>
              <p>Organize leads, proposals, and installations.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <Star size={22} />
            </div>
            <div>
              <h4>Trusted Insights</h4>
              <p>Get accurate reports and data-driven insights.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4>Secure & Reliable</h4>
              <p>Enterprise-grade security for your data.</p>
            </div>
          </div>
        </div>

        <div className="bottom-card">
          <div className="icon-box bottom-icon">
            <Leaf size={26} />
          </div>

          <div>
            <h4>Powering a Sustainable Future</h4>
            <p>
              Join thousands of homeowners and businesses switching to clean
              solar energy.
            </p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <button className="language-btn">
          <Globe size={15} />
          English
        </button>

        <div className="login-box">
          <h2>{roleData[role].title}</h2>

          <p className="sub-text">{roleData[role].subtitle}</p>

          <div className="role-row">
            <button
              type="button"
              className={`role-btn ${role === "user" ? "active-role" : ""}`}
              onClick={() => setRole("user")}
            >
              <User size={17} />
              User
            </button>

            <button
              type="button"
              className={`role-btn ${role === "vendor" ? "active-role" : ""}`}
              onClick={() => setRole("vendor")}
            >
              <Building2 size={17} />
              Vendor
            </button>

            <button
              type="button"
              className={`role-btn ${role === "admin" ? "active-role" : ""}`}
              onClick={() => setRole("admin")}
            >
              <Shield size={17} />
              Admin
            </button>
          </div>

          <form>
            <div className="input-label">
              {role === "admin" ? "Admin Email Address" : "Email Address"}
            </div>

            <div className="input-box">
              <Mail size={17} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="password-row">
              <div className="input-label">Password</div>
              <span className="forgot">Forgot Password?</span>
            </div>

            <div className="input-box">
              <Lock size={17} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="remember-row">
              <label>
                <input type="checkbox" />
                Remember Me
              </label>
            </div>

            <button type="button" className="login-btn" onClick={handleLogin}>
              {roleData[role].button}
            </button>
          </form>

          <div className="divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <div className="social-row">
            <button>
              <Globe size={15} />
              Continue with Google
            </button>

            <button>
              <Building2 size={15} />
              Continue with Microsoft
            </button>
          </div>

          {role === "vendor" ? (
            <p className="signup-text">
              New Vendor?{" "}
              <Link to="/vendor-register">
                <span>Register Here</span>
              </Link>
            </p>
          ) : (
            <p className="signup-text">
              Don’t have an account?{" "}
              <Link to="/signup">
                <span>Sign Up</span>
              </Link>
            </p>
          )}
        </div>

        <div className="trust-row">
          <div className="trust-card">
            <div className="trust-icon">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h4>Secure Login</h4>
              <p>Your data is protected</p>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon">
              <Headphones size={21} />
            </div>
            <div>
              <h4>24/7 Support</h4>
              <p>We’re here to help</p>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon">
              <Star size={21} />
            </div>
            <div>
              <h4>Trusted Platform</h4>
              <p>Used by solar professionals</p>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon">
              <Globe size={21} />
            </div>
            <div>
              <h4>Made in India</h4>
              <p>Empowering clean energy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;