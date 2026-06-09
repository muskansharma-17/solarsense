import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  UploadCloud,
  LogOut,
  Trash2,
  User,
  Calendar,
  Bell,
  Plus,
  X,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const emptyVendorForm = {
  company_name: "",
  vendor_name: "",
  phone: "",
  email: "",
  website: "",
  linkedin_url: "",
  city: "",
  service_area: "",
  total_installed_kw: "",
  completed_projects: "",
  experience_type: "",
  google_rating: "",
  google_reviews_count: "",
  mnre_approved: "",
  discom_approved: "",
  warranty_years: "",
  panel_brands: "",
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({
    total_users: 0,
    total_vendors: 0,
    total_reports: 0,
    total_bill_uploads: 0,
  });

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [reports, setReports] = useState([]);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);

  const fetchAdminData = async () => {
    try {
      const [dashboardRes, usersRes, vendorsRes, reportsRes] =
        await Promise.all([
          fetch(`${API_BASE}/admin/dashboard`),
          fetch(`${API_BASE}/admin/users`),
          fetch(`${API_BASE}/vendors`),
          fetch(`${API_BASE}/admin/reports`),
        ]);

      const dashboardData = await dashboardRes.json();
      const usersData = await usersRes.json();
      const vendorsData = await vendorsRes.json();
      const reportsData = await reportsRes.json();

      if (dashboardData.success) setStats(dashboardData.data || {});
      if (usersData.success) setUsers(usersData.users || []);

      if (Array.isArray(vendorsData)) {
        setVendors(vendorsData);
      } else if (vendorsData.success) {
        setVendors(vendorsData.vendors || []);
      }

      if (reportsData.success) setReports(reportsData.reports || []);
    } catch (error) {
      console.error("Admin dashboard data loading error:", error);
      alert("Failed to load admin dashboard data.");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVendorChange = (e) => {
    setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });
  };

  const addVendor = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/admin/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...vendorForm,
          total_installed_kw: Number(vendorForm.total_installed_kw || 0),
          completed_projects: Number(vendorForm.completed_projects || 0),
          google_rating: Number(vendorForm.google_rating || 0),
          google_reviews_count: Number(vendorForm.google_reviews_count || 0),
          warranty_years: Number(vendorForm.warranty_years || 0),
          mnre_approved:
            vendorForm.mnre_approved === "true" ||
            vendorForm.mnre_approved === true,
          discom_approved:
            vendorForm.discom_approved === "true" ||
            vendorForm.discom_approved === true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Vendor added successfully.");
        setShowVendorForm(false);
        setVendorForm(emptyVendorForm);
        fetchAdminData();
      } else {
        alert(data.message || "Failed to add vendor.");
      }
    } catch (error) {
      console.error("Add vendor error:", error);
      alert("Failed to add vendor.");
    }
  };

  const deleteVendor = async (vendorId) => {
    if (!vendorId) {
      alert("Vendor ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`${API_BASE}/admin/vendors/${vendorId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Vendor deleted successfully.");
        fetchAdminData();
      } else {
        alert(data.message || "Failed to delete vendor.");
      }
    } catch (error) {
      console.error("Delete vendor error:", error);
      alert("Failed to delete vendor.");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/src/assets/logo.png" alt="logo" />
          <div>
            <h2>
              Solar<span>Sense</span>
            </h2>
            <p>ADMIN PANEL</p>
          </div>
        </div>

        <div className="admin-menu">
          <button
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          <button
            className={activePage === "users" ? "active" : ""}
            onClick={() => setActivePage("users")}
          >
            <Users size={18} /> Users
          </button>

          <button
            className={activePage === "vendors" ? "active" : ""}
            onClick={() => setActivePage("vendors")}
          >
            <Store size={18} /> Vendors
          </button>

          <button
            className={activePage === "reports" ? "active" : ""}
            onClick={() => setActivePage("reports")}
          >
            <FileText size={18} /> Reports
          </button>

          <button onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="admin-side-image">
          <img src="/src/assets/solar house.png" alt="Admin Dashboard" />
        </div>

        <div className="admin-side-card">
          <h4>SolarSense Admin</h4>
          <p>Empowering clean energy through smart administration.</p>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div>
            <h1>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "users" && "Users"}
              {activePage === "vendors" && "Vendors"}
              {activePage === "reports" && "Reports"}
            </h1>
            <p>Welcome back, Admin! Here's what's happening on your platform.</p>
          </div>

          <div className="top-actions">
            <div className="date-box">
              <Calendar size={16} />
              <span>Admin Panel</span>
            </div>


            <div className="admin-profile">
              <div className="avatar">A</div>
              <div>
                <h4>Admin</h4>
                <p>Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        {activePage === "dashboard" && (
          <>
            <StatsGrid stats={stats} vendors={vendors} />

            <div className="admin-row">
              <UsersTable users={users.slice(0, 5)} title="Users List" />

              <VendorsTable
                vendors={vendors.slice(0, 5)}
                deleteVendor={deleteVendor}
                setShowVendorForm={setShowVendorForm}
                title="Vendors List"
              />
            </div>

            <ReportsTable reports={reports.slice(0, 5)} title="Reports List" />
          </>
        )}

        {activePage === "users" && (
          <UsersTable users={users} title="All Users" full />
        )}

        {activePage === "vendors" && (
          <VendorsTable
            vendors={vendors}
            deleteVendor={deleteVendor}
            setShowVendorForm={setShowVendorForm}
            title="All Vendor Details"
            full
          />
        )}

        {activePage === "reports" && (
          <ReportsTable reports={reports} title="All Reports" full />
        )}
      </main>

      {showVendorForm && (
        <div className="modal-overlay">
          <div className="vendor-modal">
            <div className="modal-head">
              <h2>Add Vendor</h2>
              <button type="button" onClick={() => setShowVendorForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addVendor} className="vendor-form">
              {Object.keys(vendorForm).map((field) => (
                <input
                  key={field}
                  name={field}
                  value={vendorForm[field]}
                  onChange={handleVendorChange}
                  placeholder={field.replaceAll("_", " ")}
                />
              ))}

              <button type="submit" className="save-vendor-btn">
                Save Vendor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsGrid({ stats, vendors }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon green">
          <Users size={28} />
        </div>
        <div>
          <p>Total Users</p>
          <h2>{stats.total_users || 0}</h2>
          <span>Live data</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon blue">
          <Store size={28} />
        </div>
        <div>
          <p>Total Vendors</p>
          <h2>{vendors.length || stats.total_vendors || 0}</h2>
          <span>Live data</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon orange">
          <FileText size={28} />
        </div>
        <div>
          <p>Total Reports</p>
          <h2>{stats.total_reports || 0}</h2>
          <span>Live data</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon purple">
          <UploadCloud size={28} />
        </div>
        <div>
          <p>Bill Uploads</p>
          <h2>{stats.total_bill_uploads || 0}</h2>
          <span>Live data</span>
        </div>
      </div>
    </div>
  );
}

function UsersTable({ users, title, full }) {
  return (
    <section className="admin-table-card">
      <div className="table-title">
        <h3>{title}</h3>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {full && <th>ID</th>}
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              {full && <th>Created Date</th>}
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={full ? "6" : "4"} className="empty-text">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index}>
                  {full && <td>{user.id || "-"}</td>}
                  <td>
                    <span className="user-icon">
                      <User size={14} />
                    </span>
                    {user.name || user.full_name || user.username || "User"}
                  </td>
                  <td>{user.email || "-"}</td>
                  <td>{user.phone || user.mobile || "-"}</td>
                  {full && <td>{user.created_at || user.created_date || "-"}</td>}
                  <td>
                    <span className="status-active">Active</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VendorsTable({
  vendors,
  title,
  deleteVendor,
  setShowVendorForm,
  full,
}) {
  return (
    <section className="admin-table-card">
      <div className="table-title">
        <h3>{title}</h3>
        <button
          className="add-vendor-btn"
          onClick={() => setShowVendorForm(true)}
        >
          <Plus size={15} /> Add Vendor
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {full && <th>ID</th>}
              <th>Company</th>
              <th>Vendor</th>
              <th>Phone</th>
              <th>Email</th>
              <th>City</th>
              {full && <th>Website</th>}
              {full && <th>LinkedIn</th>}
              {full && <th>Service Area</th>}
              {full && <th>Installed kW</th>}
              {full && <th>Projects</th>}
              {full && <th>Experience</th>}
              <th>Rating</th>
              {full && <th>Reviews</th>}
              {full && <th>MNRE</th>}
              {full && <th>DISCOM</th>}
              {full && <th>Warranty</th>}
              {full && <th>Panel Brands</th>}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={full ? "19" : "7"} className="empty-text">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((vendor, index) => (
                <tr key={vendor.id || index}>
                  {full && <td>{vendor.id || "-"}</td>}
                  <td>{vendor.company_name || "-"}</td>
                  <td>{vendor.vendor_name || "-"}</td>
                  <td>{vendor.phone || "-"}</td>
                  <td>{vendor.email || "-"}</td>
                  <td>{vendor.city || "-"}</td>

                  {full && (
                    <td>
                      {vendor.website ? (
                        <a href={vendor.website} target="_blank" rel="noreferrer">
                          Website
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}

                  {full && (
                    <td>
                      {vendor.linkedin_url ? (
                        <a
                          href={vendor.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}

                  {full && <td>{vendor.service_area || "-"}</td>}
                  {full && <td>{vendor.total_installed_kw || 0}</td>}
                  {full && <td>{vendor.completed_projects || 0}</td>}
                  {full && <td>{vendor.experience_type || "-"}</td>}
                  <td>{vendor.google_rating || "-"} ⭐</td>
                  {full && <td>{vendor.google_reviews_count || 0}</td>}
                  {full && (
                    <td>{vendor.mnre_approved ? "Approved" : "Not Approved"}</td>
                  )}
                  {full && (
                    <td>
                      {vendor.discom_approved ? "Approved" : "Not Approved"}
                    </td>
                  )}
                  {full && <td>{vendor.warranty_years || 0} Years</td>}
                  {full && <td>{vendor.panel_brands || "-"}</td>}

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteVendor(vendor.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportsTable({ reports, title, full }) {
  const getCity = (report) =>
    report.city || report.location || report.address || "-";

  const getCapacity = (report) =>
    report.solar_capacity ||
    report.recommended_kw ||
    report.recommended_solar_kw ||
    "-";

  const getYearlySaving = (report) =>
    report.estimated_savings ||
    report.yearly_saving ||
    report.yearly_saving_value ||
    "-";

  const getMonthlySaving = (report) =>
    report.monthly_saving || report.monthly_saving_value || "-";

  const getPayback = (report) =>
    report.payback ||
    report.payback_years ||
    report.payback_period_years ||
    "-";

  return (
    <section className="admin-table-card reports-card">
      <div className="table-title">
        <h3>{title}</h3>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {full && <th>ID</th>}
              <th>User Name</th>
              <th>City</th>
              <th>Solar Capacity</th>
              <th>Estimated Savings</th>
              {full && <th>Monthly Saving</th>}
              {full && <th>Yearly Saving</th>}
              {full && <th>Payback</th>}
              {full && <th>Created Date</th>}
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={full ? "10" : "5"} className="empty-text">
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr key={report.id || index}>
                  {full && <td>{report.id || "-"}</td>}

                  <td>{report.user_name || report.name || "-"}</td>

                  <td>{getCity(report)}</td>

                  <td>{getCapacity(report)} kW</td>

                  <td>₹{getYearlySaving(report)}</td>

                  {full && <td>₹{getMonthlySaving(report)}</td>}

                  {full && <td>₹{getYearlySaving(report)}</td>}

                  {full && <td>{getPayback(report)} Years</td>}

                  {full && (
                    <td>{report.created_date || report.created_at || "-"}</td>
                  )}

                  <td>
                    <span className="status-badge">
                      {report.status || "Completed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminDashboard;