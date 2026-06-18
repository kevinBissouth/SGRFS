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
    ChevronDown,
    CheckSquare,
    Paperclip,
    Sparkles,
    Loader2,
} from "lucide-react";
import API_BASE_URL from "../config";

// Données des types de requêtes (depuis l'API plus tard)
const INFOS_DATA = [
    {
        id: 1,
        type_fr: "Attestation de scolarité",
        type_en: "School Certificate",
        icon: "🎓",
        gradient: "from-blue-500 to-indigo-600",
        color: "blue",
        conditions_fr: [
            "Être inscrit régulièrement à l'université",
            "Avoir payé les frais académiques de l'année en cours",
            "Être à jour de ses inscriptions pédagogiques",
        ],
        conditions_en: [
            "Be regularly enrolled at the university",
            "Have paid the academic fees for the current year",
            "Be up to date with your academic registrations",
        ],
        documents_fr: [
            "Copie de la carte d'étudiant",
            "Reçu de paiement des frais académiques",
            "Attestation d'inscription de l'année en cours",
        ],
        documents_en: [
            "Copy of student ID card",
            "Academic fee payment receipt",
            "Current year registration certificate",
        ],
    },
    {
        id: 2,
        type_fr: "Relevé de notes",
        type_en: "Transcript",
        icon: "📋",
        gradient: "from-purple-500 to-pink-600",
        color: "purple",
        conditions_fr: [
            "Avoir validé toutes les UE du semestre concerné",
            "Ne pas avoir de dettes académiques",
            "Être à jour de ses paiements",
        ],
        conditions_en: [
            "Have validated all the UEs of the concerned semester",
            "Have no academic debts",
            "Be up to date with your payments",
        ],
        documents_fr: [
            "Carte d'étudiant valide",
            "Demande écrite signée par l'étudiant",
            "Relevé précédent (si demande partielle)",
        ],
        documents_en: [
            "Valid student ID card",
            "Written request signed by the student",
            "Previous transcript (if partial request)",
        ],
    },
    {
        id: 3,
        type_fr: "Demande de stage",
        type_en: "Internship Request",
        icon: "💼",
        gradient: "from-green-500 to-emerald-600",
        color: "green",
        conditions_fr: [
            "Être en année de cycle concernée par le stage",
            "Avoir l'accord préalable du département",
            "Avoir une convention de stage à faire signer",
        ],
        conditions_en: [
            "Be in the cycle year concerned by the internship",
            "Have prior approval from the department",
            "Have an internship agreement to be signed",
        ],
        documents_fr: [
            "Lettre de demande de stage",
            "Curriculum Vitae (CV) à jour",
            "Attestation d'inscription",
            "Convention de stage (à remplir)",
        ],
        documents_en: [
            "Internship request letter",
            "Updated Curriculum Vitae (CV)",
            "Registration certificate",
            "Internship agreement (to be filled)",
        ],
    },
    {
        id: 4,
        type_fr: "Quitus de paiement",
        type_en: "Payment Quitus",
        icon: "🧾",
        gradient: "from-amber-500 to-orange-600",
        color: "amber",
        conditions_fr: [
            "Avoir réglé la totalité des frais académiques",
            "Aucune dette en suspens auprès de l'université",
            "Avoir rendu tous les documents empruntés à la bibliothèque",
        ],
        conditions_en: [
            "Have paid all academic fees",
            "No outstanding debt with the university",
            "Have returned all borrowed documents to the library",
        ],
        documents_fr: [
            "Reçu de paiement original",
            "Carte d'étudiant",
            "Attestation de non-dette de la bibliothèque",
        ],
        documents_en: [
            "Original payment receipt",
            "Student ID card",
            "Library no-debt certificate",
        ],
    },
    {
        id: 5,
        type_fr: "Correction d'informations",
        type_en: "Information Correction",
        icon: "✏️",
        gradient: "from-red-500 to-rose-600",
        color: "red",
        conditions_fr: [
            "Erreur avérée dans les informations académiques",
            "Signalement dans les délais fixés par l'administration",
            "Justificatif officiel à l'appui",
        ],
        conditions_en: [
            "Proven error in academic information",
            "Reporting within the deadlines set by the administration",
            "Official supporting document",
        ],
        documents_fr: [
            "Pièce d'identité nationale",
            "Acte de naissance ou tout document officiel justificatif",
            "Formulaire de correction rempli",
            "Ancienne carte d'étudiant (si modification du nom)",
        ],
        documents_en: [
            "National identity card",
            "Birth certificate or any official supporting document",
            "Completed correction form",
            "Old student ID card (if name change)",
        ],
    },
    {
        id: 6,
        type_fr: "Révision de notes",
        type_en: "Grade Revision",
        icon: "📊",
        gradient: "from-indigo-500 to-purple-600",
        color: "indigo",
        conditions_fr: [
            "Avoir échoué à une UE avec une note inférieure à 10/20",
            "Demande déposée dans les 15 jours suivant la publication des résultats",
            "Paiement des frais de révision",
        ],
        conditions_en: [
            "Have failed a UE with a grade below 10/20",
            "Request submitted within 15 days of results publication",
            "Payment of revision fees",
        ],
        documents_fr: [
            "Copie du relevé de notes",
            "Lettre de motivation expliquant la demande",
            "Preuve de paiement des frais de révision",
        ],
        documents_en: [
            "Copy of the transcript",
            "Motivation letter explaining the request",
            "Proof of payment of revision fees",
        ],
    },
    {
        id: 7,
        type_fr: "Demande de bourse",
        type_en: "Scholarship Request",
        icon: "💰",
        gradient: "from-emerald-500 to-teal-600",
        color: "emerald",
        conditions_fr: [
            "Être inscrit dans un établissement public",
            "Avoir des résultats académiques satisfaisants",
            "Remplir les critères sociaux définis par la commission",
        ],
        conditions_en: [
            "Be enrolled in a public institution",
            "Have satisfactory academic results",
            "Meet the social criteria defined by the commission",
        ],
        documents_fr: [
            "Attestation de résidence",
            "Relevé de notes des deux derniers semestres",
            "Lettre de motivation",
            "Quittance de loyer (ou attestation d'hébergement)",
            "Relevés bancaires des 3 derniers mois",
        ],
        documents_en: [
            "Residence certificate",
            "Transcripts of the last two semesters",
            "Motivation letter",
            "Rent receipt (or accommodation certificate)",
            "Bank statements of the last 3 months",
        ],
    },
];

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mes requêtes", href: "/request", icon: FileText },
    { label: "Documents", href: "/docs", icon: BookOpen },
    { label: "Profil", href: "/profile", icon: User },
    { label: "Paramètres", href: "/settings", icon: Settings },
    { label: "Infos", href: "/info", icon: Info },
];

