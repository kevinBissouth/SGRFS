import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, Globe, X, Menu } from "lucide-react";
import { useLanguage } from "./LanguageContext";

// ─── translations ────────────────────────────────────────────────────────────
const NAV_LABELS = {
  fr: {
    home: "Accueil",
    about: "À propos",
    process: "Processus",
    features: "Fonctionnalités",
    contact: "Contact",
    login: "Connexion",
    register: "Inscription",
  },
  en: {
    home: "Home",
    about: "About",
    process: "Process",
    features: "Features",
    contact: "Contact",
    login: "Login",
    register: "Register",
  },
};

// ─── component ───────────────────────────────────────────────────────────────
function Navbar() {
  const { lang, toggleLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = NAV_LABELS[lang];

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: "#top",      label: t.home },
    { href: "#about",    label: t.about },
    { href: "#process",  label: t.process },
    { href: "#features", label: t.features },
    { href: "#contact",  label: t.contact },
  ];

  return (
    <>
      {/* ── HEADER BAR ───────────────────────────────────────────────────── */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-blue-900/95 backdrop-blur-md text-white
          transition-shadow duration-300
          ${scrolled ? "shadow-xl shadow-blue-950/40" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">

          {/* ── BRAND ──────────────────────────────────────────────────── */}
          <a href="#top" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
            <img
              src="/logo.png"
              alt="Logo"
              className="w-9 h-9 rounded-full bg-white/10 p-0.5 object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight leading-none">
                Université d'Ebolowa
              </p>
              <p className="text-[10px] text-blue-300 leading-none mt-0.5">
                Faculté des Sciences
              </p>
            </div>
          </a>

          {/* ── DESKTOP NAV ────────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="
                  px-3 py-2 rounded-lg text-sm font-medium text-blue-100
                  hover:text-white hover:bg-white/10
                  transition-colors duration-150
                "
              >
                {label}
              </a>
            ))}
          </nav>

          {/* ── DESKTOP ACTIONS ────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="
                flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-sm font-medium text-blue-200
                hover:text-white hover:bg-white/10
                transition-colors duration-150
              "
              aria-label="Changer de langue"
            >
              <span>({lang === "fr" ? "EN" : "FR"})</span>
              <Globe size={15} />
            </button>

            <a
              href="/login"
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-lg
                text-sm font-semibold text-white
                border border-white/30 hover:bg-white/10
                transition-colors duration-150
              "
            >
              <LogIn size={15} />
              {t.login}
            </a>

            <a
              href="/register"
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-lg
                text-sm font-semibold text-blue-900 bg-cyan-400
                hover:bg-cyan-300
                transition-colors duration-150
              "
            >
              <UserPlus size={15} />
              {t.register}
            </a>
          </div>

          {/* ── MOBILE RIGHT ───────────────────────────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 px-2 py-2 transition-colors"
              aria-label="Langue"
            >
              <span className="text-xs font-medium">({lang === "fr" ? "EN" : "FR"})</span>
              <Globe size={16} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span
                className={`block transition-all duration-300 ${
                  menuOpen ? "rotate-90 opacity-0 absolute" : ""
                }`}
              >
                <Menu size={22} />
              </span>
              {menuOpen && <X size={22} />}
            </button>
          </div>

        </div>
      </header>

      {/* ── MOBILE SLIDE-DOWN MENU ─────────────────────────────────────────── */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden
          transition-all duration-300 ease-in-out
          ${menuOpen ? "visible" : "invisible"}
        `}
      >
        {/* backdrop */}
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300
            ${menuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={closeMenu}
        />

        {/* panel */}
        <div
          className={`
            absolute top-0 left-0 right-0
            bg-blue-900 text-white
            pt-[64px] pb-6 px-5
            shadow-2xl
            transition-transform duration-300 ease-in-out
            ${menuOpen ? "translate-y-0" : "-translate-y-full"}
          `}
        >
          <nav className="flex flex-col gap-1 mt-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="
                  px-4 py-3.5 rounded-xl text-base font-medium
                  text-blue-100 hover:text-white hover:bg-white/10
                  active:bg-white/20
                  transition-colors duration-150
                "
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-white/10">
            <a
              href="/login"
              onClick={closeMenu}
              className="
                flex items-center justify-center gap-2
                px-4 py-3.5 rounded-xl
                text-base font-semibold text-white
                border border-white/30 hover:bg-white/10
                transition-colors duration-150
              "
            >
              <LogIn size={18} />
              {t.login}
            </a>
            <a
              href="/register"
              onClick={closeMenu}
              className="
                flex items-center justify-center gap-2
                px-4 py-3.5 rounded-xl
                text-base font-semibold text-blue-900 bg-cyan-400
                hover:bg-cyan-300
                active:scale-95
                transition-all duration-150
              "
            >
              <UserPlus size={18} />
              {t.register}
            </a>
          </div>
        </div>
      </div>

      {/* Spacer so content doesn't hide behind fixed header */}
      <div className="h-[56px]" />
    </>
  );
}

export default Navbar;
