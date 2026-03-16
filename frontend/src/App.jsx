import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing        from "./pages/Landing";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Onboarding     from "./pages/Onboarding";
import Dashboard      from "./pages/Dashboard";
import Details        from "./pages/Details";
import AddTransaction from "./pages/AddTransaction";
import Profile        from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/onboarding"  element={<Onboarding />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/details"     element={<Details />} />
        <Route path="/add"         element={<AddTransaction />} />
        <Route path="/profile"     element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;