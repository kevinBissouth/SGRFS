import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "./LanguageContext";

function LanguageToggle({ className = "", small = false }) {
  const { lang, toggleLang } = useLanguage();

  return (
<button onClick={toggleLang} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs"><Globe size={14} /><span className="font-medium">{lang === "fr" ? "FR" : "EN"}</span></button>
  );
}

export default LanguageToggle;
