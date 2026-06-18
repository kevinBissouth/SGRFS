import React, { useState, useEffect } from "react";
import {
    Bell,
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
    Moon,
    Sun,
    Smartphone,
    Monitor,
    BellRing,
    Mail,
    CheckCircle,
    MessageCircle,
    Star,
    Phone,
    Clock,
    ChevronLeft,
    Wifi,
    Activity,
    Calendar,
    AlertTriangle,
    Database,
    RefreshCw,
    MapPin,
    Tablet,
    HelpCircle,
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

// Composant Contact (Nous contacter)
function ContactSection({ onBack, lang, toggleLang, student }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [formSent, setFormSent] = useState(false);

    const t = {
        fr: {
            title: "Nous contacter",
            subtitle: "Une question ? Une suggestion ? Écrivez-nous",
            contactInfo: "Coordonnées",
            phone: "Téléphone",
            hours: "Horaires",
            emailLabel: "Email",
            name: "Nom complet",
            email: "Email",
            subject: "Sujet",
            message: "Message",
            send: "Envoyer",
            messageSent: "Message envoyé avec succès !",
            responseTime: "Nous vous répondrons dans les 24h",
            back: "Retour aux paramètres",
        },
        en: {
            title: "Contact us",
            subtitle: "A question? A suggestion? Write to us",
            contactInfo: "Contact information",
            phone: "Phone",
            hours: "Hours",
            emailLabel: "Email",
            name: "Full name",
            email: "Email",
            subject: "Subject",
            message: "Message",
            send: "Send",
            messageSent: "Message sent successfully!",
            responseTime: "We will reply within 24 hours",
            back: "Back to settings",
        },
    };

    const currentT = t[lang];
    const studentName = student ? `${student.prenom} ${student.nom}` : "Étudiant";
    const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormSent(true);
        setTimeout(() => setFormSent(false), 3000);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
                <ChevronLeft size={20} />
                <span className="text-sm">{currentT.back}</span>
            </button>

            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle size={24} className="text-white" />
                        <h1 className="text-2xl font-bold">{currentT.title}</h1>
                    </div>
                    <p className="text-blue-100 text-sm">{currentT.subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                                <Phone size={14} className="text-white" />
                            </div>
                            {currentT.contactInfo}
                        </h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <Phone size={18} className="text-green-500" />
                            <div>
                                <p className="text-xs text-gray-500">{currentT.phone}</p>
                                <p className="text-sm font-medium text-gray-800">+237 699 00 00 00</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-green-500" />
                            <div>
                                <p className="text-xs text-gray-500">{currentT.emailLabel}</p>
                                <p className="text-sm font-medium text-gray-800">support@univ-ebolo.cm</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={18} className="text-green-500" />
                            <div>
                                <p className="text-xs text-gray-500">{currentT.hours}</p>
                                <p className="text-sm font-medium text-gray-800">Lundi - Vendredi, 08h00 - 17h00</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                                <MessageCircle size={14} className="text-white" />
                            </div>
                            {currentT.title}
                        </h2>
                    </div>
                    <div className="p-5">
                        {formSent && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">{currentT.messageSent}</p>
                                    <p className="text-xs text-green-600">{currentT.responseTime}</p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder={currentT.name}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                placeholder={currentT.email}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                required
                            />
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleFormChange}
                                placeholder={currentT.subject}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                required
                            />
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleFormChange}
                                placeholder={currentT.message}
                                rows="4"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
                            >
                                {currentT.send}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [lang, setLang] = useState("fr");
    const [showContact, setShowContact] = useState(false);
    const [theme, setTheme] = useState("light");
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
    });
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [devices, setDevices] = useState([]);

    const toggleLang = () => setLang(prev => prev === "fr" ? "en" : "fr");
    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

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
        if (!id_etudiant) return;

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

    // Simuler la récupération des appareils connectés
    const fetchDevices = () => {
        const userAgent = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

        let deviceType = "Ordinateur";
        let deviceIcon = Monitor;
        let os = "Unknown";

        if (isTablet) {
            deviceType = "Tablette";
            deviceIcon = Tablet;
        } else if (isMobile) {
            deviceType = "Mobile";
            deviceIcon = Smartphone;
        }

        if (userAgent.includes("Windows")) os = "Windows";
        else if (userAgent.includes("Mac")) os = "macOS";
        else if (userAgent.includes("Linux")) os = "Linux";
        else if (userAgent.includes("Android")) os = "Android";
        else if (userAgent.includes("iOS")) os = "iOS";

        const browser = userAgent.includes("Chrome") ? "Chrome" :
            userAgent.includes("Firefox") ? "Firefox" :
                userAgent.includes("Safari") ? "Safari" :
                    userAgent.includes("Edge") ? "Edge" : "Unknown";

        setDevices([
            {
                id: 1,
                name: `${deviceType} - ${browser}`,
                icon: deviceIcon,
                os: os,
                browser: browser,
                lastActive: new Date(),
                isCurrent: true,
                location: "Ebolowa, Cameroun",
                ip: "197.xxx.xxx.xxx",
            },
            {
                id: 2,
                name: "iPhone 13 - Safari",
                icon: Smartphone,
                os: "iOS",
                browser: "Safari",
                lastActive: new Date(Date.now() - 86400000),
                isCurrent: false,
                location: "Yaoundé, Cameroun",
                ip: "196.xxx.xxx.xxx",
            },
        ]);
    };

    useEffect(() => {
        fetchStudentData();
        fetchDevices();
    }, []);

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setSuccessMessage(lang === "fr" ? "Préférences de notification mises à jour" : "Notification preferences updated");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const t = {
        fr: {
            title: "Paramètres",
            subtitle: "Personnalisez votre expérience",
            appearance: "Apparence",
            theme: "Thème",
            light: "Clair",
            dark: "Sombre",
            language: "Langue",
            french: "Français",
            english: "Anglais",
            notifications: "Notifications",
            emailNotif: "Notifications par email",
            pushNotif: "Notifications push",
            smsNotif: "Notifications SMS",
            support: "Support",
            contact: "Nous contacter",
            about: "À propos",
            version: "Version",
            dashboard: "Tableau de bord",
            myRequests: "Mes requêtes",
            documents: "Documents",
            profile: "Profil",
            settings: "Paramètres",
            info: "Infos",
            logout: "Déconnexion",
            student: "Étudiant",
            connectedDevices: "Appareils connectés",
            thisDevice: "Cet appareil",
            disconnect: "Déconnecter",
            lastActive: "Dernière activité",
            today: "aujourd'hui",
            yesterday: "hier",
            currentSession: "Session actuelle",
            deviceInfo: "Informations de l'appareil",
            os: "Système",
            browser: "Navigateur",
            location: "Localisation",
            ip: "Adresse IP",
            preferences: "Préférences",
            accessibility: "Accessibilité",
            reduceAnimations: "Réduire les animations",
            highContrast: "Contraste élevé",
            fontSize: "Taille du texte",
            normal: "Normal",
            large: "Grand",
            dataSync: "Synchronisation",
            lastSync: "Dernière synchronisation",
            syncNow: "Synchroniser maintenant",
        },
        en: {
            title: "Settings",
            subtitle: "Customize your experience",
            appearance: "Appearance",
            theme: "Theme",
            light: "Light",
            dark: "Dark",
            language: "Language",
            french: "French",
            english: "English",
            notifications: "Notifications",
            emailNotif: "Email notifications",
            pushNotif: "Push notifications",
            smsNotif: "SMS notifications",
            support: "Support",
            contact: "Contact us",
            about: "About",
            version: "Version",
            dashboard: "Dashboard",
            myRequests: "My requests",
            documents: "Documents",
            profile: "Profile",
            settings: "Settings",
            info: "Info",
            logout: "Logout",
            student: "Student",
            connectedDevices: "Connected devices",
            thisDevice: "This device",
            disconnect: "Disconnect",
            lastActive: "Last activity",
            today: "today",
            yesterday: "yesterday",
            currentSession: "Current session",
            deviceInfo: "Device information",
            os: "OS",
            browser: "Browser",
            location: "Location",
            ip: "IP address",
            preferences: "Preferences",
            accessibility: "Accessibility",
            reduceAnimations: "Reduce animations",
            highContrast: "High contrast",
            fontSize: "Font size",
            normal: "Normal",
            large: "Large",
            dataSync: "Synchronization",
            lastSync: "Last sync",
            syncNow: "Sync now",
        },
    };

    const currentT = t[lang];
    const studentName = student ? `${student.prenom} ${student.nom}` : "Étudiant";
    const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

    if (showContact) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
                <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm md:ml-64">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <button className="md:hidden p-2 rounded-xl bg-gray-100 shrink-0" onClick={() => setDrawerOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-sm md:text-xl font-bold text-gray-800 truncate">Nous contacter</h1>
                                <p className="text-[10px] text-gray-500 hidden sm:block truncate">Une question ? Une suggestion ? Écrivez-nous</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors group">
                                    <Bell size={18} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse" />
                                </button>
                                <button onClick={toggleLang} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-blue-200 transition-all text-xs">
                                    <Globe size={14} />
                                    <span>{lang === "fr" ? "FR" : "EN"}</span>
                                </button>
                                <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-md transition-transform hover:scale-105 cursor-pointer">
                                        {firstLetter}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-medium text-gray-800 truncate">{studentName}</p>
                                        <p className="text-[10px] text-gray-500">Étudiant</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex overflow-x-hidden">
                    <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white fixed h-screen">
                        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5" />
                            <div>
                                <p className="text-sm font-semibold">Université d'Ebolowa</p>
                                <p className="text-[10px] text-blue-300">Faculté des Sciences</p>
                            </div>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-1">
                            {navItems.map(({ label, href, icon: Icon }) => (
                                <a key={href} href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-blue-800">
                                    <Icon size={18} />
                                    {label}
                                </a>
                            ))}
                        </nav>
                        <div className="px-3 py-4 border-t border-white/10">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
                                <LogOut size={16} /> Déconnexion
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col md:ml-64 min-h-screen w-full overflow-x-hidden">
                        <div className="h-14 md:h-[72px]" />
                        <div className="flex-1 px-4 py-6 w-full max-w-6xl mx-auto pb-28 md:pb-6">
                            <ContactSection onBack={() => setShowContact(false)} lang={lang} toggleLang={toggleLang} student={student} />
                        </div>
                    </main>

                    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom">
                        {[
                            { href: "/dashboard", icon: LayoutDashboard, label: currentT.dashboard },
                            { href: "/request", icon: FileText, label: currentT.myRequests },
                            { href: "/minette", icon: MessageCircle, label: "Minette IA" },
                            { href: "/docs", icon: BookOpen, label: currentT.documents },
                            { href: "/info", icon: Info, label: currentT.info },
                        ].map(({ href, icon: Icon, label }) => {
                            const isBot = href === "/minette";
                            if (isBot) {
                                return (
                                    <a key={href} href={href} className="relative flex flex-col items-center justify-start">
                                        <div className="-mt-5 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:-translate-y-0.5">
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-[9px] mt-1 font-semibold text-gray-700">Minette IA</span>
                                    </a>
                                );
                            }
                            return (
                                <a key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium text-gray-400 hover:text-gray-600">
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-x-hidden">
            {showSuccess && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-lg p-3 flex items-center gap-2 rounded-r-xl">
                        <CheckCircle size={14} className="text-green-600" />
                        <p className="text-xs font-medium text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

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
                            <button onClick={() => window.location.href = "/minette"} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
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
                            const active = href === "/settings";
                            return (
                                <a key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"}`}>
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

                {drawerOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
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
                                    const active = href === "/settings";
                                    return (
                                        <a key={href} href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium ${active ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"}`} onClick={() => setDrawerOpen(false)}>
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

                <main className="flex-1 flex flex-col md:ml-64 min-h-screen w-full overflow-x-hidden">
                    <div className="h-14 md:h-[72px]" />

                    <div className="flex-1 px-4 py-6 w-full max-w-5xl mx-auto pb-28 md:pb-6 overflow-x-hidden">
                        <div className="mb-8">
                            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings size={24} className="text-white" />
                                        <h1 className="text-2xl font-bold">{currentT.title}</h1>
                                    </div>
                                    <p className="text-blue-100 text-sm">{currentT.subtitle}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Apparence */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                            <Monitor size={14} className="text-white" />
                                        </div>
                                        {currentT.appearance}
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-2 block">{currentT.theme}</label>
                                        <div className="flex gap-3">
                                            {[
                                                { value: "light", icon: Sun, label: currentT.light },
                                                { value: "dark", icon: Moon, label: currentT.dark },
                                            ].map((option) => (
                                                <button key={option.value} onClick={() => setTheme(option.value)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${theme === option.value ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                                    <option.icon size={16} />
                                                    <span className="text-sm">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-2 block">{currentT.language}</label>
                                        <div className="flex gap-3">
                                            <button onClick={() => setLang("fr")} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${lang === "fr" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                                <span className="text-lg">🇫🇷</span>
                                                <span className="text-sm">{currentT.french}</span>
                                            </button>
                                            <button onClick={() => setLang("en")} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${lang === "en" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                                <span className="text-lg">🇬🇧</span>
                                                <span className="text-sm">{currentT.english}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                                            <BellRing size={14} className="text-white" />
                                        </div>
                                        {currentT.notifications}
                                    </h2>
                                </div>
                                <div className="p-5 space-y-3">
                                    {[
                                        { key: "email", icon: Mail, label: currentT.emailNotif },
                                        { key: "push", icon: Bell, label: currentT.pushNotif },
                                        { key: "sms", icon: Smartphone, label: currentT.smsNotif },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <item.icon size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{item.label}</span>
                                            </div>
                                            <button onClick={() => handleNotificationChange(item.key)} className={`w-10 h-5 rounded-full transition-all ${notifications[item.key] ? "bg-green-500" : "bg-gray-300"}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform mt-0.5 ${notifications[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Appareils connectés */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 lg:col-span-2">
                                <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-sky-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center">
                                            <Smartphone size={14} className="text-white" />
                                        </div>
                                        {currentT.connectedDevices}
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {devices.map((device) => (
                                            <div key={device.id} className={`p-4 rounded-xl border transition-all ${device.isCurrent ? "bg-blue-50 border-blue-200 shadow-md" : "bg-gray-50 border-gray-100"}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.isCurrent ? "bg-blue-500" : "bg-gray-400"}`}>
                                                            <device.icon size={18} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">{device.name}</p>
                                                            <p className="text-xs text-gray-500">{device.os} • {device.browser}</p>
                                                        </div>
                                                    </div>
                                                    {device.isCurrent && (
                                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                            {currentT.thisDevice}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    <p className="flex items-center gap-2">
                                                        <Activity size={12} />
                                                        {currentT.lastActive}: {device.lastActive.toLocaleDateString()} à {device.lastActive.toLocaleTimeString()}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <MapPin size={12} />
                                                        {device.location}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Wifi size={12} />
                                                        {device.ip}
                                                    </p>
                                                </div>
                                                {!device.isCurrent && (
                                                    <button className="mt-3 text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                                        <LogOut size={12} />
                                                        {currentT.disconnect}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Préférences */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center">
                                            <Star size={14} className="text-white" />
                                        </div>
                                        {currentT.preferences}
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <Activity size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">{currentT.reduceAnimations}</span>
                                        </div>
                                        <button className="w-10 h-5 rounded-full bg-gray-300 transition-all">
                                            <div className="w-4 h-4 rounded-full bg-white transform transition-transform translate-x-0.5 mt-0.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">{currentT.highContrast}</span>
                                        </div>
                                        <button className="w-10 h-5 rounded-full bg-gray-300 transition-all">
                                            <div className="w-4 h-4 rounded-full bg-white transform transition-transform translate-x-0.5 mt-0.5" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-2 block">{currentT.fontSize}</label>
                                        <div className="flex gap-3">
                                            <button className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:border-purple-300 transition-all">{currentT.normal}</button>
                                            <button className="flex-1 px-4 py-2 rounded-xl border border-purple-500 bg-purple-50 text-purple-600 text-sm">{currentT.large}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Synchronisation */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                                            <Database size={14} className="text-white" />
                                        </div>
                                        {currentT.dataSync}
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">{currentT.lastSync}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</span>
                                    </div>
                                    <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2">
                                        <RefreshCw size={14} />
                                        {currentT.syncNow}
                                    </button>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                                    <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                                            <HelpCircle size={14} className="text-white" />
                                        </div>
                                        {currentT.support}
                                    </h2>
                                </div>
                                <div className="p-5 space-y-3">
                                    <button onClick={() => setShowContact(true)} className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition-all group">
                                        <MessageCircle size={16} className="text-gray-500 group-hover:text-amber-500" />
                                        <span className="text-sm text-gray-700 group-hover:text-amber-600">{currentT.contact}</span>
                                    </button>
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Star size={16} className="text-yellow-500" />
                                                <span className="text-sm text-gray-700">{currentT.about}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">v2.0.0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
                    {[
                        { href: "/dashboard", icon: LayoutDashboard, label: currentT.dashboard },
                        { href: "/request", icon: FileText, label: currentT.myRequests },
                        { href: "/minette", icon: MessageCircle, label: "Minette IA" },
                        { href: "/docs", icon: BookOpen, label: currentT.documents },
                        { href: "/info", icon: Info, label: currentT.info },
                    ].map(({ href, icon: Icon, label }) => {
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
                            <a key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium text-gray-400 hover:text-gray-600">
                                <Icon size={18} />
                                <span>{label}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </div>
    );
}

export default SettingsPage;