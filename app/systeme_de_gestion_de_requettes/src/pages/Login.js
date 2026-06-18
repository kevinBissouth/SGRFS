import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Lock, LogIn, Home, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

import API_BASE_URL from "../config";

const TEXTS = {
  fr: {
    title: "Connexion Étudiant",
    subtitle: "Connectez-vous avec votre matricule",
    matricule: "Matricule",
    matriculePlaceholder: "Votre matricule",
    password: "Mot de passe",
    passwordPlaceholder: "Votre mot de passe",
    remember: "Se souvenir de moi",
    forgot: "Mot de passe oublié ?",
    login: "Se connecter",
    loginLoading: "Connexion…",
    back: "Retour à l'accueil",
    createPrompt: "Pas encore de compte ?",
    create: "Créer un compte",
    error: "Veuillez remplir tous les champs.",
    errorAuth: "Matricule ou mot de passe incorrect.",
  },
  en: {
    title: "Student Login",
    subtitle: "Sign in with your student ID",
    matricule: "Student ID",
    matriculePlaceholder: "Your student ID",
    password: "Password",
    passwordPlaceholder: "Your password",
    remember: "Remember me",
    forgot: "Forgot password?",
    login: "Sign in",
    loginLoading: "Signing in…",
    back: "Back to home",
    createPrompt: "Don't have an account yet?",
    create: "Create an account",
    error: "Please fill in all fields.",
    errorAuth: "Invalid student ID or password.",
  },
};

function Login() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = TEXTS[lang];

  const [formData, setFormData] = useState({ matricule: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.matricule.trim() || !formData.password.trim()) {
      setError(t.error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/etudiant/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricule: formData.matricule.trim(),
          mot_de_passe: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.errorAuth);
      }

      // Stocker les infos utilisateur
      localStorage.setItem("user", JSON.stringify(data));

      // Redirection
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-blue-900 text-white px-4 py-4 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 object-contain" />
            <div className="leading-tight">
              <p className="text-xs sm:text-sm font-bold leading-none">Université d'Ebolowa</p>
              <p className="text-[10px] sm:text-xs text-blue-300 leading-none mt-0.5">Faculté des Sciences</p>
            </div>
          </div>
          <LanguageToggle className="hidden sm:inline-flex" small={false} />
          <LanguageToggle className="sm:hidden inline-flex" small={true} />
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">

          {/* logo + title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* form card */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">

            {/* error message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" noValidate>

              {/* Matricule */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.matricule}
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <GraduationCap size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    name="matricule"
                    placeholder={t.matriculePlaceholder}
                    autoComplete="username"
                    inputMode="text"
                    className="w-full py-3.5 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    value={formData.matricule}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.password}
                </label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                  <Lock size={18} className="text-gray-400 shrink-0" />
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    placeholder={t.passwordPlaceholder}
                    autoComplete="current-password"
                    className="w-full py-3.5 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 flex-1"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
                    aria-label={showPwd ? "Masquer" : "Afficher"}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 select-none cursor-pointer">
                </label>
                <a href="/forgot-password" className="text-blue-600 font-medium hover:underline">
                  {t.forgot}
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full flex items-center justify-center gap-2
                  py-4 rounded-2xl
                  bg-blue-600 hover:bg-blue-700 active:scale-95
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-bold text-base
                  shadow-lg shadow-blue-500/25
                  transition-all duration-200
                "
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                ) : (
                  <LogIn size={20} />
                )}
                {loading ? t.loginLoading : t.login}
              </button>

            </form>

          </div>

          {/* Links */}
          <div className="text-center mt-5 space-y-2">
            <p className="text-sm text-gray-500">
              {t.createPrompt}{" "}
              <a href="/register" className="text-purple-600 font-semibold hover:underline">
                {t.create}
              </a>
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Home size={15} />
              {t.back}
            </a>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Login;