// Composant pour les cartes d'informations stylisées
function InfoCard({ info, isOpen, onToggle, lang }) {
    const conditions = lang === "fr" ? info.conditions_fr : info.conditions_en;
    const documents = lang === "fr" ? info.documents_fr : info.documents_en;
    const typeName = lang === "fr" ? info.type_fr : info.type_en;

    const badgeColors = {
        blue: "bg-blue-100 text-blue-700",
        purple: "bg-purple-100 text-purple-700",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        red: "bg-red-100 text-red-700",
        indigo: "bg-indigo-100 text-indigo-700",
        emerald: "bg-emerald-100 text-emerald-700",
    };

    return (
        <div
            className={`bg-white rounded-2xl border shadow-lg transition-all duration-300 overflow-hidden ${isOpen ? "border-blue-200 shadow-xl" : "border-gray-100 hover:shadow-md"}`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-5 text-left group"
            >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-800 truncate">{typeName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeColors[info.color]}`}>
                            <FileText size={10} />
                            {conditions.length} condition{conditions.length > 1 ? "s" : ""}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeColors[info.color]}`}>
                            <Paperclip size={10} />
                            {documents.length} document{documents.length > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                <div className={`transform transition-all duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <ChevronDown size={18} className="text-gray-500" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="px-5 pb-6 space-y-5 border-t border-gray-100">
                    <div className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <CheckSquare size={14} className="text-green-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {lang === "fr" ? "Conditions à respecter" : "Conditions to respect"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {conditions.map((cond, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-green-50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{cond}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Paperclip size={14} className="text-blue-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {lang === "fr" ? "Documents à fournir" : "Documents to provide"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center shadow-sm shrink-0">
                                        <FileText size={12} />
                                    </div>
                                    <p className="text-sm text-gray-700">{doc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Composant principal Infos ────────────────────────────────────────────────
function Infos() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [lang, setLang] = useState("fr");
    const [search, setSearch] = useState("");
    const [openId, setOpenId] = useState(1);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Récupérer les données de l'étudiant depuis l'API
    const fetchStudentData = async () => {
        const id_etudiant = getStudentId();
        if (!id_etudiant) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/etudiant/get_student_by_id/${id_etudiant}`);
            if (response.ok) {
                const data = await response.json();
                setStudent(data);
            }
        } catch (err) {
            console.error("Error fetching student:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const studentName = student ? `${student.prenom} ${student.nom}` : "Étudiant";
    const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

    const toggleLang = () => setLang(prev => prev === "fr" ? "en" : "fr");
    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const filtered = INFOS_DATA.filter((item) =>
        (lang === "fr" ? item.type_fr : item.type_en).toLowerCase().includes(search.toLowerCase())
    );

    const totalConditions = INFOS_DATA.reduce((acc, item) => acc + (lang === "fr" ? item.conditions_fr.length : item.conditions_en.length), 0);
    const totalDocuments = INFOS_DATA.reduce((acc, item) => acc + (lang === "fr" ? item.documents_fr.length : item.documents_en.length), 0);

    const t = {
        fr: {
            title: "Guide des requêtes académiques",
            subtitle: "Tout ce que vous devez savoir",
            intro: "Consultez les conditions et les documents requis pour chaque type de demande administrative.",
            searchPlaceholder: "Attestation, relevé, stage...",
            dashboard: "Tableau de bord",
            myRequests: "Mes requêtes",
            documentsLabel: "Documents",
            profile: "Profil",
            settings: "Paramètres",
            info: "Infos",
            manageRequests: "Gérez vos requêtes académiques",
            logout: "Déconnexion",
            student: "Étudiant",
            noResults: "Aucun résultat trouvé",
            noResultsDesc: "Essayez avec d'autres mots-clés",
            stats: {
                total: "Types de documents",
                conditions: "Conditions totales",
                documents: "Documents requis",
            },
        },
        en: {
            title: "Academic Requests Guide",
            subtitle: "Everything you need to know",
            intro: "Check the conditions and required documents for each type of administrative request.",
            searchPlaceholder: "Certificate, transcript, internship...",
            dashboard: "Dashboard",
            myRequests: "My requests",
            documentsLabel: "Documents",
            profile: "Profile",
            settings: "Settings",
            info: "Info",
            manageRequests: "Manage your academic requests",
            logout: "Logout",
            student: "Student",
            noResults: "No results found",
            noResultsDesc: "Try with different keywords",
            stats: {
                total: "Document types",
                conditions: "Total conditions",
                documents: "Required documents",
            },
        },
    };

    const currentT = t[lang];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen size={20} className="text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 overflow-x-hidden">
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
                <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white fixed h-screen overflow-y-auto z-20">
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0 mt-14">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 shadow-lg" />
                        <div>
                            <p className="text-sm font-bold">Université d'Ebolowa</p>
                            <p className="text-[10px] text-blue-300">Faculté des Sciences</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navItems.map(({ label, href, icon: Icon }) => {
                            const active = href === "/info";
                            return (
                                <a
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"}`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </a>
                            );
                        })}
                    </nav>
                    <div className="px-3 py-4 border-t border-white/10 shrink-0">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg">
                            <LogOut size={16} /> {currentT.logout}
                        </button>
                    </div>
                </aside>

                {/* MOBILE DRAWER */}
                {drawerOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5" />
                                    <p className="text-sm font-semibold">Université d'Ebolowa</p>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {navItems.map(({ label, href, icon: Icon }) => {
                                    const active = href === "/info";
                                    return (
                                        <a
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium ${active ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"}`}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <Icon size={18} />
                                            {label}
                                        </a>
                                    );
                                })}
                            </nav>
                            <div className="px-3 py-4 border-t border-white/10 shrink-0">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold">
                                    <LogOut size={16} /> {currentT.logout}
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col md:ml-64 min-h-screen w-full overflow-x-hidden">
                    {/* Espace pour la topbar fixe */}
                    <div className="h-14 md:h-[72px]" />

                    {/* CONTENU SCROLLABLE */}
                    <div className="flex-1 px-4 py-6 w-full max-w-4xl mx-auto pb-28 md:pb-6 overflow-x-hidden">

                        {/* Hero Section */}
                        <div className="mb-8 w-full">
                            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles size={20} className="text-yellow-400 shrink-0" />
                                        <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">Guide officiel</span>
                                    </div>
                                    <p className="text-sm text-blue-100 leading-relaxed">
                                        {currentT.intro}
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 mt-5">
                                        <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
                                            <p className="text-2xl font-bold">{INFOS_DATA.length}</p>
                                            <p className="text-[10px] text-blue-200">{currentT.stats.total}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
                                            <p className="text-2xl font-bold">{totalConditions}</p>
                                            <p className="text-[10px] text-blue-200">{currentT.stats.conditions}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
                                            <p className="text-2xl font-bold">{totalDocuments}</p>
                                            <p className="text-[10px] text-blue-200">{currentT.stats.documents}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-6 w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder={currentT.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm text-sm text-gray-800 placeholder-gray-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X size={16} className="text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Accordion List */}
                        {filtered.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center w-full">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                    <Search size={32} className="text-gray-400" />
                                </div>
                                <p className="text-base font-semibold text-gray-700">{currentT.noResults}</p>
                                <p className="text-sm text-gray-400 mt-1">{currentT.noResultsDesc}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 w-full">
                                {filtered.map((info) => (
                                    <InfoCard
                                        key={info.id}
                                        info={info}
                                        isOpen={openId === info.id}
                                        onToggle={() => setOpenId(openId === info.id ? null : info.id)}
                                        lang={lang}
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
                        const active = href === "/info";
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
                                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium transition-all ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

export default Infos;