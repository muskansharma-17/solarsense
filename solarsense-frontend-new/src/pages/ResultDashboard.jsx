import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, LogOut } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  LineChart,
  Line,
  LabelList,
} from "recharts";

import {
  MapPin,
  Bell,
  Download,
  Sun,
  Battery,
  TrendingUp,
  Activity,
  Zap,
  Leaf,
  Wind,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Edit3,
  Users,
  FileText,
} from "lucide-react";

import "./ResultDashboard.css";

const API_BASE = "http://127.0.0.1:8000";

function ResultDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userName = localStorage.getItem("userName") || "User";
  const selectedLocation =
    localStorage.getItem("selectedLocation") ||
    storedUser.location ||
    "Bhilai, Chhattisgarh, India";

  const cleanNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const match = String(val).match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
  };

  const shortMonth = (month) => {
    if (!month) return "";
    return String(month).slice(0, 3);
  };

  const formatCur = (val) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(val || 0);

  useEffect(() => {
    const loadData = async () => {
      try {

        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        const userId = storedUser.id || localStorage.getItem("user_id");

        const billRes = await fetch(`${API_BASE}/calculate-solar-from-bill?user_id=${userId}`);

        
        const billData = await billRes.json();

        if (!billData.success) {
          alert(billData.message || "Please upload bills first");
          setLoading(false);
          return;
        }

        const solarKw = cleanNumber(
          billData.recommended_solar_capacity ||
            billData.recommended_solar_kw ||
            billData.recommended_kw
        );

        const monthlySaving = cleanNumber(billData.monthly_saving);
        const yearlySaving = cleanNumber(billData.yearly_saving);
        const finalCost = cleanNumber(billData.final_cost_after_subsidy);
        const paybackPeriod = cleanNumber(billData.payback_period);
        const estMonthlyBill = monthlySaving > 0 ? monthlySaving * 2 : 6000;

        const genRes = await fetch(
          `${API_BASE}/generation-chart?solar_kw=${solarKw}`
        );

        const genData = genRes.ok ? await genRes.json() : {};

        const monthlyGeneration = Array.isArray(genData.chart_data)
          ? genData.chart_data.map((item) => ({
              month: shortMonth(item.month),
              value: cleanNumber(item.monthly_generation),
            }))
          : [];

        const yearlyProduction =
          cleanNumber(genData.yearly_generation) ||
          cleanNumber(billData.yearly_production);

        const billChartRes = await fetch(
          `${API_BASE}/bill-chart?monthly_bill=${estMonthlyBill}&solar_capacity_kw=${solarKw}`
        );

        const billChartData = billChartRes.ok
          ? await billChartRes.json()
          : { chart_data: [] };

        const monthlyBillComparison =
          billChartData.chart_data?.map((item) => ({
            month: shortMonth(item.month),
            withoutSolar: cleanNumber(item.bill_without_solar),
            withSolar: cleanNumber(item.bill_after_solar),
          })) || [];

        const cashFlowData = [];
        let curCash = -finalCost;

        for (let i = 0; i <= 25; i += 5) {
          cashFlowData.push({ year: i, cash: curCash });
          curCash += yearlySaving * 5;
        }

        setData({
          customerName: userName,
          location: selectedLocation,

          topMetrics: {
            dcSize: solarKw,
            acSize: Number((solarKw * 0.8).toFixed(1)),
            monthlySavings: monthlySaving,
            roiYears: paybackPeriod,
            totalInvestment: finalCost,
          },

          siteAnalysis: {
            totalRoofArea: Math.ceil(solarKw * 3 * 20),
            usableRoofArea: Math.ceil(solarKw * 3 * 20 * 0.8),
            recommendedArea: Math.ceil(solarKw * 3 * 20 * 0.75),
            roofType: "RCC Roof",
            tiltAngle: 16,
            orientation: "South",
            shadowImpact: "Low",
            suitability: "Low shading and good sunlight exposure detected.",
          },

          financials: {
            annualSavings: yearlySaving,
            paybackPeriod,
            systemLife: 25,
            irr: finalCost
              ? Number(((yearlySaving / finalCost) * 100).toFixed(1))
              : 0,
            totalInvestment: finalCost,
            netSavings25: yearlySaving * 25,
            cashFlowData,
          },

          weather: {
            avgSunHours: 5.6,
            avgTemp: 32,
            irradiation: 4.8,

            monthlyIrradiation: [
              { m: "Jan", v: 4.2 },
              { m: "Feb", v: 4.6 },
              { m: "Mar", v: 5.1 },
              { m: "Apr", v: 5.3 },
              { m: "May", v: 5.0 },
              { m: "Jun", v: 4.6 },
              { m: "Jul", v: 4.3 },
              { m: "Aug", v: 4.1 },
              { m: "Sep", v: 4.0 },
              { m: "Oct", v: 4.2 },
              { m: "Nov", v: 4.1 },
              { m: "Dec", v: 4.3 },
            ],

            monthlyGeneration,
            monthlyBillComparison,

            genStats: {
              annual: yearlyProduction,
              daily: yearlyProduction
                ? Number((yearlyProduction / 365).toFixed(1))
                : 0,
              yield:
                solarKw && yearlyProduction
                  ? Number((yearlyProduction / 365 / solarKw).toFixed(1))
                  : 0,
            },

            billStats: {
              avgMonthly: estMonthlyBill,
              afterSolar: cleanNumber(
                billChartData.chart_data?.[0]?.bill_after_solar
              ),
              saving:
                cleanNumber(billChartData.chart_data?.[0]?.solar_saving) ||
                monthlySaving,
            },
          },

          equipment: {
            panels: Math.ceil(solarKw * 3),
            specs: "540Wp Each",
            stringSize: Math.ceil(solarKw * 3),
            stringsCount: Math.max(1, Math.ceil((solarKw * 3) / 10)),
            phase: solarKw > 5 ? "3 Phase" : "1 Phase",
            voltage: 230,
            current: Math.round(solarKw * 4.35),
            bomList: [
              {
                name: "Solar Panel",
                details: `${Math.ceil(solarKw * 3)} x 540Wp Monocrystalline`,
                icon: "☀️",
              },
              {
                name: "Inverter",
                details: `${Math.round(solarKw * 0.8)} kW On-Grid Inverter`,
                icon: "🔌",
              },
              {
                name: "Mounting Structure",
                details: "GI Structure Tilt Mount",
                icon: "📐",
              },
              {
                name: "DC Cable",
                details: "4 sq.mm Copper",
                icon: "⚡",
              },
              {
                name: "AC Cable",
                details: "6 sq.mm Copper",
                icon: "🔌",
              },
              {
                name: "AC/DC Protection",
                details: "AC/DC MCB With SPD",
                icon: "🛡️",
              },
            ],
          },

          impact: {
            co2: yearlyProduction
              ? Number((yearlyProduction * 0.00082).toFixed(1))
              : 0,
            trees: yearlyProduction
              ? Math.round(yearlyProduction * 0.00082 * 45)
              : 0,
            coal: yearlyProduction
              ? Number((yearlyProduction * 0.0007).toFixed(1))
              : 0,
            driving: yearlyProduction ? Math.round(yearlyProduction * 0.25 * 15) : 0,
          },
        });
      } catch (error) {
        console.error("API ERROR:", error);
        alert("API Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLocation, userName]);

  const tooltipMoney = (value, name) => {
    if (name === "withoutSolar")
      return [`₹ ${formatCur(value)}`, "Without Solar"];
    if (name === "withSolar") return [`₹ ${formatCur(value)}`, "With Solar"];
    if (name === "cash") return [`₹ ${formatCur(value)}`, "Cash Flow"];
    if (name === "value") return [`${formatCur(value)} kWh`, "Generation"];
    if (name === "v") return [`${value}`, "Irradiation"];
    return [value, name];
  };

  const axisStyle = {
    fontSize: 10,
    fill: "#64748b",
    fontWeight: 600,
  };

  const handleDownloadProposal = async () => {
    try {
      const proposalData = {
        customer_name: userName,
        location: data.location,
        system_size_ac: data.topMetrics.acSize,
        system_size_dc: data.topMetrics.dcSize,
        estimated_savings: data.financials.annualSavings,
        payback_period: data.financials.paybackPeriod,
        roi_25_years: data.financials.netSavings25,
        annual_generation: data.weather.genStats.annual,
        monthly_generation: data.weather.monthlyGeneration,
        avg_sun_hours: data.weather.avgSunHours,
        avg_temperature: data.weather.avgTemp,
        solar_irradiation: data.weather.irradiation,
        monthly_irradiation: data.weather.monthlyIrradiation,
        total_investment: data.financials.totalInvestment,
        irr: data.financials.irr,
        co2_reduced: data.impact.co2,
        trees_saved: data.impact.trees,
        coal_saved: data.impact.coal,
        km_not_driving: data.impact.driving,
        clean_energy: 100,
      };

      const res = await fetch(`${API_BASE}/save-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      if (!res.ok) {
        throw new Error("Proposal save API failed");
      }

      navigate("/ProposalViewer");
    } catch (error) {
      console.error("PROPOSAL ERROR:", error);
      alert("Proposal save nahi hua: " + error.message);
    }
  };

  const changePage = (page) => (e) => {
    e.preventDefault();
    setActivePage(page);
  };

  if (loading || !data) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Loading SolarSense Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-app">
      <aside className="sidebar">
        <div className="brand-logo">
          <img
            src="/src/assets/logo.png"
            alt="SolarSense"
            className="logo-brand-img"
            onError={(e) => {
              e.target.src =
                "https://cdn-icons-png.flaticon.com/512/1000/1000823.png";
            }}
          />
          <h2>
            Solar<span>Sense</span>
          </h2>
        </div>

        <nav className="nav-menu">
          <a
            href="#"
            className={activePage === "dashboard" ? "active" : ""}
            onClick={changePage("dashboard")}
          >
            <Activity size={17} /> Dashboard
          </a>

          <span className="nav-label">ANALYSIS</span>

          <a
            href="#"
            className={activePage === "analysis" ? "active" : ""}
            onClick={changePage("analysis")}
          >
            <TrendingUp size={17} /> My Analysis
          </a>

          <a
            href="#"
            className={activePage === "proposal" ? "active" : ""}
            onClick={changePage("proposal")}
          >
            <FileText size={17} /> My Proposals
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/vendor-view");
            }}
          >
            <Users size={17} /> Vendor List
          </a>

          <a
            href="#"
            className={activePage === "requests" ? "active" : ""}
            onClick={changePage("requests")}
          >
            <MessageCircle size={17} /> My Requests
          </a>
        </nav>

        <div className="help-box">
          <div className="help-icon">
            <HelpCircle size={22} />
          </div>
          <h4>Need Help?</h4>
          <p>Our solar experts are here to help you.</p>
          <button className="btn-outline-green">Talk to Expert</button>
        </div>
      </aside>

      <main className="main-wrapper">
        <header className="top-header">
          <div className="location-strip">
            <MapPin size={17} /> {data.location}
            <button className="change-loc-btn">
              <Edit3 size={13} /> Change Location
            </button>
          </div>

          <div className="user-strip">
            <button className="btn-download" onClick={handleDownloadProposal}>
              <Download size={15} /> Download Proposal
            </button>


            <div className="user-profile-card">
              <div className="user-left">
                <span>👤</span>
                <span>Hi, {userName}</span>
             </div>

              <button className="logout-btn" onClick={() => {  
                localStorage.clear(); navigate("/login");
               }}>
                Logout
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activePage === "proposal" && (
            <section className="dashboard-sec card-panel">
              <div className="sec-title">
                <h2>My Solar Proposal</h2>
              </div>

              <div className="proposal-summary-box">
                <h3>Proposal Ready</h3>
                <p>
                  Your solar proposal is ready with site analysis, ROI,
                  generation chart, bill comparison and environmental impact.
                </p>

                <div className="top-metrics-grid small-grid">
                  <div className="metric-box">
                    <span>DC Size</span>
                    <h2>{data.topMetrics.dcSize} kWp</h2>
                  </div>

                  <div className="metric-box">
                    <span>AC Size</span>
                    <h2>{data.topMetrics.acSize} kW</h2>
                  </div>

                  <div className="metric-box">
                    <span>Annual Savings</span>
                    <h2>₹ {formatCur(data.financials.annualSavings)}</h2>
                  </div>

                  <div className="metric-box">
                    <span>Payback</span>
                    <h2>{data.financials.paybackPeriod} Years</h2>
                  </div>
                </div>

                <button className="btn-download" onClick={handleDownloadProposal}>
                  <Download size={16} /> Download Proposal
                </button>
              </div>
            </section>
          )}

          {activePage === "requests" && (
            <section className="dashboard-sec card-panel">
              <div className="sec-title">
                <h2>My Requests</h2>
              </div>
              <div className="empty-box">No request submitted yet.</div>
            </section>
          )}

          {(activePage === "dashboard" || activePage === "analysis") && (
            <>
              <div className="top-metrics-grid">
                <div className="metric-box box-green">
                  <div className="m-head">
                    <div className="icon-bg bg-blue-light">
                      <Sun size={17} />
                    </div>
                    <span>DC Size</span>
                  </div>
                  <div className="m-val-row">
                    <h2>
                      {data.topMetrics.dcSize} <span>kWp</span>
                    </h2>
                    <span className="badge-optimized">Optimized</span>
                  </div>
                  <p>Preferred System Size</p>
                </div>

                <div className="metric-box">
                  <div className="m-head">
                    <div className="icon-bg bg-gray">
                      <Battery size={17} />
                    </div>
                    <span>AC Size</span>
                  </div>
                  <h2>
                    {data.topMetrics.acSize} <span>kW</span>
                  </h2>
                  <p>Output System Size</p>
                </div>

                <div className="metric-box">
                  <div className="m-head">
                    <div className="icon-bg bg-green-light">
                      <Zap size={17} />
                    </div>
                    <span>Monthly Savings</span>
                  </div>
                  <div className="m-val-row">
                    <h2>₹ {formatCur(data.topMetrics.monthlySavings)}</h2>
                    <span className="savings-badge-percent">Save</span>
                  </div>
                  <p>Estimated saving</p>
                </div>

                <div className="metric-box">
                  <div className="m-head">
                    <div className="icon-bg bg-blue-light">
                      <Activity size={17} />
                    </div>
                    <span>ROI</span>
                  </div>
                  <div className="m-val-row">
                    <h2>
                      {data.topMetrics.roiYears} <span>Years</span>
                    </h2>
                    <span className="badge-excellent">Good</span>
                  </div>
                  <p>Payback period</p>
                </div>

                <div className="metric-box">
                  <div className="m-head">
                    <div className="icon-bg bg-yellow-light">
                      <strong className="coin-symbol">₹</strong>
                    </div>
                    <span>Total Investment</span>
                  </div>
                  <h2>₹ {formatCur(data.topMetrics.totalInvestment)}</h2>
                  <p>After Subsidy</p>
                </div>
              </div>

              <section className="dashboard-sec">
                <div className="sec-title">
                  <h2>1. Site Analysis</h2>
                </div>

                <div className="card-panel site-panel">
                  <div className="site-img-box">
                    <img
                      src="/src/assets/rooftop.png"
                      alt="Solar rooftop"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                    <button className="map-btn">
                      <MapPin size={15} /> View on Map
                    </button>
                  </div>

                  <div className="site-data">
                    <div className="site-stats-grid">
                      <div>
                        <span>Total Roof Area</span>
                        <h3>{data.siteAnalysis.totalRoofArea} sq.ft</h3>
                      </div>
                      <div>
                        <span>Usable Roof Area</span>
                        <h3>{data.siteAnalysis.usableRoofArea} sq.ft</h3>
                      </div>
                      <div>
                        <span>Recommended Area</span>
                        <h3>{data.siteAnalysis.recommendedArea} sq.ft</h3>
                      </div>
                      <div>
                        <span>Roof Type</span>
                        <h3>{data.siteAnalysis.roofType}</h3>
                      </div>
                      <div>
                        <span>Tilt Angle</span>
                        <h3>{data.siteAnalysis.tiltAngle}°</h3>
                      </div>
                      <div>
                        <span>Orientation</span>
                        <h3>{data.siteAnalysis.orientation}</h3>
                      </div>
                    </div>

                    <div className="success-banner">
                      <ShieldCheck size={22} />
                      <div>
                        <h4>Great! Your roof is suitable for solar installation.</h4>
                        <p>{data.siteAnalysis.suitability}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="dashboard-sec">
                <div className="sec-title">
                  <h2>2. ROI & Financial Summary</h2>
                </div>

                <div className="card-panel roi-panel">
                  <div className="roi-left-wrap">
                    <div className="roi-left">
                      <div className="savings-card">
                        <div className="savings-text">
                          <span>You Save</span>
                          <h1>₹ {formatCur(data.financials.annualSavings)}</h1>
                          <p>Every Year</p>
                        </div>

                        <div className="sparkline-wrap">
                          <ResponsiveContainer width="100%" height={70}>
                            <LineChart data={data.financials.cashFlowData}>
                              <Tooltip formatter={tooltipMoney} />
                              <Line
                                type="monotone"
                                dataKey="cash"
                                stroke="#119c39"
                                strokeWidth={3}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="roi-bars">
                        <div className="bar-group">
                          <div className="bar-row">
                            <span className="bar-label">Payback Period</span>
                            <strong>{data.financials.paybackPeriod} Years</strong>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: "45%" }} />
                          </div>
                        </div>

                        <div className="bar-group">
                          <div className="bar-row">
                            <span className="bar-label">System Life</span>
                            <strong>{data.financials.systemLife} Years</strong>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: "70%" }} />
                          </div>
                        </div>

                        <div className="bar-group">
                          <div className="bar-row">
                            <span className="bar-label">IRR</span>
                            <strong>{data.financials.irr}%</strong>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: "68%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="roi-bottom-grid">
                      <div className="fin-box">
                        <span>Total Investment After Subsidy</span>
                        <h3>₹ {formatCur(data.financials.totalInvestment)}</h3>
                      </div>

                      <div className="fin-box">
                        <span>Net Savings in 25 Years</span>
                        <h3>₹ {formatCur(data.financials.netSavings25)}</h3>
                      </div>

                      <div className="fin-box">
                        <span>Return on Investment</span>
                        <h3 className="text-green">
                          {data.financials.paybackPeriod} Years
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="roi-right">
                    <h4>Cash Flow Over 25 Years</h4>

                    <ResponsiveContainer width="100%" height={210}>
                      <AreaChart data={data.financials.cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eaf0f6" />
                        <XAxis dataKey="year" tick={axisStyle} />
                        <YAxis
                          tick={axisStyle}
                          tickFormatter={(val) => `${val / 100000}L`}
                        />
                        <Tooltip formatter={tooltipMoney} />
                        <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                        <Area
                          type="monotone"
                          dataKey="cash"
                          stroke="#119c39"
                          strokeWidth={3}
                          fill="#dcfce7"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="dashboard-sec">
                <div className="sec-title">
                  <h2>3. Weather, Generation & Bill Analysis</h2>
                </div>

                <div className="charts-grid">
                  <div className="chart-box">
                    <h4>Weather Report</h4>

                    <div className="w-stats">
                      <div>
                        <span>Avg. Sun Hours</span>
                        <h3>{data.weather.avgSunHours}</h3>
                        <small>Hours / Day</small>
                      </div>
                      <div>
                        <span>Avg. Temp</span>
                        <h3>{data.weather.avgTemp}°C</h3>
                        <small>Annual</small>
                      </div>
                      <div>
                        <span>Irradiation</span>
                        <h3>{data.weather.irradiation}</h3>
                        <small>kWh/m²/day</small>
                      </div>
                    </div>

                    <span className="chart-subtitle">
                      Monthly Solar Irradiation
                    </span>

                    <div className="chart-wrapper-h">
                      <ResponsiveContainer width="100%" height={145}>
                        <BarChart
                          data={data.weather.monthlyIrradiation}
                          margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="m"
                            interval={0}
                            tick={axisStyle}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip formatter={tooltipMoney} />
                          <Bar
                            dataKey="v"
                            fill="#a7f3d0"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={13}
                          >
                            <LabelList
                              dataKey="v"
                              position="top"
                              style={{ fontSize: 9, fill: "#64748b" }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-box">
                    <h4>Generation Chart</h4>

                    <span className="chart-subtitle">
                      Monthly Generation (kWh)
                    </span>

                    <div className="generation-chart-area">
                      {data.weather.monthlyGeneration.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.weather.monthlyGeneration}
                            margin={{ top: 15, right: 5, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="month"
                              interval={0}
                              tick={axisStyle}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis tick={axisStyle} />
                            <Tooltip formatter={tooltipMoney} />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={18}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="no-chart-data">
                          Generation chart data empty hai.
                        </div>
                      )}
                    </div>

                    <div className="chart-stats-row">
                      <div>
                        <span>Annual Generation</span>
                        <h4>{formatCur(data.weather.genStats.annual)} kWh</h4>
                      </div>
                      <div>
                        <span>Daily Average</span>
                        <h4>{data.weather.genStats.daily} kWh</h4>
                      </div>
                      <div>
                        <span>Specific Yield</span>
                        <h4>{data.weather.genStats.yield}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="chart-box">
                    <h4>Bill Chart</h4>

                    <div className="bill-header-row">
                      <span className="chart-subtitle">
                        Monthly Electricity Bill
                      </span>
                      <div className="legend">
                        <span>
                          <i className="dot gray"></i> Without
                        </span>
                        <span>
                          <i className="dot green"></i> With
                        </span>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart
                        data={data.weather.monthlyBillComparison}
                        margin={{ top: 10, left: -20, right: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="month"
                          interval={0}
                          tick={axisStyle}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={axisStyle}
                          tickFormatter={(val) => `${val / 1000}K`}
                        />
                        <Tooltip formatter={tooltipMoney} />
                        <Bar
                          dataKey="withoutSolar"
                          fill="#e2e8f0"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={7}
                        />
                        <Bar
                          dataKey="withSolar"
                          fill="#10b981"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={7}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="chart-stats-row">
                      <div>
                        <span>Average Bill</span>
                        <h4>₹ {formatCur(data.weather.billStats.avgMonthly)}</h4>
                      </div>
                      <div>
                        <span>After Solar</span>
                        <h4>₹ {formatCur(data.weather.billStats.afterSolar)}</h4>
                      </div>
                      <div className="saving-badge-container">
                        <span>You Save</span>
                        <h4 className="text-green-bold">
                          ₹ {formatCur(data.weather.billStats.saving)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="bottom-two">
                <section className="dashboard-sec card-panel">
                  <div className="sec-title">
                    <h2>4. System Size & Equipment Details</h2>
                  </div>

                  <div className="equipment-complete-grid">
                    <div className="eq-box bg-green-light">
                      <span>DC Size</span>
                      <h3>{data.topMetrics.dcSize} kWp</h3>
                      <p>Input Size</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>Solar Panels</span>
                      <h3>{data.equipment.panels}</h3>
                      <p>{data.equipment.specs}</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>String Size</span>
                      <h3>{data.equipment.stringSize}</h3>
                      <p>Panels/String</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>Strings</span>
                      <h3>{data.equipment.stringsCount}</h3>
                      <p>Configuration</p>
                    </div>
                    <div className="eq-box bg-blue-light-card">
                      <span>AC Size</span>
                      <h3>{data.topMetrics.acSize} kW</h3>
                      <p>Output Size</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>Supply Phase</span>
                      <h3>{data.equipment.phase}</h3>
                      <p>Supply Type</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>Voltage</span>
                      <h3>{data.equipment.voltage} V</h3>
                      <p>Grid Voltage</p>
                    </div>
                    <div className="eq-box-plain">
                      <span>Max Current</span>
                      <h3>{data.equipment.current} A</h3>
                      <p>Output Current</p>
                    </div>
                  </div>

                  <div className="key-equipment-bom">
                    <span className="bom-title-label">Key Equipment</span>
                    <div className="bom-items-row">
                      {data.equipment.bomList.map((item, idx) => (
                        <div key={idx} className="bom-item-box-card">
                          <span className="bom-icon">{item.icon}</span>
                          <div className="bom-item-text">
                            <span>{item.name}</span>
                            <strong>{item.details}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="dashboard-sec card-panel">
                  <div className="sec-title">
                    <h2>5. Environmental Impact</h2>
                  </div>

                  <div className="impact-grid">
                    <div className="imp-item">
                      <div className="env-circle ec-green">
                        <Wind size={16} />
                      </div>
                      <div>
                        <span>CO₂ Emission Reduced</span>
                        <h3>{data.impact.co2} Tonnes / Year</h3>
                      </div>
                    </div>
                    <div className="imp-item">
                      <div className="env-circle ec-leaf">
                        <Leaf size={16} />
                      </div>
                      <div>
                        <span>Equivalent to planting</span>
                        <h3>{data.impact.trees} Trees / Year</h3>
                      </div>
                    </div>
                    <div className="imp-item">
                      <div className="env-circle ec-coal">
                        <Activity size={16} />
                      </div>
                      <div>
                        <span>Coal Saved</span>
                        <h3>{data.impact.coal} Tonnes / Year</h3>
                      </div>
                    </div>
                    <div className="imp-item">
                      <div className="env-circle ec-blue">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <span>Equivalent to not driving</span>
                        <h3>{formatCur(data.impact.driving)} Km / Year</h3>
                      </div>
                    </div>
                  </div>

                  <div className="green-future-strip">
                    <div className="future-box">
                      <div className="env-circle ec-yellow">
                        <Zap size={21} />
                      </div>
                      <div>
                        <span>Energy from Clean Source</span>
                        <h3>100%</h3>
                      </div>
                    </div>

                    <div className="future-box">
                      <div className="env-circle ec-leaf">
                        <Leaf size={21} />
                      </div>
                      <div>
                        <span>A Greener Tomorrow</span>
                        <h3>For you & your family</h3>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="footer-safe">
                <ShieldCheck size={18} />
                <span>
                  <strong>100% Secure & Confidential</strong> Your data is safe
                  with us.
                </span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResultDashboard;