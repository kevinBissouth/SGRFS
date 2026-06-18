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
    MessageCircle,
    Edit2,
    Save,
    XCircle,
    Mail,
    GraduationCap,
    Briefcase,
    School,
    Clock,
    CheckCircle,
    Loader2,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Award,
    Bookmark,
    Calendar as CalendarIcon,
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

const rattrapageOptions = ["Aucun rattrapage", "LICENCE 1", "LICENCE 2", "LICENCE 3"];

function Profile() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [lang, setLang] = useState("fr");
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [filieres, setFilieres] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [formData, setFormData] = useState({
        id_etudiant: null,
        nom: "",
        prenom: "",
        matricule: "",
        email: "",
        telephone: "",
        date_naissance: "",
        id_filiere: "",
        id_niveau: "",
        niveau_label: "",
        filiere_label: "",
        poste: "",
        niveau_2_label: "",
        date_inscription: "",
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [saving, setSaving] = useState(false);

    const studentName = `${formData.prenom} ${formData.nom}`;
    const firstLetter = formData.prenom?.charAt(0).toUpperCase() || "?";

    const memberYear = formData.date_inscription ? new Date(formData.date_inscription).getFullYear() : new Date().getFullYear();

    const toggleLang = () => setLang(prev => prev === "fr" ? "en" : "fr");
    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

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

    const fetchFilieres = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/filiere/get_all_filiere/`);
            if (response.ok) {
                const data = await response.json();
                setFilieres(data);
            }
        } catch (err) {
            console.error("Erreur chargement filières:", err);
        }
    };

    const fetchNiveaux = async (id_filiere) => {
        if (!id_filiere) return;
        try {
            const response = await fetch(`${API_BASE_URL}/niveau/by_filiere/${id_filiere}`);
            if (response.ok) {
                const data = await response.json();
                setNiveaux(data);
            }
        } catch (err) {
            console.error("Erreur chargement niveaux:", err);
        }
    };

    const fetchAllStudentData = async (id_etudiant) => {
        try {
            const response = await fetch(`${API_BASE_URL}/etudiant/get_student_by_id/${id_etudiant}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Error fetching student:", err);
            throw err;
        }
    };

    const updateStudent = async (id_etudiant, payload) => {
        try {
            const response = await fetch(`${API_BASE_URL}/etudiant/update_student/${id_etudiant}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Error updating student:", err);
            throw err;
        }
    };

    const updateProfil = async (id_etudiant, poste, niveau_2_label) => {
        try {
            const payload = {
                id_etudiant: id_etudiant,
                poste: poste,
                niveau_2: niveau_2_label,
            };

            const response = await fetch(`${API_BASE_URL}/profils_etudiants/update/${id_etudiant}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error("Error updating profil:", err);
            throw err;
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            const id_etudiant = getStudentId();

            if (!id_etudiant) {
                setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                await fetchFilieres();
                const student = await fetchAllStudentData(id_etudiant);

                const id_filiere = student.id_filiere || student.id_niveau?.id_filiere || "";
                const id_niveau = student.id_niveau || "";

                if (id_filiere) {
                    await fetchNiveaux(id_filiere);
                }

                const niveauLabel = student.niveau || student.id_niveau?.niveau || "Non défini";
                const filiereLabel = student.filiere || student.id_niveau?.filiere || "Non défini";
                const rattrapageLabel = student.niveau_2 || student.niveau_rattrapage || "Aucun rattrapage";
                const posteValue = student.poste || "Non défini";
                const dateInscription = student.date_inscription || student.created_at || new Date().toISOString();

                setFormData({
                    id_etudiant: student.id_etudiant,
                    nom: student.nom || "",
                    prenom: student.prenom || "",
                    matricule: student.matricule || "",
                    email: student.email || "",
                    telephone: student.telephone || "",
                    date_naissance: student.date_naissance ? student.date_naissance.split("T")[0] : "",
                    id_filiere: id_filiere,
                    id_niveau: id_niveau,
                    niveau_label: niveauLabel,
                    filiere_label: filiereLabel,
                    poste: posteValue,
                    niveau_2_label: rattrapageLabel,
                    date_inscription: dateInscription,
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                });

            } catch (err) {
                console.error("Error loading profile:", err);
                setError("Impossible de charger votre profil. Vérifiez votre connexion.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const validatePasswords = () => {
        setPasswordError("");

        if (formData.new_password || formData.confirm_password) {
            if (formData.new_password !== formData.confirm_password) {
                setPasswordError(lang === "fr" ? "Les nouveaux mots de passe ne correspondent pas" : "New passwords do not match");
                return false;
            }
            if (formData.new_password.length < 6) {
                setPasswordError(lang === "fr" ? "Le mot de passe doit contenir au moins 6 caractères" : "Password must be at least 6 characters");
                return false;
            }
            if (!formData.current_password) {
                setPasswordError(lang === "fr" ? "Veuillez entrer votre mot de passe actuel" : "Please enter your current password");
                return false;
            }
        }
        return true;
    };

    const handleEditToggle = async () => {
        if (isEditing) {
            if (!validatePasswords()) {
                return;
            }

            setSaving(true);
            try {
                const id_etudiant = getStudentId();
                if (!id_etudiant) throw new Error("Utilisateur non authentifié");

                const updatePayload = {
                    matricule: formData.matricule,
                    nom: formData.nom,
                    prenom: formData.prenom,
                    date_naissance: formData.date_naissance,
                    email: formData.email,
                    mot_de_passe: formData.new_password || "placeholder",
                    telephone: formData.telephone,
                    id_niveau: parseInt(formData.id_niveau),
                };

                await updateStudent(id_etudiant, updatePayload);
                await updateProfil(id_etudiant, formData.poste, formData.niveau_2_label);

                setNotificationType("success");
                setNotificationMessage(lang === "fr" ? "Profil mis à jour avec succès !" : "Profile updated successfully!");
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);

                const updatedStudent = await fetchAllStudentData(id_etudiant);
                const id_filiere = updatedStudent.id_filiere || updatedStudent.id_niveau?.id_filiere || "";
                const id_niveau = updatedStudent.id_niveau || "";

                if (id_filiere) {
                    await fetchNiveaux(id_filiere);
                }

                const niveauLabel = updatedStudent.niveau || updatedStudent.id_niveau?.niveau || "Non défini";
                const filiereLabel = updatedStudent.filiere || updatedStudent.id_niveau?.filiere || "Non défini";
                const rattrapageLabel = updatedStudent.niveau_2 || updatedStudent.niveau_rattrapage || "Aucun rattrapage";
                const posteValue = updatedStudent.poste || "Non défini";
                const dateInscription = updatedStudent.date_inscription || updatedStudent.created_at || new Date().toISOString();

                setFormData(prev => ({
                    ...prev,
                    nom: updatedStudent.nom || "",
                    prenom: updatedStudent.prenom || "",
                    matricule: updatedStudent.matricule || "",
                    email: updatedStudent.email || "",
                    telephone: updatedStudent.telephone || "",
                    date_naissance: updatedStudent.date_naissance ? updatedStudent.date_naissance.split("T")[0] : "",
                    id_filiere: id_filiere,
                    id_niveau: id_niveau,
                    niveau_label: niveauLabel,
                    filiere_label: filiereLabel,
                    poste: posteValue,
                    niveau_2_label: rattrapageLabel,
                    date_inscription: dateInscription,
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                }));

            } catch (err) {
                console.error("Save error:", err);
                setNotificationType("error");
                setNotificationMessage(lang === "fr" ? `Erreur: ${err.message}` : `Error: ${err.message}`);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            } finally {
                setSaving(false);
            }
        }
        setIsEditing(!isEditing);
        setPasswordError("");
        setFormData(prev => ({
            ...prev,
            current_password: "",
            new_password: "",
            confirm_password: "",
        }));
    };

    const handleCancel = () => {
        const reloadProfile = async () => {
            const id_etudiant = getStudentId();
            if (id_etudiant) {
                try {
                    const student = await fetchAllStudentData(id_etudiant);
                    const id_filiere = student.id_filiere || student.id_niveau?.id_filiere || "";
                    const id_niveau = student.id_niveau || "";

                    if (id_filiere) {
                        await fetchNiveaux(id_filiere);
                    }

                    const niveauLabel = student.niveau || student.id_niveau?.niveau || "Non défini";
                    const filiereLabel = student.filiere || student.id_niveau?.filiere || "Non défini";
                    const rattrapageLabel = student.niveau_2 || student.niveau_rattrapage || "Aucun rattrapage";
                    const posteValue = student.poste || "Non défini";
                    const dateInscription = student.date_inscription || student.created_at || new Date().toISOString();

                    setFormData({
                        id_etudiant: student.id_etudiant,
                        nom: student.nom || "",
                        prenom: student.prenom || "",
                        matricule: student.matricule || "",
                        email: student.email || "",
                        telephone: student.telephone || "",
                        date_naissance: student.date_naissance ? student.date_naissance.split("T")[0] : "",
                        id_filiere: id_filiere,
                        id_niveau: id_niveau,
                        niveau_label: niveauLabel,
                        filiere_label: filiereLabel,
                        poste: posteValue,
                        niveau_2_label: rattrapageLabel,
                        date_inscription: dateInscription,
                        current_password: "",
                        new_password: "",
                        confirm_password: "",
                    });
                } catch (err) {
                    console.error("Reload error:", err);
                }
            }
            setIsEditing(false);
            setPasswordError("");
        };
        reloadProfile();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "id_filiere") {
            const selectedFiliere = filieres.find(f => String(f.id_filiere) === String(value));
            setFormData(prev => ({
                ...prev,
                id_filiere: value,
                filiere_label: selectedFiliere?.nom || "",
                id_niveau: "",
                niveau_label: "",
            }));
            fetchNiveaux(value);
            return;
        }

        if (name === "id_niveau") {
            const selectedNiveau = niveaux.find(n => String(n.id_niveau) === String(value));
            setFormData(prev => ({
                ...prev,
                id_niveau: value,
                niveau_label: selectedNiveau?.niveau || "",
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "new_password" || name === "confirm_password") {
            setPasswordError("");
        }
    };

    const t = {
        fr: {
            title: "Mon profil",
            subtitle: "Gérez vos informations personnelles",
            personalInfo: "Informations personnelles",
            academicInfo: "Parcours académique",
            contactInfo: "Coordonnées",
            securityInfo: "Sécurité",
            nom: "Nom",
            prenom: "Prénom",
            matricule: "Matricule",
            filiere: "Filière",
            niveau: "Niveau",
            rattrapage: "Niveau à rattraper",
            email: "Email",
            phone: "Téléphone",
            poste: "Poste occupé",
            dateNaissance: "Date de naissance",
            currentPassword: "Mot de passe actuel",
            newPassword: "Nouveau mot de passe",
            confirmPassword: "Confirmer le mot de passe",
            edit: "Modifier",
            save: "Enregistrer",
            cancel: "Annuler",
            dashboard: "Tableau de bord",
            myRequests: "Mes requêtes",
            documentsLabel: "Documents",
            profile: "Profil",
            settings: "Paramètres",
            info: "Infos",
            logout: "Déconnexion",
            student: "Étudiant",
            memberSince: "Membre depuis",
            loading: "Chargement...",
            error: "Erreur",
            stats: "Statistiques",
            requestsCount: "Requêtes",
            documentsCount: "Documents",
        },
        en: {
            title: "My profile",
            subtitle: "Manage your personal information",
            personalInfo: "Personal information",
            academicInfo: "Academic journey",
            contactInfo: "Contact details",
            securityInfo: "Security",
            nom: "Last name",
            prenom: "First name",
            matricule: "Student ID",
            filiere: "Program",
            niveau: "Level",
            rattrapage: "Retake level",
            email: "Email",
            phone: "Phone",
            poste: "Position",
            dateNaissance: "Birth date",
            currentPassword: "Current password",
            newPassword: "New password",
            confirmPassword: "Confirm new password",
            edit: "Edit",
            save: "Save",
            cancel: "Cancel",
            dashboard: "Dashboard",
            myRequests: "My requests",
            documentsLabel: "Documents",
            profile: "Profile",
            settings: "Settings",
            info: "Info",
            logout: "Logout",
            student: "Student",
            memberSince: "Member since",
            loading: "Loading...",
            error: "Error",
            stats: "Statistics",
            requestsCount: "Requests",
            documentsCount: "Documents",
        },
    };

    const currentT = t[lang];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <GraduationCap size={20} className="text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{currentT.loading}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-5">
                        <XCircle size={36} className="text-red-500" />
                    </div>
                    <p className="text-red-600 font-semibold text-lg mb-3">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-x-hidden">
            {/* Notification toast */}
            {showNotification && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                    <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${notificationType === "success"
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                            : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                        }`}>
                        {notificationType === "success" ? (
                            <CheckCircle size={20} />
                        ) : (
                            <XCircle size={20} />
                        )}
                        <p className="text-sm font-medium">{notificationMessage}</p>
                    </div>
                </div>
            )}

            {/* TOPBAR */}
            <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm md:ml-64">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <button className="md:hidden p-2 rounded-xl bg-gray-100 shrink-0" onClick={() => setDrawerOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">{currentT.title}</h1>
                            <p className="text-[10px] text-gray-500 hidden sm:block truncate">{currentT.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => window.location.href = "/minette"}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:shadow-md transition-all"
                            >
                                <MessageCircle size={16} />
                                <span className="text-xs font-semibold">Minette IA</span>
                            </button>
                            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Bell size={18} className="text-gray-500" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                            </button>
                            <button onClick={toggleLang} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs">
                                <Globe size={14} />
                                <span className="font-medium">{lang === "fr" ? "FR" : "EN"}</span>
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
                {/* DESKTOP SIDEBAR - inchangé */}
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
                            const active = href === "/profile";
                            return (
                                <a
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                            ? "bg-blue-700 text-white shadow-lg"
                                            : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"
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
                        <aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl animate-slide-in-left">
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
                                    const active = href === "/profile";
                                    return (
                                        <a
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"
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
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold transition-all">
                                    <LogOut size={16} /> {currentT.logout}
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col md:ml-64 min-h-screen w-full overflow-x-hidden">
                    <div className="h-14 md:h-[72px]" />

                    <div className="flex-1 px-4 py-6 w-full max-w-5xl mx-auto pb-28 md:pb-6 overflow-x-hidden">

                        {/* Bannière de profil premium - STYLE AMÉLIORÉ */}
                        <div className="relative mb-16">
                            <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 opacity-30">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <defs>
                                                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <circle cx="2" cy="2" r="1.5" fill="white" />
                                                    <circle cx="12" cy="12" r="1" fill="white" opacity="0.5" />
                                                </pattern>
                                            </defs>
                                            <rect width="100" height="100" fill="url(#dots)" />
                                        </svg>
                                    </div>
                                    <svg className="absolute bottom-0 left-0 w-full h-16" viewBox="0 0 1440 120" preserveAspectRatio="none">
                                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="white" fillOpacity="0.2" />
                                    </svg>
                                </div>
                                {/* Décoration de vagues */}
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent" />
                            </div>

                            {/* Avatar circulaire premium */}
                            <div className="absolute -bottom-12 left-6 sm:left-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-2xl flex items-center justify-center ring-4 ring-white">
                                        <div className="w-[92px] h-[92px] sm:w-[104px] sm:h-[104px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-inner">
                                            <span className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg tracking-wide">{firstLetter}</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                                        <CheckCircle size={12} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Bouton d'édition stylisé */}
                            <div className="absolute bottom-4 right-4">
                                {!isEditing ? (
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl text-gray-700 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                        disabled={saving}
                                    >
                                        <Edit2 size={16} className="text-blue-600" />
                                        {currentT.edit}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl text-red-600 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <XCircle size={16} />
                                            {currentT.cancel}
                                        </button>
                                        <button
                                            onClick={handleEditToggle}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {saving ? "..." : currentT.save}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profil header - STYLE AMÉLIORÉ */}
                        <div className="text-center mt-8 mb-10">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{studentName}</h2>
                            <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-gray-100 rounded-full">
                                <Bookmark size={12} className="text-gray-500" />
                                <p className="text-sm text-gray-600 font-mono">{formData.matricule}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-semibold shadow-sm border border-blue-100">
                                    <Award size={14} />
                                    {formData.filiere_label}
                                </span>
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-xs font-semibold shadow-sm border border-purple-100">
                                    <GraduationCap size={14} />
                                    {formData.niveau_label}
                                </span>
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full text-xs font-semibold shadow-sm border border-emerald-100">
                                    <CalendarIcon size={14} />
                                    {currentT.memberSince} {memberYear}
                                </span>
                            </div>
                        </div>

                        {/* Statistiques rapides - NOUVEAU */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-xs font-medium">{currentT.requestsCount}</p>
                                        <p className="text-white text-2xl font-bold mt-1">0</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <FileText size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-xs font-medium">{currentT.documentsCount}</p>
                                        <p className="text-white text-2xl font-bold mt-1">0</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <BookOpen size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cartes d'informations premium - STYLE AMÉLIORÉ */}
                        <div className="space-y-6">
                            {/* Carte personnelle */}
                            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-gray-100">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                            <User size={14} className="text-white" />
                                        </div>
                                        {currentT.personalInfo}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.nom}</label>
                                            {isEditing ? (
                                                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm group-hover:text-blue-600 transition-colors">{formData.nom}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.prenom}</label>
                                            {isEditing ? (
                                                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.prenom}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.matricule}</label>
                                            {isEditing ? (
                                                <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm font-mono">{formData.matricule}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.dateNaissance}</label>
                                            {isEditing ? (
                                                <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.date_naissance || "Non renseignée"}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.poste}</label>
                                            {isEditing ? (
                                                <input type="text" name="poste" value={formData.poste} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm flex items-center gap-2">
                                                    <Briefcase size={14} className="text-blue-500" />
                                                    {formData.poste}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carte académique */}
                            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-b border-gray-100">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                                            <GraduationCap size={14} className="text-white" />
                                        </div>
                                        {currentT.academicInfo}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.filiere}</label>
                                            {isEditing ? (
                                                <select name="id_filiere" value={formData.id_filiere} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-gray-50 focus:bg-white">
                                                    <option value="">Sélectionner une filière</option>
                                                    {filieres.map(f => (
                                                        <option key={f.id_filiere} value={f.id_filiere}>{f.nom}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.filiere_label}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.niveau}</label>
                                            {isEditing ? (
                                                <select name="id_niveau" value={formData.id_niveau} onChange={handleChange} disabled={!formData.id_filiere} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                                                    <option value="">Sélectionner un niveau</option>
                                                    {niveaux.map(n => (
                                                        <option key={n.id_niveau} value={n.id_niveau}>{n.niveau}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.niveau_label}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.rattrapage}</label>
                                            {isEditing ? (
                                                <select name="niveau_2_label" value={formData.niveau_2_label} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-gray-50 focus:bg-white">
                                                    {rattrapageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.niveau_2_label}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carte contact */}
                            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-gray-100">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                                            <Mail size={14} className="text-white" />
                                        </div>
                                        {currentT.contactInfo}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.email}</label>
                                            {isEditing ? (
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm break-all">{formData.email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.phone}</label>
                                            {isEditing ? (
                                                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white" />
                                            ) : (
                                                <p className="text-gray-800 font-semibold text-sm">{formData.telephone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carte sécurité - Mot de passe avec 3 champs */}
                            <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-gray-100">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                                            <Shield size={14} className="text-white" />
                                        </div>
                                        {currentT.securityInfo}
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-5">
                                        {/* Mot de passe actuel */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.currentPassword}</label>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                                                        <Lock size={16} className="text-gray-400 shrink-0" />
                                                        <input
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            name="current_password"
                                                            value={formData.current_password}
                                                            onChange={handleChange}
                                                            placeholder="••••••••"
                                                            className="w-full py-2.5 bg-transparent outline-none text-sm text-gray-800"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                                        >
                                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                    <Lock size={14} className="text-gray-400" />
                                                    <p className="text-gray-600 text-sm">••••••••</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Nouveau mot de passe */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.newPassword}</label>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                                                        <Lock size={16} className="text-gray-400 shrink-0" />
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            name="new_password"
                                                            value={formData.new_password}
                                                            onChange={handleChange}
                                                            placeholder="Nouveau mot de passe"
                                                            className="w-full py-2.5 bg-transparent outline-none text-sm text-gray-800"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                                        >
                                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                    <Lock size={14} className="text-gray-400" />
                                                    <p className="text-gray-600 text-sm">••••••••</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirmer le nouveau mot de passe */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentT.confirmPassword}</label>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                                                        <Lock size={16} className="text-gray-400 shrink-0" />
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirm_password"
                                                            value={formData.confirm_password}
                                                            onChange={handleChange}
                                                            placeholder="Confirmer le mot de passe"
                                                            className="w-full py-2.5 bg-transparent outline-none text-sm text-gray-800"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                    <Lock size={14} className="text-gray-400" />
                                                    <p className="text-gray-600 text-sm">••••••••</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Message d'erreur mot de passe */}
                                        {passwordError && (
                                            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                                                <XCircle size={14} />
                                                <span>{passwordError}</span>
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <p className="text-[11px] text-gray-400 italic flex items-center gap-1">
                                                <Shield size={12} />
                                                Pour modifier votre mot de passe, cliquez sur "Modifier"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* MOBILE BOTTOM NAV - inchangé */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
                    {[
                        { href: "/dashboard", icon: LayoutDashboard, label: currentT.dashboard },
                        { href: "/request", icon: FileText, label: currentT.myRequests },
                        { href: "/minette", icon: MessageCircle, label: "Minette IA" },
                        { href: "/docs", icon: BookOpen, label: currentT.documentsLabel },
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
                            <a
                                key={href}
                                href={href}
                                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium transition-all ${href === "/profile" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                            >
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
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
                .animate-slide-in-left { animation: slide-in-left 0.3s ease-out; }
            `}</style>
        </div>
    );
}

export default Profile;