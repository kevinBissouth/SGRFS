import React, { useState, useEffect } from "react";
import {
  Bell,
  MessageCircle,
  FileText,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
  Info,
  Globe,
  Search,
  Download,
  Printer,
  Eye,
  Calendar,
  CheckCircle,
  Filter,
  ChevronDown,
  File,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import API_BASE_URL from "../config";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes requêtes", href: "/request", icon: FileText },
  { label: "Documents", href: "/docs", icon: BookOpen },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Paramètres", href: "/settings", icon: Settings },
  { label: "Infos", href: "/info", icon: Info },
];

// Fonction pour obtenir la couleur de fond (gardée pour compatibilité)
const getRandomColor = (name) => {
  const colors = [
    "from-blue-500 to-blue-700",
    "from-cyan-500 to-blue-600",
    "from-indigo-500 to-blue-700",
    "from-sky-500 to-blue-600",
    "from-teal-500 to-cyan-600",
    "from-blue-600 to-indigo-700",
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

// Fonction pour formater la taille du fichier
const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Fonction pour obtenir l'icône en fonction du type de document
const getDocumentIcon = (type, titre) => {
  const titreLower = (titre || "").toLowerCase();
  if (titreLower.includes("attestation")) return "🎓";
  if (titreLower.includes("relevé") || titreLower.includes("notes")) return "📊";
  if (titreLower.includes("certificat")) return "📜";
  if (titreLower.includes("stage")) return "💼";
  if (titreLower.includes("quitus") || titreLower.includes("paiement")) return "🧾";
  if (titreLower.includes("bourse")) return "💰";
  if (titreLower.includes("correction")) return "✏️";
  if (titreLower.includes("révision")) return "📝";
  return "📄";
};

// ─── COMPOSANT POUR UNE CARTE DE DOCUMENT ─────────────────────────────────
function DocumentCard({ doc, lang, onView, onDownload, onPrint }) {
  const getStatusBadge = () => {
    if (doc.statut === "disponible") {
      return { bg: "bg-green-50", text: "text-green-700", label_fr: "Disponible", label_en: "Available" };
    }
    return { bg: "bg-gray-50", text: "text-gray-500", label_fr: "Archivé", label_en: "Archived" };
  };

  const status = getStatusBadge();

  return (
    <div
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onView(doc)}
    >
      <div className="relative h-24 sm:h-28 bg-blue-50 flex items-center justify-center border-b border-gray-100">
        <div className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">
          {getDocumentIcon(doc.type_fichier, doc.titre)}
        </div>
        <div className="absolute top-2 right-2 bg-white/90 rounded-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium text-gray-500 shadow-sm border border-gray-100">
          {doc.type_fichier?.split('/').pop()?.toUpperCase() || "PDF"}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 mb-1">
          {doc.titre}
        </h3>
        <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 mb-2">
          {doc.requete_type || (lang === "fr" ? "Document officiel" : "Official document")}
        </p>

        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-400">
          <Calendar size={10} className="sm:w-3 sm:h-3" />
          <span>{new Date(doc.date_emission).toLocaleDateString("fr-FR")}</span>
          <span className="mx-0.5">•</span>
          <File size={10} className="sm:w-3 sm:h-3" />
          <span>{formatFileSize(doc.taille)}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(doc); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title={lang === "fr" ? "Télécharger" : "Download"}
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPrint(doc); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={lang === "fr" ? "Imprimer" : "Print"}
            >
              <Printer size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-blue-600 text-[10px] sm:text-[11px] font-medium">
            <span className="hidden sm:inline">{lang === "fr" ? "Voir" : "View"}</span>
            <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT POUR LA VUE DÉTAILLÉE DU DOCUMENT ──────────────────────────
function DocumentModal({ doc, lang, onClose, onDownload, onPrint }) {
  const isMobile = window.innerWidth < 768;

  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
            {getDocumentIcon(doc.type_fichier, doc.titre)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{doc.titre}</h2>
            <p className="text-xs text-gray-400">ID: {doc.id_document}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Requête associée" : "Associated request"}</span>
          <span className="text-sm font-medium text-gray-800">#{doc.id_requete}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Type de requête" : "Request type"}</span>
          <span className="text-sm font-medium text-gray-800">{doc.requete_type || "-"}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Date d'émission" : "Issue date"}</span>
          <span className="text-sm font-medium text-gray-800">{new Date(doc.date_emission).toLocaleDateString("fr-FR")}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Type de fichier" : "File type"}</span>
          <span className="text-sm font-medium text-gray-800">{doc.type_fichier?.split('/').pop()?.toUpperCase() || "PDF"}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Taille" : "Size"}</span>
          <span className="text-sm font-medium text-gray-800">{formatFileSize(doc.taille)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{lang === "fr" ? "Statut" : "Status"}</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
            <CheckCircle size={10} />
            {lang === "fr" ? "Disponible" : "Available"}
          </span>
        </div>
        {doc.description && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-500 block mb-1">{lang === "fr" ? "Description" : "Description"}</span>
            <p className="text-sm text-gray-700">{doc.description}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => onDownload(doc)} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
          <Download size={16} /> {lang === "fr" ? "Télécharger" : "Download"}
        </button>
        <button onClick={() => onPrint(doc)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
          <Printer size={16} /> {lang === "fr" ? "Imprimer" : "Print"}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg bg-gray-100">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-base font-semibold text-gray-900">{lang === "fr" ? "Détail du document" : "Document details"}</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{content}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL DOCUMENTS ─────────────────────────────────────────
function Documents() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lang, setLang] = useState("fr");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  // Récupérer l'ID étudiant depuis localStorage
  const getStudentId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id_etudiant || userData.id || userData.user_id;
      } catch (e) {
        console.error("Error parsing user:", e);
        return null;
      }
    }
    return null;
  };

  // Récupérer les données de l'étudiant
  const fetchStudentData = async () => {
    const id_etudiant = getStudentId();
    if (!id_etudiant) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/etudiant/get_student_by_id/${id_etudiant}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
        return data;
      }
    } catch (err) {
      console.error("Error fetching student:", err);
    }
    return null;
  };

  // Récupérer les documents depuis l'API
  const fetchDocuments = async () => {
    const id_etudiant = getStudentId();
    if (!id_etudiant) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/documents_reponse_requete/etudiant/${id_etudiant}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des documents");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    fetchDocuments();
  }, []);

  const studentName = student ? `${student.prenom} ${student.nom}` : "Étudiant";
  const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

  const toggleLang = () => setLang(prev => prev === "fr" ? "en" : "fr");
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Filtrer les documents par recherche
  const filteredDocs = documents.filter((doc) =>
    doc.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  // Téléchargement réel du document
  const handleDownload = async (doc) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents_reponse_requete/download/${doc.id_document}`);
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.titre.replace(/ /g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(lang === "fr" ? "Erreur lors du téléchargement" : "Download error");
    }
  };

  // Impression du document
  const handlePrint = async (doc) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents_reponse_requete/download/${doc.id_document}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Print error:", err);
      alert(lang === "fr" ? "Erreur lors de l'impression" : "Print error");
    }
  };

  const t = {
    fr: {
      title: "Documents",
      subtitle: "Tous vos documents officiels",
      searchPlaceholder: "Rechercher un document...",
      noResults: "Aucun document trouvé",
      noResultsDesc: "Aucun document ne correspond à votre recherche",
      total: "Total",
      documents: "documents",
      dashboard: "Tableau de bord",
      myRequests: "Mes requêtes",
      documentsLabel: "Documents",
      profile: "Profil",
      settings: "Paramètres",
      info: "Infos",
      manageRequests: "Gérez vos requêtes académiques",
      logout: "Déconnexion",
      student: "Étudiant",
      filter: "Filtrer",
      loading: "Chargement des documents...",
    },
    en: {
      title: "Documents",
      subtitle: "All your official documents",
      searchPlaceholder: "Search a document...",
      noResults: "No documents found",
      noResultsDesc: "No document matches your search",
      total: "Total",
      documents: "documents",
      dashboard: "Dashboard",
      myRequests: "My requests",
      documentsLabel: "Documents",
      profile: "Profile",
      settings: "Settings",
      info: "Info",
      manageRequests: "Manage your academic requests",
      logout: "Logout",
      student: "Student",
      filter: "Filter",
      loading: "Loading documents...",
    },
  };

  const currentT = t[lang];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* TOPBAR */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm md:ml-64">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button className="md:hidden p-2 rounded-lg bg-gray-100 shrink-0" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">{currentT.title}</h1>
              <p className="text-[10px] text-gray-500 hidden sm:block truncate">{currentT.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.location.href = "/minette"}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <MessageCircle size={16} />
                <span className="text-xs font-semibold">Minette IA</span>
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <button onClick={toggleLang} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs">
                <Globe size={14} />
                <span>{lang === "fr" ? "FR" : "EN"}</span>
              </button>
              <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                  {firstLetter}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-800 truncate">{studentName}</p>
                  <p className="text-[10px] text-gray-500">{currentT.student}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white fixed h-screen">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 shadow-lg" />
            <div>
              <p className="text-sm font-bold">Université d'Ebolowa</p>
              <p className="text-[10px] text-blue-300">Faculté des Sciences</p>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = href === "/docs";
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg">
              <LogOut size={16} /> {currentT.logout}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5" />
                  <p className="text-sm font-semibold">Université d'Ebolowa</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = href === "/docs";
                  return (
                    <a
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium ${active ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"
                        }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </a>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-white/10">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold">
                  <LogOut size={16} /> {currentT.logout}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col md:ml-64 min-h-screen w-full overflow-x-hidden">
          <div className="h-14 md:h-[72px]" />

          <div className="flex-1 px-4 py-6 w-full max-w-7xl mx-auto pb-28 md:pb-6 overflow-x-hidden">

            {/* Statistiques */}
            <div className="mb-6 sm:mb-8">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={20} className="text-blue-200" />
                    <span className="text-sm font-bold text-blue-100 uppercase tracking-wide">Bibliothèque de documents</span>
                  </div>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {lang === "fr" ? "Tous les documents officiels émis suite à vos requêtes sont disponibles ici." : "All official documents issued following your requests are available here."}
                  </p>
                  <div className="mt-5">
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                      <FileText size={16} className="text-blue-200" />
                      <span className="text-2xl font-bold">{documents.length}</span>
                      <span className="text-sm text-blue-200">{currentT.total} {currentT.documents}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={currentT.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
            </div>

            {/* Liste des documents */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={20} className="text-blue-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">{currentT.loading}</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X size={32} className="text-red-500" />
                </div>
                <p className="text-base font-semibold text-red-600">{error}</p>
                <button onClick={() => fetchDocuments()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Réessayer
                </button>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search size={32} className="text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700">{currentT.noResults}</p>
                <p className="text-sm text-gray-400 mt-1">{currentT.noResultsDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id_document}
                    doc={doc}
                    lang={lang}
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
          {[
            { href: "/dashboard", icon: LayoutDashboard, label: currentT.dashboard },
            { href: "/request", icon: FileText, label: currentT.myRequests },
            { href: "/minette", icon: MessageCircle, label: "Minette IA" },
            { href: "/docs", icon: BookOpen, label: currentT.documentsLabel },
            { href: "/info", icon: Info, label: currentT.info },
          ].map(({ href, icon: Icon, label }) => {
            const active = href === "/docs";
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
      </div>

      {showModal && selectedDoc && (
        <DocumentModal
          doc={selectedDoc}
          lang={lang}
          onClose={() => setShowModal(false)}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}

export default Documents;