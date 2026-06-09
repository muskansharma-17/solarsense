import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.success === false) {
        alert(data.message);
        return;
      }

      if (data.success === true) {
        alert("Signup Successful");
        navigate("/login");
      }
    } catch(error){
      console.log("FULL ERROR:", error);
      alert(error.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <div className="logo">
          <img src="/src/assets/logo.png" alt="logo" />
          <h2>Solar<span>Sense</span></h2>
        </div>

        <div className="left-text">
          <h1>
            Create Your Account,
            <br />
            Power a <span>Better Tomorrow</span>
          </h1>
          <p>
            Join thousands of homeowners and businesses
            making smarter solar decisions with SolarSense.
          </p>
        </div>

        <div className="feature-list">
          <div className="feature-card">
            <div className="emoji">📈</div>
            <div>
              <h4>Track Savings</h4>
              <p>Monitor your savings, ROI, and system performance.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="emoji">👥</div>
            <div>
              <h4>Manage Projects</h4>
              <p>Organize leads, proposals, and installations easily.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="emoji">🟢</div>
            <div>
              <h4>Trusted Insights</h4>
              <p>Get accurate reports and data-driven insights.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="emoji">🛡️</div>
            <div>
              <h4>Secure & Reliable</h4>
              <p>Enterprise-grade security keeps your data protected.</p>
            </div>
          </div>
        </div>

        <div className="bottom-card">
          <div className="leaf-emoji">🌿</div>
          <div>
            <h4>Building a Sustainable Future</h4>
            <p>Empowering homes and businesses with renewable energy.</p>
          </div>
        </div>
      </div>

      <div className="signup-right">
        <button className="language-btn">🌐 English</button>

        <div className="signup-box">
          <h2>Create Your Account</h2>
          <p className="sub-text">
            Join SolarSense and start your solar journey today.
          </p>

          <form>
            <div className="input-box">
              👤
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="input-box">
              📧
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-box">
              📞
              <input type="text" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="input-box">
              🔒
              <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="input-box">
              🔐
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="check-line">
              <input type="checkbox" defaultChecked />
              <p>
                I agree to the <span>Terms & Conditions</span> and{" "}
                <span>Privacy Policy</span>
              </p>
            </div>

            <button type="button" className="signup-btn" onClick={handleSignup}>
              Sign Up →
            </button>
          </form>

          <div className="divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <div className="social-row">
            <button>🌐 Continue with Google</button>
            <button>🪟 Continue with Microsoft</button>
          </div>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login"><span>Log In</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;