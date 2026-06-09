import "./Home.css";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Home as HomeIcon,
  Info,
  Workflow,
  Sparkles,
  IndianRupee,
  Newspaper,
  Phone,
  User,
  Store,
  FileText,
  Calculator,
  BarChart3,
  Download,
  Leaf,
  BatteryCharging,
  Zap,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="brand" onClick={() => scrollToSection("home")}>
          <img src="/assets/logo.png" alt="SolarSense" className="brand-logo" />
          <span className="brand-text">
            Solar<span>Sense</span>
          </span>
        </div>

        <div className="nav-links">
          <button onClick={() => scrollToSection("home")}><HomeIcon size={16} /> Home</button>
          <button onClick={() => scrollToSection("about")}><Info size={16} /> About</button>
          <button onClick={() => scrollToSection("how")}><Workflow size={16} /> How It Works</button>
          <button onClick={() => scrollToSection("features")}><Sparkles size={16} /> Features</button>
          <button onClick={() => scrollToSection("pricing")}><IndianRupee size={16} /> Pricing</button>
          <button onClick={() => scrollToSection("blog")}><Newspaper size={16} /> Blog</button>
          <button onClick={() => scrollToSection("contact")}><Phone size={16} /> Contact</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-left">
          <div className="tag"><Sun size={15} /> Smart Solar Planning Made Simple</div>

          <h1>
            Smarter Solar Decisions,
            <br />
            <span>Better Tomorrow</span>
          </h1>

          <p>
            Upload your electricity bill and get a personalised solar solution
            with savings, ROI, system size, and trusted vendor recommendations.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/login")}>
              Calculate Your Solar Savings →
            </button>
            <button className="outline-btn">▷ Watch Demo</button>
          </div>

          <div className="trusted">
            <div className="avatars">
              <span></span><span></span><span></span><b>+2K</b>
            </div>
            <div>
              <strong>Trusted by 2,000+ Homeowners</strong>
              <p>Across India</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img src="/assets/solar house.png" alt="Solar home" />

          <div className="metric card-a">
            <IndianRupee size={18} />
            <small>Monthly Savings</small>
            <h3>₹ 4,560</h3>
            <p>+18.5% vs Last Month</p>
          </div>

          <div className="metric card-b">
            <Zap size={18} />
            <small>System Size</small>
            <h3>6.2 kW</h3>
            <p>Recommended</p>
          </div>

          <div className="metric card-c">
            <BarChart3 size={18} />
            <small>ROI</small>
            <h3>4.8 Years</h3>
            <p>Excellent Return</p>
          </div>

          <div className="metric card-d">
            <BatteryCharging size={18} />
            <small>Battery Status</small>
            <h3>78%</h3>
            <p>Charging • 2h 15m left</p>
          </div>

          <div className="metric card-e">
            <Leaf size={18} />
            <small>CO₂ Reduction</small>
            <h3>6.2 Tonnes/Year</h3>
            <p>You’re making a difference!</p>
          </div>
        </div>
      </section>

      <section className="home-login-card hover-pop" onClick={() => navigate("/login")}>
        <div className="circle-icon"><User size={28} /></div>
        <div className="home-login-content">
          <h2>Login / Sign Up</h2>
          <p>Choose user, vendor, or admin account to continue</p>
        </div>
        <button>Get Started →</button>
      </section>

      <section className="vendor-card hover-pop" onClick={() => navigate("/vendor-register")}>
        <img src="/assets/vendor.png" alt="Solar vendor" />
        <div>
          <h2><Store size={22} /> Are You a Solar Vendor?</h2>
          <p>Register your company on SolarSense and get quality solar leads from your service area.</p>
        </div>
        <button>Register as Vendor →</button>
      </section>

      <section className="stats-card" id="about">
        <div><h2>₹25Cr+</h2><p>Total Savings<br />Generated</p></div>
        <div><h2>15M+ <span>kWh</span></h2><p>Clean Energy<br />Generated</p></div>
        <div><h2>10K+</h2><p>Happy<br />Homeowners</p></div>
        <div><h2>50K+</h2><p>Bills Analyzed<br />Monthly</p></div>
      </section>

      <section className="solution" id="how">
        <div className="step hover-pop">
          <FileText size={30} />
          <h3>Bill Analysis</h3>
          <p>Smart OCR extracts your electricity units and bill details.</p>
        </div>

        <div className="step hover-pop">
          <Calculator size={30} />
          <h3>Solar Calculation</h3>
          <p>Get accurate system size, cost, subsidy, and savings.</p>
        </div>

        <div className="step hover-pop">
          <BarChart3 size={30} />
          <h3>ROI Report</h3>
          <p>View monthly generation, payback period, and bill comparison.</p>
        </div>

        <div className="step hover-pop">
          <Download size={30} />
          <h3>Get Proposal</h3>
          <p>Download a professional solar proposal instantly.</p>
        </div>
      </section>

      <section className="partners" id="features">
        <h2>Our Trusted Solar Partners</h2>
        <div>
          <b>Adani Solar</b>
          <b>TATA POWER</b>
          <b>WAAREE</b>
          <b>Vikram Solar</b>
          <b>LOOM SOLAR</b>
          <b>RenewSys</b>
          <b>SERVOTEC</b>
        </div>
      </section>
    </div>
  );
}

export default Home;