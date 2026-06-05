import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Monitoring from "@/pages/Monitoring";
import DeviceControl from "@/pages/DeviceControl";
import Alerts from "@/pages/Alerts";
import EnergyPlan from "@/pages/EnergyPlan";
import MeterReading from "@/pages/MeterReading";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="device-control" element={<DeviceControl />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="energy-plan" element={<EnergyPlan />} />
          <Route path="meter-reading" element={<MeterReading />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
