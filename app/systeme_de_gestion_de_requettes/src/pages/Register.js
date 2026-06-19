import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Lock, GraduationCap, CalendarDays,
    Eye, EyeOff, Home, ChevronLeft, ChevronRight, Phone,
    ShieldCheck, RefreshCw, Globe,
} from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import API_BASE_URL from "../config";

const TEXTS = {
    fr: {
        title: "Inscription Étudiant",
        subtitle: "Créez votre compte pour accéder à la plateforme",
        step1Title: "Identité",
        step2Title: "Académique",
        step3Title: "Accès",
        nom: "Nom",
        nomPlaceholder: "Entrez votre nom",
        prenom: "Prénom",
        prenomPlaceholder: "Entrez votre prénom",
        dateNaissance: "Date de naissance",
        matricule: "Matricule",
        matriculePlaceholder: "Ex : 24I0013FS",
        filiere: "Filière",
        filierePlaceholder: "Sélectionner une filière",
        niveau: "Niveau",
        niveauPlaceholder: "Sélectionner un niveau",
        profileAcademique: "Profil académique",
        profilePlaceholder: "Sélectionnez votre profil",
        reprendMatiere: "Reprend matière (L1)",
        toutValide: "Tout validé (passe en L2)",
        email: "Email",
        emailPlaceholder: "votre@email.com",
        telephone: "Téléphone",
        telephonePlaceholder: "Ex : 690000000",
        password: "Mot de passe",
        passwordPlaceholder: "Choisissez un mot de passe",
        passwordHint: "Minimum 8 caractères, une majuscule et un chiffre",
        next: "Suivant",
        back: "Retour",
        submit: "Créer mon compte",
        loading: "Inscription...",
        alreadyAccount: "Déjà un compte ?",
        login: "Se connecter",
        backHome: "Retour à l'accueil",
        errorEmpty: "Veuillez remplir tous les champs obligatoires.",
        errorAge: "L'âge doit être supérieur ou égal à 15 ans.",
        errorName: "Ce champ doit contenir au moins une lettre et ne peut pas être uniquement composé de chiffres.",
        errorMatricule: "Le matricule doit respecter le format 24I0013FS.",
        errorEmail: "Entrez une adresse email valide.",
        errorTelephone: "Entrez un numéro camerounais valide, ex : 690000000 ou +237690000000.",
        errorPassword: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
        errorRegister: "Erreur lors de l'inscription.",
        successRegister: "Inscription vérifiée ! Redirection vers le tableau de bord...",
        verifyTitle: "Vérification de sécurité",
        verifySubtitle: "Entrez le code envoyé à votre email avant la création du compte.",
        code: "Code email",
        codePlaceholder: "Ex : 123456",
        robotCheck: "Vérification anti-robot",
        robotPlaceholder: "Votre réponse",
        refreshCaptcha: "Nouveau challenge",
        verifySubmit: "Vérifier et créer le compte",
        verifying: "Vérification...",
        codeSent: "Un code de vérification a été envoyé à votre adresse email.",
        restart: "Modifier les informations",
    },
    en: {
        title: "Student Registration",
        subtitle: "Create your account to access the platform",
        step1Title: "Identity",
        step2Title: "Academic",
        step3Title: "Access",
        nom: "Last Name",
        nomPlaceholder: "Enter your last name",
        prenom: "First Name",
        prenomPlaceholder: "Enter your first name",
        dateNaissance: "Date of Birth",
        matricule: "Student ID",
        matriculePlaceholder: "Ex: 24I0013FS",
        filiere: "Program",
        filierePlaceholder: "Select a program",
        niveau: "Level",
        niveauPlaceholder: "Select a level",
        profileAcademique: "Academic Profile",
        profilePlaceholder: "Select your profile",
        reprendMatiere: "Retake course (L1)",
        toutValide: "All validated (move to L2)",
        email: "Email",
        emailPlaceholder: "your@email.com",
        telephone: "Phone",
        telephonePlaceholder: "Ex: 690000000",
        password: "Password",
        passwordPlaceholder: "Choose a password",
        passwordHint: "Minimum 8 characters, one uppercase and one number",
        next: "Next",
        back: "Back",
        submit: "Create my account",
        loading: "Registering...",
        alreadyAccount: "Already have an account?",
        login: "Log in",
        backHome: "Back to home",
        errorEmpty: "Please fill in all required fields.",
        errorAge: "Age must be greater than or equal to 15 years.",
        errorName: "This field must contain at least one letter and cannot contain only digits.",
        errorMatricule: "The student ID must follow the format 24I0013FS.",
        errorEmail: "Enter a valid email address.",
        errorTelephone: "Enter a valid Cameroonian phone number, ex: 690000000 or +237690000000.",
        errorPassword: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
        errorRegister: "Registration error.",
        successRegister: "Registration verified! Redirecting to dashboard...",
        verifyTitle: "Security verification",
        verifySubtitle: "Enter the code sent to your email before the account is created.",
        code: "Email code",
        codePlaceholder: "Ex: 123456",
        robotCheck: "Anti-robot verification",
        robotPlaceholder: "Your answer",
        refreshCaptcha: "New challenge",
        verifySubmit: "Verify and create account",
        verifying: "Verifying...",
        codeSent: "A verification code has been sent to your email address.",
        restart: "Edit information",
    },
};

