import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  User,
  Users,
  Calendar,
  Zap,
  IndianRupee,
  Clock,
  TrendingUp,
  Home,
  Sun,
  Leaf,
  Factory,
  Car,
  BatteryCharging,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  CloudSun,
  TreePine,
  FileText,
  Download,
} from "lucide-react";
import "./ProposalViewer.css";

const API_BASE = "https://solarsense-production.up.railway.app";

function ProposalViewer() {
  const proposalRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/proposal-output`)
      .then((res) => {
        if (!res.ok) throw new Error("Proposal API error");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const formatCur = (val) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);


  const downloadPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pages = proposalRef.current.querySelectorAll(".a4-page");

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      foreignObjectRendering: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    if (i > 0) pdf.addPage();

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );
  }

  pdf.save("SolarSense_Proposal.pdf");
};

 
  if (loading) return <h2 className="proposal-msg">Loading Proposal...</h2>;
  if (!data) return <h2 className="proposal-msg">No proposal data found</h2>;

  const monthlyGen = data.monthly_generation || [];
  const monthlyIrr = data.monthly_irradiation || [];

  return (
    <div className="proposal-viewer">
      <div className="proposal-topbar">
        <h2>SolarSense Proposal Preview</h2>
        <button onClick={downloadPDF}>
          <Download size={18} /> Download PDF
        </button>
      </div>

      <div ref={proposalRef} className="proposal-document">
        <section className="a4-page cover-page">
          <Header data={data} />

          <div className="cover-grid">
            <div>
              <h1>
                SOLAR <br />
                <span>PROPOSAL</span>
              </h1>
              <p className="tagline">Power a Better Tomorrow</p>

              <Info
                icon={<User size={22} />}
                label="Prepared For"
                value={data.customer_name}
                sub={data.location}
              />

              <Info
                icon={<Users size={22} />}
                label="Prepared By"
                value="SolarSense Team"
              />

              <Info
                icon={<Calendar size={22} />}
                label="Proposal Date"
                value={new Date().toLocaleDateString("en-IN")}
              />
            </div>

            <div className="hero-image">
              <img src="/assets/solar-big.png" alt="Solar House" />
            </div>
          </div>

          <h3 className="section-small-title">Project Highlights</h3>

          <div className="highlight-grid">

            <Card
              icon={<Zap size={23} />}
              title="System Size DC"
              value={`${data.system_size_dc} kWp`}
            />
            <Card
              icon={<Zap size={23} />}
              title="System Size AC"
              value={`${data.system_size_ac} kW`}
            />
            <Card
              icon={<IndianRupee size={23} />}
              title="Estimated Savings"
              value={`₹ ${formatCur(data.estimated_savings)}`}
            />
            <Card
              icon={<Clock size={23} />}
              title="Payback Period"
              value={`${data.payback_period} Years`}
            />

          </div>

          <div className="green-footer-banner">
            <Leaf size={32} />
            <div>
              <b>Thank you for choosing SolarSense.</b>
              <p>Together, let's build a cleaner and greener tomorrow.</p>
            </div>
          </div>

          <Footer page="1" />
        </section>

        <section className="a4-page index-page">
          <Header data={data} />
          <h2 className="green-title">INDEX</h2>

          <div className="index-list">
            {[
              ["Executive Summary", <FileText size={20} />],
              ["System Overview", <Home size={20} />],
              ["Financial Summary", <IndianRupee size={20} />],
              ["Weather Report", <CloudSun size={20} />],
              ["Generation Report", <TrendingUp size={20} />],
              ["Environment Report", <Leaf size={20} />],
            ].map((item, index) => (
              <div className="index-row" key={index}>
                <span className="index-no">{index + 1}</span>
                <span className="index-icon">{item[1]}</span>
                <b>{item[0]}</b>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
              </div>
            ))}
          </div>

          <img
            className="bottom-illustration"
            src="/assets/solarevs.png"
            alt="Solar Village"
          />

          <Footer page="2" />
        </section>

        <section className="a4-page">
          <Header data={data} />

          <h2>
            <span className="badge">2</span> SYSTEM OVERVIEW
          </h2>

          <div className="two-col">
            <div className="detail-table">
              <Row label="System Size DC" value={`${data.system_size_dc} kWp`} />
              <Row label="System Size AC" value={`${data.system_size_ac} kW`} />
              <Row label="System Type" value="On-Grid" />
              <Row
                label="Estimated Annual Generation"
                value={`${formatCur(data.annual_generation)} kWh`}
              />
              <Row label="Expected System Life" value="25 Years" />
              <Row
                label="Warranty"
                value="25 Years Performance / 5 Years Product"
              />
            </div>

            <img
              className="side-img"
              src="/assets/rooftop.png"
              alt="Solar Rooftop"
            />
          </div>

          <BarChartBox
            title="Monthly Generation (kWh)"
            values={monthlyGen}
            valueKey="value"
            labelKey="month"
          />

          <div className="note-box">
            <Home size={20} />
            Your system is designed to deliver maximum savings and performance.
          </div>

          <Footer page="3" />
        </section>

        <section className="a4-page">
          <Header data={data} />

          <h2>
            <span className="badge">3</span> FINANCIAL SUMMARY
          </h2>

          <div className="detail-table">
            <Row
              label="Total Investment After Subsidy"
              value={`₹ ${formatCur(data.total_investment)}`}
            />
            <Row
              label="Estimated Annual Savings"
              value={`₹ ${formatCur(data.estimated_savings)}`}
            />
            <Row label="Payback Period" value={`${data.payback_period} Years`} />
            <Row
              label="Return on Investment 25 Years"
              value={`₹ ${formatCur(data.roi_25_years)}`}
            />
            <Row label="Internal Rate of Return IRR" value={`${data.irr}%`} />
          </div>

          <div className="saving-box">
            <div className="save-card">
              <small>You Save</small>
              <h2>₹ {formatCur(data.estimated_savings)}</h2>
              <p>Every Year</p>
              <TrendingUp size={60} />
            </div>

            <div className="finance-list">
              <p>
                <Home size={20} /> Total Investment: ₹{" "}
                {formatCur(data.total_investment)}
              </p>
              <p>
                <IndianRupee size={20} /> Net Savings in 25 Years: ₹{" "}
                {formatCur(data.roi_25_years)}
              </p>
              <p>
                <Clock size={20} /> Payback Period: {data.payback_period} Years
              </p>
            </div>
          </div>

          <Footer page="4" />
        </section>

        <section className="a4-page">
          <Header data={data} />

          <h2>
            <span className="badge">4</span> WEATHER REPORT
          </h2>

          <div className="highlight-grid three">
            <Card
              icon={<Sun size={24} />}
              title="Avg. Sun Hours"
              value={`${data.avg_sun_hours} Hours / Day`}
            />
            <Card
              icon={<CloudSun size={24} />}
              title="Avg. Temperature"
              value={`${data.avg_temperature}°C`}
            />
            <Card
              icon={<BatteryCharging size={24} />}
              title="Solar Irradiation"
              value={`${data.solar_irradiation} kWh/m²/day`}
            />
          </div>

          <BarChartBox
            title="Monthly Solar Irradiation"
            values={monthlyIrr}
            valueKey="v"
            labelKey="m"
          />

          <div className="note-box">
            <Sun size={20} />
            Good solar potential in your area.
          </div>

          <h2 className="mt">
            <span className="badge">5</span> GENERATION REPORT
          </h2>

          <div className="highlight-grid three">
            <Card
              icon={<TrendingUp size={24} />}
              title="Annual Generation"
              value={`${formatCur(data.annual_generation)} kWh`}
            />
            <Card
              icon={<Zap size={24} />}
              title="Daily Average"
              value={`${(data.annual_generation / 365).toFixed(1)} kWh`}
            />
            <Card
              icon={<BatteryCharging size={24} />}
              title="Specific Yield"
              value={`${(
                data.annual_generation /
                365 /
                data.system_size_dc
              ).toFixed(1)} kWh/kWp/day`}
            />
          </div>

          <BarChartBox
            title="Monthly Generation (kWh)"
            values={monthlyGen}
            valueKey="value"
            labelKey="month"
          />

          <Footer page="5" />
        </section>

        <section className="a4-page environment-page">
          <Header data={data} />

          <h2>
            <span className="badge">6</span> ENVIRONMENT REPORT
          </h2>

          <div className="env-table">
            <EnvRow
              icon={<CloudSun size={23} />}
              label="CO₂ Emission Reduced"
              value={`${data.co2_reduced} Tonnes / Year`}
            />
            <EnvRow
              icon={<TreePine size={23} />}
              label="Equivalent to Planting"
              value={`${data.trees_saved} Trees / Year`}
            />
            <EnvRow
              icon={<Factory size={23} />}
              label="Coal Saved"
              value={`${data.coal_saved} Tonnes / Year`}
            />
            <EnvRow
              icon={<Car size={23} />}
              label="Equivalent to Not Driving"
              value={`${formatCur(data.km_not_driving)} Km / Year`}
            />
            <EnvRow
              icon={<Zap size={23} />}
              label="Energy from Clean Source"
              value={`${data.clean_energy}%`}
            />
            <EnvRow
              icon={<Leaf size={23} />}
              label="A Greener Tomorrow"
              value="For you & your family"
            />
          </div>

          <img
            className="bottom-illustration env-img"
            src="/assets/solarevs.png"
            alt="Environment"
          />

          <div className="next-box">
            <h3>NEXT STEPS</h3>
            <p>
              <CheckCircle size={16} /> Review the proposal
            </p>
            <p>
              <CheckCircle size={16} /> Schedule a site visit
            </p>
            <p>
              <CheckCircle size={16} /> Confirm the proposal
            </p>
            <p>
              <CheckCircle size={16} /> We will handle the rest
            </p>
          </div>

          <div className="support-box">
            <h3>OUR SUPPORT</h3>
            <p>
              <Phone size={15} /> 24/7 Customer Support
            </p>
            <p>
              <Mail size={15} /> support@solarsense.com
            </p>
            <p>
              <Globe size={15} /> www.solarsense.com
            </p>
          </div>

          <div className="green-footer-banner last">
            <Leaf size={30} />
            <b>Together, let's power a sustainable and cleaner future.</b>
          </div>

          <Footer page="6" />
        </section>
      </div>
    </div>
  );
}

function Header({ data }) {
  return (
    <div className="page-header">
      <div className="logo-wrap">
        <img src="/assets/logo.png" alt="SolarSense" />
        <div className="logo">
          Solar<span>Sense</span>
        </div>
      </div>

      <div className="proposal-id">
        <small>Proposal ID:</small>
        <b>SS/{data.id || "001"}</b>
      </div>
    </div>
  );
}

function Info({ icon, label, value, sub }) {
  return (
    <div className="info">
      <div className="info-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        {sub && <p>{sub}</p>}
      </div>
    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <small>{title}</small>
      <b>{value}</b>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="table-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function EnvRow({ icon, label, value }) {
  return (
    <div className="env-row">
      <div className="env-icon">{icon}</div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function BarChartBox({ title, values = [], valueKey, labelKey }) {
  const max = Math.max(...values.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div className="chart-box">
      <h3>{title}</h3>

      <div className="bar-chart">
        {values.map((item, index) => {
          const value = Number(item[valueKey]) || 0;

          return (
            <div className="bar-item" key={index}>
              <b>{value}</b>
              <div
                className="bar"
                style={{ height: `${(value / max) * 135}px` }}
              ></div>
              <small>{item[labelKey]}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Footer({ page }) {
  return <div className="page-no">Page {page}</div>;
}

export default ProposalViewer;