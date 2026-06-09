

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import VendorRegister from "./pages/VendorRegister";
import VendorView from "./pages/VendorView";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import ResultDashboard from "./pages/ResultDashboard";
import ProposalViewer from "./pages/ProposalViewer";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
    
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/vendor-register" element={<VendorRegister />} />

        <Route path="/vendor-view" element={<VendorView />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/result-dashboard" element={<ResultDashboard />} />

        <Route path="/ProposalViewer" element={<ProposalViewer />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;