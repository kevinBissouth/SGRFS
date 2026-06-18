import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./components/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Request from "./pages/Request";
import Docs from "./pages/Docs";
import Infos from "./pages/Infos";
import Profile from "./pages/Profil";
import SettingsPage from "./pages/Parametres";
import ChatBot from "./pages/MinetteIA";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/request" element={<Request />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/info" element={<Infos />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/minette" element={<ChatBot />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
