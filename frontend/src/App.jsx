import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Details from "./pages/Details";
import Landing from "./pages/Landing";
import AddTransaction from "./pages/AddTransaction";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/details" element={<Details />} />
        <Route path="/add" element={<AddTransaction />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;