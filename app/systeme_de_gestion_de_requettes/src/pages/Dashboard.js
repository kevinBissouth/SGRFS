import React, { useState, useEffect } from "react";
import { useLanguage } from "../components/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import {
  Bell,
  MessageCircle,
  FileText,
  LayoutDashboard,
  Clock3,
  User,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Plus,
  Menu,
  X,
  ChevronRight,
  Info,
  Globe,
  File,
  Calendar,
  Download,
} from "lucide-react";
import API_BASE_URL from "../config";

const navItems = (t) => [
  { label: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
  { label: t.myRequests, href: "/request", icon: FileText },
  { label: t.documents, href: "/docs", icon: BookOpen },
  { label: t.profile, href: "/profile", icon: User },
  { label: t.settings, href: "/settings", icon: Settings },
  { label: t.info, href: "/info", icon: Info },
];

const isPendingStatus = (status) => {
  const value = String(status || "").toLowerCase();
  return value.includes("attente") || value.includes("cours") || value.includes("pending");
};

const isValidatedStatus = (status) => {
  const value = String(status || "").toLowerCase();
  return value.includes("valid") || value.includes("accept") || value.includes("approved");
};

const isRejectedStatus = (status) => {
  const value = String(status || "").toLowerCase();
  return value.includes("rejet") || value.includes("refus") || value.includes("reject");
};

const getStatusStyle = (status) => {
  if (isValidatedStatus(status)) {
    return { bg: "bg-green-50", color: "text-green-700" };
  }
  if (isRejectedStatus(status)) {
    return { bg: "bg-red-50", color: "text-red-700" };
  }
  return { bg: "bg-amber-50", color: "text-amber-700" };
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// ─── Composant pour le carrousel de requêtes ─────────────────────────────────
function RecentRequestsCarousel({ requests, t }) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState("");

  useEffect(() => {
    if (requests.length < 2) return undefined;

    const interval = setInterval(() => {
      setIsSliding(true);
      setSlideDirection("slide-out");

      setTimeout(() => {
        setDisplayIndex((prevIndex) => (prevIndex + 1) % requests.length);
        setSlideDirection("slide-in");

        setTimeout(() => {
          setIsSliding(false);
          setSlideDirection("");
        }, 300);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [requests.length]);

  useEffect(() => {
    setDisplayIndex(0);
  }, [requests]);

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <FileText size={30} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">{t.noRequests}</p>
      </div>
    );
  }

  const currentRequest = requests[displayIndex] || requests[0];
  const statusStyle = getStatusStyle(currentRequest.statut);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          {t.recentRequests}
        </h3>
        <div className="flex gap-1">
          {requests.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${idx === displayIndex ? "w-4 bg-blue-600" : "w-1 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${slideDirection === "slide-out" ? "opacity-0 -translate-x-full" : ""}
            ${slideDirection === "slide-in" ? "opacity-100 translate-x-0" : ""}
            ${!isSliding ? "opacity-100 translate-x-0" : ""}
          `}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                  {currentRequest.type_requete || t.unknownRequest}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
                    {currentRequest.statut || t.unknownStatus}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{formatDate(currentRequest.date_requete)}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0 ml-3" />
            </div>

            <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                key={displayIndex}
                className="absolute inset-0 bg-blue-500 rounded-full animate-progress"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s linear forwards;
        }
      `}</style>
    </div>
  );
}

// ─── Composant pour les documents récents ─────────────────────────────────
function RecentDocumentsList({ documents, t, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-5 h-5 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
        <File size={30} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">{t.noDocuments}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {documents.slice(0, 5).map((document) => (
        <div key={document.id_document} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <File size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{document.titre}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-gray-500">{document.type_requete_titre || document.requete_type || t.unknownRequest}</p>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(document.date_emission)}
              </p>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <p className="text-xs text-gray-400">{formatFileSize(document.taille)}</p>
            </div>
          </div>
          <a
            href={`${API_BASE_URL}/documents_reponse_requete/download/${document.id_document}`}
            download
            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
            title={t.download}
          >
            <Download size={16} />
          </a>
        </div>
      ))}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL DASHBOARD ────────────────────────────────────────────────
function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { lang } = useLanguage();
  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const studentName = [student?.prenom, student?.nom].filter(Boolean).join(" ") || "Étudiant";
  const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // language handled by LanguageProvider

  const t = {
    fr: {
      dashboard: "Tableau de bord",
      myRequests: "Mes requêtes",
      documents: "Documents",
      profile: "Profil",
      settings: "Paramètres",
      info: "Infos",
      welcome: "Bienvenue",
      manageRequests: "Gérez vos requêtes académiques",
      newRequest: "Nouvelle requête",
      overview: "Aperçu",
      recentRequests: "Requêtes récentes",
      documentsToCollect: "Documents récents",
      noDocuments: "Aucun document disponible actuellement.",
      noRequests: "Aucune requête envoyée pour le moment.",
      unknownRequest: "Requête académique",
      unknownStatus: "Statut inconnu",
      loadError: "Impossible de charger les données du tableau de bord.",
      logout: "Déconnexion",
      student: "Étudiant",
      download: "Télécharger",
    },
    en: {
      dashboard: "Dashboard",
      myRequests: "My requests",
      documents: "Documents",
      profile: "Profile",
      settings: "Settings",
      info: "Info",
      welcome: "Welcome",
      manageRequests: "Manage your academic requests",
      newRequest: "New request",
      overview: "Overview",
      recentRequests: "Recent requests",
      documentsToCollect: "Recent documents",
      noDocuments: "No documents available at this time.",
      noRequests: "No request sent yet.",
      unknownRequest: "Academic request",
      unknownStatus: "Unknown status",
      loadError: "Unable to load dashboard data.",
      logout: "Logout",
      student: "Student",
      download: "Download",
    },
  };

  const currentT = t[lang];

  useEffect(() => {
    const loadDashboardData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        window.location.href = "/login";
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        let user = JSON.parse(storedUser);

        // Si l'utilisateur n'a pas d'id_etudiant mais a un matricule, on le récupère
        if (!user.id_etudiant && user.matricule) {
          const userRes = await fetch(`${API_BASE_URL}/etudiant/get_student_by_matricule/${encodeURIComponent(user.matricule)}`);
          if (userRes.ok) {
            user = await userRes.json();
            localStorage.setItem("user", JSON.stringify(user));
          }
        }

        if (!user.id_etudiant) {
          throw new Error("id_etudiant manquant");
        }

        setStudent(user);

        // 1. Charger les requêtes de l'étudiant
        const requestsRes = await fetch(`${API_BASE_URL}/requete/by_etudiant/${user.id_etudiant}`);
        const requestsData = requestsRes.ok ? await requestsRes.json() : [];
        setRequests(Array.isArray(requestsData) ? requestsData : []);

        // 2. Charger les documents réponse depuis la nouvelle API (UNIQUEMENT celle-ci)
        const docsRes = await fetch(`${API_BASE_URL}/documents_reponse_requete/etudiant/${user.id_etudiant}`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDocuments(Array.isArray(docsData) ? docsData : []);
        } else {
          console.warn("Impossible de charger les documents réponse");
          setDocuments([]);
        }

      } catch (err) {
        console.error("Erreur dashboard:", err);
        setLoadError(currentT.loadError);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    {
      title_fr: "Requêtes envoyées",
      title_en: "Requests sent",
      value: requests.length,
      icon: FileText,
      light: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title_fr: "En attente",
      title_en: "Pending",
      value: requests.filter((request) => isPendingStatus(request.statut)).length,
      icon: Clock3,
      light: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      title_fr: "Validées",
      title_en: "Validated",
      value: requests.filter((request) => isValidatedStatus(request.statut)).length,
      icon: CheckCircle,
      light: "bg-green-50",
      text: "text-green-600",
    },
    {
      title_fr: "Rejetées",
      title_en: "Rejected",
      value: requests.filter((request) => isRejectedStatus(request.statut)).length,
      icon: AlertCircle,
      light: "bg-red-50",
      text: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white fixed h-screen z-40 shrink-0">

        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 object-contain shadow-lg" />
          <div className="leading-tight">
            <p className="text-sm font-bold leading-none">Université d'Ebolowa</p>
            <p className="text-[10px] text-blue-300 mt-0.5">Faculté des Sciences</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems(currentT).map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard";
            return (
              <a
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"}
                `}
              >
                <Icon size={18} />
                {label}
              </a>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
          >
            <LogOut size={16} />
            {currentT.logout}
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5 object-contain" />
                <p className="text-sm font-bold">Université d'Ebolowa</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems(currentT).map(({ label, href, icon: Icon }) => {
                const active = href === "/dashboard";
                return (
                  <a
                    key={href}
                    href={href}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                      ${active ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"}
                    `}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Icon size={18} />
                    {label}
                  </a>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <LogOut size={16} />
                {currentT.logout}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 pb-20 md:pb-0">

        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-700"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate md:text-xl">
                {currentT.dashboard}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {currentT.manageRequests}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.href = "/minette"}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <MessageCircle size={16} />
                <span className="text-xs font-semibold">Minette IA</span>
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </button>

              <div className="hidden md:flex">
                <LanguageToggle className="" small={false} />
              </div>

              <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                  {firstLetter}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-semibold text-gray-800">{studentName}</p>
                  <p className="text-[10px] text-gray-500">{currentT.student}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-5 space-y-6 sm:px-6 sm:py-6">
          {loadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
              {loadError}
            </div>
          )}

          {/* Welcome banner */}
          <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Tableau de bord</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {currentT.welcome}, {studentName.split(" ")[0]}
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mb-4">
                {currentT.manageRequests}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/request"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus size={16} />
                  {currentT.newRequest}
                </a>
              </div>
            </div>
          </section>

          {/* Stats grid */}
          <section>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              {currentT.overview}
            </h3>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-3xl font-extrabold text-gray-900">{loading ? "..." : stat.value}</p>
                    <div className={`${stat.light} ${stat.text} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    {lang === "fr" ? stat.title_fr : stat.title_en}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent requests carousel */}
          <section>
            <RecentRequestsCarousel requests={requests.slice(0, 5)} t={currentT} />
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              {currentT.documentsToCollect}
            </h3>
            <RecentDocumentsList documents={documents} t={currentT} loading={loading} />
          </section>

        </div>

      </main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
        {[
          { href: "/dashboard", icon: LayoutDashboard, label: currentT.dashboard },
          { href: "/request", icon: FileText, label: currentT.myRequests },
          { href: "/minette", icon: MessageCircle, label: "Minette IA" },
          { href: "/docs", icon: BookOpen, label: currentT.documents },
          { href: "/info", icon: Info, label: currentT.info },
        ].map(({ href, icon: Icon, label }) => {
          const active = href === "/dashboard";
          const isBot = href === "/minette";
          if (isBot) {
            return (
              <a key={href} href={href} className="relative flex flex-col items-center justify-start">
                <div className="-mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-transform hover:scale-110 active:scale-95">
                  <Icon size={24} />
                </div>
                <span className="text-[9px] mt-1 font-semibold text-gray-700">Minette IA</span>
              </a>
            );
          }
          return (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium transition-all ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {/* ── FAB (mobile only) ──────────────── */}
      <a
        href="/request"
        className="md:hidden fixed bottom-20 right-4 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label={currentT.newRequest}
      >
        <Plus size={24} />
      </a>

    </div>
  );
}

export default Dashboard;