// ─── Composants réutilisables ─────────────────────────────────────
function Field({ label, icon, children }) {
    return (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">{label}</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 shadow-sm">
                <span className="text-gray-400 shrink-0">{icon}</span>
                {children}
            </div>
        </div>
    );
}

const inputCls = "w-full py-2.5 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400";
const errorCls = "text-[11px] font-medium text-red-600";

function FieldError({ message }) {
    if (!message) return null;
    return <p className={errorCls}>{message}</p>;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeCameroonPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.startsWith("237") ? digits.slice(3) : digits;
}

function SelectField({ label, icon, name, value, onChange, children, required, disabled }) {
    return (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">{label}</label>
            <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 shadow-sm">
                <span className="text-gray-400 shrink-0">{icon}</span>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className="w-full py-2.5 bg-transparent outline-none text-sm text-gray-800 appearance-none cursor-pointer"
                >
                    {children}
                </select>
            </div>
        </div>
    );
}

function StepDots({ current, total }) {
    return (
        <div className="flex items-center justify-center gap-1.5" aria-label={`Étape ${current} sur ${total}`}>
            {Array.from({ length: total }, (_, i) => {
                const step = i + 1;
                const isPast = step < current;
                const isActive = step === current;
                return (
                    <span
                        key={step}
                        className={`
              rounded-full transition-all duration-300
              ${isActive ? "w-5 h-1.5 bg-blue-600" : ""}
              ${isPast ? "w-1.5 h-1.5 bg-blue-400" : ""}
              ${!isActive && !isPast ? "w-1.5 h-1.5 bg-gray-200" : ""}
            `}
                    />
                );
            })}
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────
function Register() {
    const navigate = useNavigate();
    const { lang, toggleLang } = useLanguage();
    const t = TEXTS[lang];

    const [filieres, setFilieres] = useState([]);
    const [niveaux, setNiveaux] = useState([]);

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        dateNaissance: "",
        matricule: "",
        id_filiere: "",
        id_niveau: "",
        profileAcademique: "",
        email: "",
        telephone: "",
        password: "",
    });

    const [showPwd, setShowPwd] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [captcha, setCaptcha] = useState({ token: "", question: "" });
    const [captchaAnswer, setCaptchaAnswer] = useState("");

    const TOTAL_STEPS = 3;

    const selectedNiveau = niveaux.find((n) => String(n.id_niveau) === String(formData.id_niveau));
    const selectedNiveauLabel = selectedNiveau?.niveau?.toUpperCase() || "";
    const needsProfile = selectedNiveauLabel === "LICENCE 2" || selectedNiveauLabel === "L2";
    const maxBirthDate = (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 15);
        return formatDateInput(date);
    })();

    const isOldEnough = (dateNaissance) => {
        if (!dateNaissance) return false;
        return dateNaissance <= maxBirthDate;
    };
    const nameRegex = /^(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[\wÀ-ÖØ-öø-ÿ' -]{2,100}$/u;
    const matriculeRegex = /^\d{2}[A-Z]{1,4}\d{4}FS$/i;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^6[2-9]\d{7}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // ─── Chargement des filières ─────────────────────────────────
    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                const filieresRes = await fetch(`${API_BASE_URL}/filiere/get_all_filiere/`);

                if (filieresRes.ok) {
                    const data = await filieresRes.json();
                    console.log("Filières:", data);
                    setFilieres(data);
                } else {
                    console.error("Erreur filières:", filieresRes.status);
                }

            } catch (err) {
                console.error("Erreur chargement filières:", err);
            }
        };

        fetchFilieres();
    }, []);

    // ─── Chargement des niveaux selon la filière sélectionnée ─────
    useEffect(() => {
        if (!formData.id_filiere) {
            setNiveaux([]);
            return;
        }

        const fetchNiveauxParFiliere = async () => {
            try {
                const niveauxRes = await fetch(`${API_BASE_URL}/niveau/by_filiere/${formData.id_filiere}`);

                if (niveauxRes.ok) {
                    const data = await niveauxRes.json();
                    console.log("Niveaux de la filière:", data);
                    setNiveaux(data);
                } else {
                    console.error("Erreur niveaux:", niveauxRes.status);
                    setNiveaux([]);
                }
            } catch (err) {
                console.error("Erreur chargement niveaux:", err);
                setNiveaux([]);
            }
        };

        fetchNiveauxParFiliere();
    }, [formData.id_filiere]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError("");
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "id_filiere") {
            setFormData((prev) => ({
                ...prev,
                id_filiere: value,
                id_niveau: "",
                profileAcademique: "",
            }));
            return;
        }

        if (name === "id_niveau") {
            const niv = niveaux.find((n) => String(n.id_niveau) === String(value));
            const label = niv?.niveau?.toUpperCase() || "";
            setFormData((prev) => ({
                ...prev,
                id_niveau: value,
                profileAcademique: label === "LICENCE 2" || label === "L2" ? prev.profileAcademique : "",
            }));
            return;
        }

        if (name === "telephone") {
            setFormData((prev) => ({ ...prev, telephone: value.replace(/[^\d+]/g, "").slice(0, 13) }));
            return;
        }

        if (name === "matricule") {
            setFormData((prev) => ({ ...prev, matricule: value.toUpperCase().replace(/\s/g, "").slice(0, 12) }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getStepErrors = (s) => {
        const errors = {};

        if (s === 1) {
            if (!formData.nom.trim()) errors.nom = t.errorEmpty;
            else if (!nameRegex.test(formData.nom.trim())) errors.nom = t.errorName;
            if (!formData.prenom.trim()) errors.prenom = t.errorEmpty;
            else if (!nameRegex.test(formData.prenom.trim())) errors.prenom = t.errorName;
            if (!formData.dateNaissance) errors.dateNaissance = t.errorEmpty;
            else if (!isOldEnough(formData.dateNaissance)) errors.dateNaissance = t.errorAge;
            return errors;
        }

        if (s === 2) {
            if (!formData.matricule.trim()) errors.matricule = t.errorEmpty;
            else if (!matriculeRegex.test(formData.matricule.trim())) errors.matricule = t.errorMatricule;
            if (!formData.id_filiere) errors.id_filiere = t.errorEmpty;
            if (!formData.id_niveau) errors.id_niveau = t.errorEmpty;
            if (needsProfile && !formData.profileAcademique) errors.profileAcademique = t.errorEmpty;
            return errors;
        }

        if (s === 3) {
            if (!formData.email.trim()) errors.email = t.errorEmpty;
            else if (!emailRegex.test(formData.email.trim())) errors.email = t.errorEmail;
            if (!formData.telephone.trim()) errors.telephone = t.errorEmpty;
            else if (!phoneRegex.test(normalizeCameroonPhone(formData.telephone))) errors.telephone = t.errorTelephone;
            if (!formData.password.trim()) errors.password = t.errorEmpty;
            else if (!passwordRegex.test(formData.password)) errors.password = t.errorPassword;
            return errors;
        }

        return errors;
    };

    const hasErrors = (errors) => Object.values(errors).some(Boolean);

    const loadCaptcha = async () => {
        const response = await fetch(`${API_BASE_URL}/etudiant/registration/captcha`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || t.errorRegister);
        setCaptcha({ token: data.token, question: data.question });
        setCaptchaAnswer("");
    };

    useEffect(() => {
        if (verificationToken && !captcha.token) {
            loadCaptcha().catch(() => {});
        }
    }, [verificationToken, captcha.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const stepErrors = getStepErrors(step);
        if (hasErrors(stepErrors)) {
            setFieldErrors(stepErrors);
            setError(t.errorEmpty);
            return;
        }

        setFieldErrors({});

        if (step < TOTAL_STEPS) {
            setStep((s) => s + 1);
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                matricule: formData.matricule.trim().toUpperCase(),
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                date_naissance: formData.dateNaissance || null,
                email: formData.email.trim(),
                mot_de_passe: formData.password,
                telephone: parseInt(normalizeCameroonPhone(formData.telephone), 10),
                id_niveau: parseInt(formData.id_niveau),
            };

            const response = await fetch(`${API_BASE_URL}/etudiant/registration/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etudiant: payload }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.detail || data.error || t.errorRegister);
            }

            setVerificationToken(data.verification_token);
            setSuccess(data.message || t.codeSent);
            await loadCaptcha();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRegistration = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!verificationCode.trim() || !captchaAnswer.trim()) {
            setError(t.errorEmpty);
            return;
        }

        setVerifying(true);

        try {
            const response = await fetch(`${API_BASE_URL}/etudiant/registration/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    verification_token: verificationToken,
                    code: verificationCode.trim(),
                    captcha: {
                        token: captcha.token,
                        answer: captchaAnswer.trim(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || t.errorRegister);
            }

            localStorage.setItem("user", JSON.stringify(data));
            setSuccess(t.successRegister);
            setTimeout(() => navigate("/dashboard"), 900);
        } catch (err) {
            setError(err.message);
            try {
                await loadCaptcha();
            } catch {
                // Le message d'erreur principal reste celui de la verification.
            }
        } finally {
            setVerifying(false);
        }
    };

    const restartRegistration = () => {
        setStep(1);
        setVerificationToken("");
        setVerificationCode("");
        setCaptcha({ token: "", question: "" });
        setCaptchaAnswer("");
        setSuccess("");
        setError("");
    };

    // ─── Rendu ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
            <header className={`sticky top-0 left-0 right-0 z-50 bg-blue-900/95 backdrop-blur-md text-white`}>
                <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
                    <a href="/" className="flex items-center gap-2.5 shrink-0">
                        <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5 object-contain" />
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-tight leading-none">Université d'Ebolowa</p>
                            <p className="text-[10px] text-blue-300 leading-none mt-0.5">Faculté des Sciences</p>
                        </div>
                    </a>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-colors duration-150"
                            aria-label="Changer de langue"
                        >
                            <span className="">({lang === "fr" ? "EN" : "FR"})</span>
                            <Globe size={15} className="hidden lg:inline-block" />
                        </button>
                        <a href="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors duration-150">
                            Se connecter
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-6 min-h-0">
                <div className="w-full max-w-xl">
                    <div className="text-center mb-3">
                        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
                        <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-5 pt-4 pb-4">
                        {error && (
                            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-600">
                                {success}
                            </div>
                        )}

                        {verificationToken ? (
                            <form onSubmit={handleVerifyRegistration} className="space-y-4" noValidate>
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-center">
                                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <h2 className="text-base font-extrabold text-gray-900">{t.verifyTitle}</h2>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{t.verifySubtitle}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700">{t.code}</label>
                                    <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 shadow-sm">
                                        <Mail size={15} className="text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder={t.codePlaceholder}
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            className={inputCls}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <label className="block text-xs font-semibold text-gray-700">{t.robotCheck}</label>
                                        <button type="button" onClick={loadCaptcha} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                                            <RefreshCw size={12} />
                                            {t.refreshCaptcha}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-[1fr_1.1fr] gap-2">
                                        <div className="flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-extrabold text-blue-700">
                                            {captcha.question || "..."}
                                        </div>
                                        <input
                                            type="text"
                                            value={captchaAnswer}
                                            onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^\d-]/g, "").slice(0, 4))}
                                            placeholder={t.robotPlaceholder}
                                            inputMode="numeric"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <button type="button" onClick={restartRegistration} className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 text-xs font-semibold transition-all duration-150 shrink-0">
                                        <ChevronLeft size={14} />
                                        {t.restart}
                                    </button>
                                    <button type="submit" disabled={verifying} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200">
                                        {verifying ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                            </svg>
                                        ) : (
                                            <ShieldCheck size={15} />
                                        )}
                                        {verifying ? t.verifying : t.verifySubmit}
                                    </button>
                                </div>
                            </form>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Field label={t.nom} icon={<User size={15} />}>
                                                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder={t.nomPlaceholder} className={inputCls} required />
                                            </Field>
                                            <FieldError message={fieldErrors.nom} />
                                        </div>
                                        <div>
                                            <Field label={t.prenom} icon={<User size={15} />}>
                                                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder={t.prenomPlaceholder} className={inputCls} required />
                                            </Field>
                                            <FieldError message={fieldErrors.prenom} />
                                        </div>
                                    </div>
                                    <Field label={t.dateNaissance} icon={<CalendarDays size={15} />}>
                                        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} max={maxBirthDate} className={`${inputCls} text-gray-700`} required />
                                    </Field>
                                    <FieldError message={fieldErrors.dateNaissance} />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <Field label={t.matricule} icon={<GraduationCap size={15} />}>
                                        <input type="text" name="matricule" value={formData.matricule} onChange={handleChange} placeholder={t.matriculePlaceholder} className={inputCls} required />
                                    </Field>
                                    <FieldError message={fieldErrors.matricule} />

                                    <SelectField label={t.filiere} icon={<GraduationCap size={15} />} name="id_filiere" value={formData.id_filiere} onChange={handleChange}>
                                        <option value="">{t.filierePlaceholder}</option>
                                        {filieres.map((f) => (
                                            <option key={f.id_filiere} value={f.id_filiere}>{f.nom}</option>
                                        ))}
                                    </SelectField>
                                    <FieldError message={fieldErrors.id_filiere} />

                                    <SelectField label={t.niveau} icon={<GraduationCap size={15} />} name="id_niveau" value={formData.id_niveau} onChange={handleChange} disabled={!formData.id_filiere}>
                                        <option value="">{t.niveauPlaceholder}</option>
                                        {niveaux.map((n) => (
                                            <option key={n.id_niveau} value={n.id_niveau}>
                                                {n.niveau}
                                            </option>
                                        ))}
                                    </SelectField>
                                    <FieldError message={fieldErrors.id_niveau} />

                                    {needsProfile && (
                                        <>
                                            <SelectField label={t.profileAcademique} icon={<GraduationCap size={15} />} name="profileAcademique" value={formData.profileAcademique} onChange={handleChange} required>
                                                <option value="">{t.profilePlaceholder}</option>
                                                <option value="reprend_matiere">{t.reprendMatiere}</option>
                                                <option value="tout_valide">{t.toutValide}</option>
                                            </SelectField>
                                            <FieldError message={fieldErrors.profileAcademique} />
                                        </>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <Field label={t.email} icon={<Mail size={15} />}>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t.emailPlaceholder} autoComplete="email" className={inputCls} required />
                                    </Field>
                                    <FieldError message={fieldErrors.email} />

                                    <Field label={t.telephone} icon={<Phone size={15} />}>
                                        <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder={t.telephonePlaceholder} inputMode="numeric" autoComplete="tel" className={inputCls} required />
                                    </Field>
                                    <FieldError message={fieldErrors.telephone} />

                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-gray-700">{t.password}</label>
                                        <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-150 shadow-sm">
                                            <Lock size={15} className="text-gray-400 shrink-0" />
                                            <input
                                                type={showPwd ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder={t.passwordPlaceholder}
                                                autoComplete="new-password"
                                                className={`${inputCls} flex-1`}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 p-1 -mr-1 transition-colors" aria-label={showPwd ? "Masquer" : "Afficher"}>
                                                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{t.passwordHint}</p>
                                        <FieldError message={fieldErrors.password} />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 space-y-3">
                                <div className="flex items-center gap-3">
                                    {step > 1 && (
                                        <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 text-xs font-semibold transition-all duration-150 shrink-0">
                                            <ChevronLeft size={14} />
                                            {t.back}
                                        </button>
                                    )}
                                    <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200">
                                        {loading ? (
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                                                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                            </svg>
                                        ) : step < TOTAL_STEPS ? (
                                            <>
                                                {t.next}
                                                <ChevronRight size={14} />
                                            </>
                                        ) : (
                                            t.submit
                                        )}
                                    </button>
                                </div>
                                <StepDots current={step} total={TOTAL_STEPS} />
                            </div>
                        </form>
                        )}
                    </div>

                    <div className="text-center mt-3 space-y-1">
                        <p className="text-sm text-gray-500">
                            {t.alreadyAccount}{" "}
                            <a href="/login" className="text-blue-600 font-semibold hover:underline">
                                {t.login}
                            </a>
                        </p>
                        <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <Home size={15} />
                            {t.backHome}
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Register;
