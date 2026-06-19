import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../components/LanguageContext";
import API_BASE_URL from "../config";
import {
  FileText,
  Clock3,
  BookOpen,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Send,
  CheckCircle,
} from "lucide-react";

// ─── translations ─────────────────────────────────────────────────────────────
const translations = {
  fr: {
    heroTitle: "Gérez vos requêtes académiques en ligne",
    heroSubtitle:
      "Soumettez, suivez et gérez vos demandes universitaires depuis votre téléphone, rapidement et en toute sécurité.",
    heroPreviewTitle: "Suivi de requête",
    heroPreviewStatus: "En traitement",
    heroPreviewRequest: "Demande de quitus",
    heroPreviewStudent: "Dossier transmis aux services compétents",
    heroPreviewStep1: "Secrétariat du Doyen",
    heroPreviewStep2: "Doyen",
    heroPreviewStep3: "Scolarité",
    statRequests: "Requêtes centralisées",
    statAccess: "Accès mobile",
    statSecurity: "Données protégées",
    login: "Se connecter",
    register: "Créer un compte",
    getStarted: "Démarrer",
    whyTitle: "Pourquoi utiliser cette plateforme ?",
    whyText1:
      "Cette plateforme simplifie la gestion des requêtes académiques pour les étudiants de l'Université d'Ebolowa.",
    whyText2:
      "Envoyez vos demandes directement en ligne sans vous déplacer au service administratif.",
    whyText3:
      "Suivez l'évolution de vos validations en temps réel, à tout moment.",
    advantagesTitle: "Avantages du système",
    advantage1: "Sécurisation des requêtes",
    advantage1Sub: "Vos demandes sont protégées et archivées.",
    advantage2: "Gain de temps",
    advantage2Sub: "Plus besoin de files d'attente administratives.",
    advantage3: "Documents numériques",
    advantage3Sub: "Formulaires et pièces jointes gérés en ligne.",
    advantage4: "Accès rapide",
    advantage4Sub: "Informations académiques disponibles 24h/24.",
    howTitle: "Comment ça marche ?",
    howSubtitle: "4 étapes simples pour démarrer.",
    step1Title: "Créer un compte",
    step1Text: "Inscrivez-vous avec vos informations universitaires.",
    step2Title: "Se connecter",
    step2Text: "Accédez à votre espace étudiant sécurisé.",
    step3Title: "Soumettre une requête",
    step3Text: "Choisissez le type de demande et envoyez-la.",
    step4Title: "Suivre la validation",
    step4Text: "Consultez les réponses en temps réel.",
    processTitle: "Processus de traitement",
    processSubtitle:
      "Comment une requête est prise en charge de sa soumission à sa validation.",
    processStep1Title: "Soumission",
    processStep1Text: "L'étudiant envoie sa demande via le formulaire.",
    processStep2Title: "Traitement",
    processStep2Text: "Le service vérifie et analyse la requête.",
    processStep3Title: "Validation",
    processStep3Text: "La décision est notifiée et le suivi mis à jour.",
    contactTitle: "Contact",
    hoursTitle: "Horaires",
    assistTitle: "Assistance",
    contactPhone: "+237 657713726",
    contactEmail: "kevinbissouth237@gmail.com",
    contactAddress: "Ebolowa - Cameroun",
    hoursDays: "Lundi – Vendredi",
    hoursTime: "07h30 – 17h00",
    assistText:
      "Notre équipe est disponible pour vous aider à utiliser la plateforme efficacement.",
    footer: "© 2026 Université d'Ebolowa — Tous droits réservés",
    footerSub: "Plateforme numérique de gestion des requêtes universitaires",
    formTitle: "Envoyez-nous un message",
    formSubtitle: "Nous vous répondrons dans les plus brefs délais",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    message: "Message",
    send: "Envoyer le message",
    sending: "Envoi en cours...",
    successMessage: "Message envoyé avec succès ! Nous vous répondrons rapidement.",
    errorMessage: "Une erreur est survenue. Veuillez réessayer.",
    formPlaceholderFirstName: "Votre prénom",
    formPlaceholderLastName: "Votre nom",
    formPlaceholderEmail: "votre@email.com",
    formPlaceholderPhone: "+237 6XX XXX XXX",
    formPlaceholderMessage: "Décrivez votre demande...",
  },
  en: {
    heroTitle: "Manage your academic requests online",
    heroSubtitle:
      "Submit, track and manage your university requests from your phone, quickly and securely.",
    heroPreviewTitle: "Request tracking",
    heroPreviewStatus: "In review",
    heroPreviewRequest: "Clearance request",
    heroPreviewStudent: "File forwarded to the competent offices",
    heroPreviewStep1: "Dean's Secretariat",
    heroPreviewStep2: "Dean",
    heroPreviewStep3: "Academic Office",
    statRequests: "Centralized requests",
    statAccess: "Mobile access",
    statSecurity: "Protected data",
    login: "Log in",
    register: "Create account",
    getStarted: "Get Started",
    whyTitle: "Why use this platform?",
    whyText1:
      "This platform simplifies academic request management for students at the University of Ebolowa.",
    whyText2:
      "Submit your requests online without visiting the administrative office.",
    whyText3: "Track your approvals in real time, anytime.",
    advantagesTitle: "System benefits",
    advantage1: "Secure requests",
    advantage1Sub: "Your submissions are protected and archived.",
    advantage2: "Save time",
    advantage2Sub: "No more administrative queues.",
    advantage3: "Digital documents",
    advantage3Sub: "Forms and attachments managed online.",
    advantage4: "Fast access",
    advantage4Sub: "Academic info available 24/7.",
    howTitle: "How does it work?",
    howSubtitle: "4 simple steps to get started.",
    step1Title: "Create an account",
    step1Text: "Register with your university details.",
    step2Title: "Log in",
    step2Text: "Access your secure student space.",
    step3Title: "Submit a request",
    step3Text: "Choose the request type and send it.",
    step4Title: "Track approval",
    step4Text: "Check responses in real time.",
    processTitle: "How requests are handled",
    processSubtitle: "From submission to approval, step by step.",
    processStep1Title: "Submission",
    processStep1Text: "The student sends the request via the form.",
    processStep2Title: "Review",
    processStep2Text: "The office checks and processes the request.",
    processStep3Title: "Validation",
    processStep3Text: "The decision is notified and tracking updated.",
    contactTitle: "Contact",
    hoursTitle: "Hours",
    assistTitle: "Support",
    contactPhone: "+237 657713726",
    contactEmail: "kevinbissouth237@gmail.com",
    contactAddress: "Ebolowa - Cameroon",
    hoursDays: "Monday – Friday",
    hoursTime: "07:30 – 17:00",
    assistText:
      "Our team is available to help you use the platform effectively.",
    footer: "© 2026 University of Ebolowa — All rights reserved",
    footerSub: "Digital academic request management platform",
    formTitle: "Send us a message",
    formSubtitle: "We'll get back to you as soon as possible",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    send: "Send message",
    sending: "Sending...",
    successMessage: "Message sent successfully! We'll respond quickly.",
    errorMessage: "An error occurred. Please try again.",
    formPlaceholderFirstName: "Your first name",
    formPlaceholderLastName: "Your last name",
    formPlaceholderEmail: "your@email.com",
    formPlaceholderPhone: "+237 6XX XXX XXX",
    formPlaceholderMessage: "Describe your request...",
  },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const features = (t) => [
  {
    icon: <ShieldCheck size={22} />,
    bg: "bg-green-100",
    color: "text-green-700",
    title: t.advantage1,
    sub: t.advantage1Sub,
  },
  {
    icon: <Clock3 size={22} />,
    bg: "bg-amber-100",
    color: "text-amber-700",
    title: t.advantage2,
    sub: t.advantage2Sub,
  },
  {
    icon: <FileText size={22} />,
    bg: "bg-blue-100",
    color: "text-blue-700",
    title: t.advantage3,
    sub: t.advantage3Sub,
  },
  {
    icon: <BookOpen size={22} />,
    bg: "bg-purple-100",
    color: "text-purple-700",
    title: t.advantage4,
    sub: t.advantage4Sub,
  },
];

const steps = (t) => [
  { n: "1", color: "bg-blue-600",   title: t.step1Title, text: t.step1Text },
  { n: "2", color: "bg-green-600",  title: t.step2Title, text: t.step2Text },
  { n: "3", color: "bg-amber-500",  title: t.step3Title, text: t.step3Text },
  { n: "4", color: "bg-purple-600", title: t.step4Title, text: t.step4Text },
];

const stats = (t) => [
  { value: "100%", label: t.statAccess },
  { value: "24h/24", label: t.statRequests },
  { value: "SSL", label: t.statSecurity },
];

// ─── component ────────────────────────────────────────────────────────────────
function Home() {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [submitError, setSubmitError] = useState("");

  const t = translations[lang];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE_URL}/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || t.errorMessage);
      }
      
      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitError(error.message || t.errorMessage);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-gray-50">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-cover bg-center px-4 pt-28 pb-20 sm:py-16 lg:py-18 min-h-[88svh] sm:min-h-[78svh] lg:min-h-[calc(100svh-4rem)] overflow-hidden"
        style={{ backgroundImage: "url('/universite.jpg')" }}
      >
        {/* gradient overlay — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/75 via-blue-900/65 to-blue-950/85" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-950/45 to-transparent" />
        <div className="absolute left-1/2 top-24 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-3xl animate-softPulse" />
        <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-gray-50 via-blue-950/20 to-transparent sm:block" />

        <div className="relative z-10 grid max-w-6xl mx-auto lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div className="animate-fadeIn text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.02] mb-5 tracking-tight text-balance">
              {t.heroTitle}
            </h2>

            <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="mt-14 flex flex-col sm:mt-0 sm:flex-row gap-3 w-full max-w-xl mx-auto lg:mx-0">
              <a
                href="/register"
                className="
                  group flex w-full items-center justify-center gap-2
                  px-6 py-4 rounded-2xl
                  bg-cyan-400 hover:bg-cyan-300 active:scale-95
                  text-blue-950 font-black text-base
                  shadow-xl shadow-cyan-500/25
                  transition-all duration-200 hover:-translate-y-0.5
                "
              >
                {t.getStarted}
                <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-9 max-w-xl mx-auto lg:mx-0">
              {stats(t).map((item, index) => (
                <div
                  key={item.label}
                  className="mobile-stat-card rounded-2xl border border-white/12 bg-white/10 px-3 py-4 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <p className="text-lg sm:text-xl font-black text-white leading-none">{item.value}</p>
                  <p className="text-[11px] sm:text-xs text-blue-100 mt-2 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block animate-floatSlow">
            <div className="relative rounded-2xl border border-white/20 bg-white/15 p-3 shadow-2xl shadow-blue-950/45 backdrop-blur-xl">
              <div className="rounded-xl bg-white p-5 text-gray-900 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-wider">{t.heroPreviewTitle}</p>
                    <p className="text-lg font-black mt-1 text-gray-900">SGRFS-2026-041</p>
                    <p className="text-xs text-gray-500 mt-1">{t.heroPreviewRequest}</p>
                  </div>
                  <span className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-700">
                    {t.heroPreviewStatus}
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 text-slate-900 mb-5 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{t.heroPreviewRequest}</p>
                      <p className="mt-1 text-xs text-slate-500">{t.heroPreviewStudent}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>67%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: t.heroPreviewStep1, role: "Service administratif", state: "done" },
                    { label: t.heroPreviewStep2, role: "Validation académique", state: "current" },
                    { label: t.heroPreviewStep3, role: "Finalisation du dossier", state: "pending" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="w-36 shrink-0">
                        <p className={`text-xs font-semibold truncate ${step.state === "current" ? "text-blue-600" : "text-gray-700"}`}>
                          {step.label}
                        </p>
                        <p className="text-[9px] text-gray-400 truncate">{step.role}</p>
                      </div>

                      <div className={`h-9 flex-1 rounded-lg overflow-hidden relative ${step.state === "pending" ? "bg-gray-50" : "bg-blue-50"}`}>
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                            step.state === "done"
                              ? "bg-green-500"
                              : step.state === "current"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                          style={{
                            width: step.state === "done" ? "100%" : step.state === "current" ? "55%" : "0%",
                          }}
                        />
                        {step.state === "current" && (
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                          </div>
                        )}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                          {step.state === "done" ? (
                            <CheckCircle size={14} className="text-white drop-shadow-sm" />
                          ) : step.state === "current" ? (
                            <Clock3 size={14} className="text-white" />
                          ) : (
                            <Clock3 size={13} className="text-gray-400" />
                          )}
                        </div>
                        {step.state === "current" && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                            <span className="text-[9px] text-blue-600 font-semibold bg-white/85 px-1.5 py-0.5 rounded-full">
                              En cours
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48L480 0L960 32L1440 8V48H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── WHY ──────────────────────────────────────────────────────────── */}
      <section id="about" className="relative bg-gray-50 px-4 py-16 sm:px-6 scroll-mt-24 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-8 items-stretch animate-fadeIn">
          <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-6 sm:p-8 text-white shadow-2xl shadow-blue-900/20">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200 mb-3">SGRFS</p>
              <h3 className="text-3xl sm:text-4xl font-black leading-tight mb-5 after:block after:mt-4 after:h-1 after:w-16 after:rounded-full after:bg-cyan-300">
                {t.whyTitle}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {t.whyText1}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[t.whyText2, t.whyText3, t.assistText].map((text, index) => (
              <div key={text} className="group relative overflow-hidden flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-200/60 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/10">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-700 to-cyan-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-black transition-colors duration-200 group-hover:bg-cyan-400 group-hover:text-blue-950">
                  0{index + 1}
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white px-4 py-16 sm:px-6 scroll-mt-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 mb-3">
              Services clés
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              {t.advantagesTitle}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
              {t.whyText1}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {features(t).map((f, i) => (
              <div
                key={i}
                className="
                  group relative overflow-hidden bg-gray-50 rounded-2xl p-5
                  border border-gray-100 min-h-[190px]
                  flex flex-col justify-between gap-5
                  hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-200
                  transition-all duration-200
                "
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-cyan-400 to-emerald-400 opacity-90" />
                <div
                  className={`${f.bg} ${f.color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-base leading-snug mb-2">
                    {f.title}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="process" className="bg-slate-100 px-4 py-16 sm:px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 mb-3">
              Parcours utilisateur
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              {t.howTitle}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {t.howSubtitle}
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent md:block" />
            {steps(t).map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-gray-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
                <div className="relative flex md:flex-col items-start gap-4 md:gap-5">
                  <div
                    className={`
                      ${s.color} text-white
                      w-12 h-12 rounded-xl
                      flex items-center justify-center
                      text-base font-black shrink-0
                      shadow-md ring-4 ring-white
                    `}
                  >
                    {s.n}
                  </div>
                  <div className="md:text-left">
                    <p className="font-black text-gray-900 text-sm mb-2">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {s.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS DETAIL ───────────────────────────────────────────────── */}
      <section className="bg-blue-900 text-white px-4 py-16 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12)_0_1px,transparent_1px_34px)]" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200 mb-3">
              Workflow administratif
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-center mb-3">
              {t.processTitle}
            </h3>
            <p className="text-blue-200 text-center text-sm sm:text-base max-w-xl mx-auto">
              {t.processSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "01", title: t.processStep1Title, text: t.processStep1Text },
              { n: "02", title: t.processStep2Title, text: t.processStep2Text },
              { n: "03", title: t.processStep3Title, text: t.processStep3Text },
            ].map((p, i) => (
              <div
                key={i}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 hover:-translate-y-1 transition-all duration-200"
              >
                <p className="text-3xl font-black text-cyan-200/35 mb-2 leading-none transition-colors group-hover:text-cyan-200/70">
                  {p.n}
                </p>
                <p className="font-black text-white text-base mb-2">
                  {p.title}
                </p>
                <p className="text-blue-200 text-sm leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION (with form) ──────────────────────────────────────── */}
      <section id="contact" className="relative bg-gray-100 px-4 py-16 sm:px-6 scroll-mt-24 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 mb-3">
              Besoin d’aide ?
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              {t.contactTitle}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {t.formSubtitle}
            </p>
          </div>

          {/* Two columns: contact info + form */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-8 items-start">
            {/* Left column - Contact info */}
            <div className="space-y-4">
              <div className="relative overflow-hidden bg-blue-900 rounded-2xl p-6 border border-blue-800 shadow-2xl shadow-blue-900/20">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
                <div className="relative">
                  <h4 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                    <Phone size={18} className="text-cyan-300" />
                    {t.contactTitle}
                  </h4>
                  <div className="space-y-3 text-blue-100">
                    <a href="tel:+237657713726" className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 transition-colors hover:bg-white/15">
                      <Phone size={16} className="text-cyan-300 shrink-0" />
                      <span className="text-sm font-semibold">{t.contactPhone}</span>
                    </a>
                    <a href="mailto:kevinbissouth237@gmail.com" className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 transition-colors hover:bg-white/15">
                      <Mail size={16} className="text-cyan-300 shrink-0" />
                      <span className="text-sm font-semibold break-all">{t.contactEmail}</span>
                    </a>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
                      <MapPin size={16} className="text-cyan-300 shrink-0" />
                      <span className="text-sm font-semibold">{t.contactAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-200/60">
                  <h4 className="text-base font-black text-gray-900 mb-3">
                    {t.hoursTitle}
                  </h4>
                  <p className="text-sm text-gray-600">{t.hoursDays}</p>
                  <p className="text-sm text-cyan-600 font-black mt-1">
                    {t.hoursTime}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shadow-gray-200/60">
                  <h4 className="text-base font-black text-gray-900 mb-3">
                    {t.assistTitle}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t.assistText}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Contact form */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-2xl shadow-gray-200/80">
              <div className="mb-6 border-b border-gray-100 pb-5">
                <h4 className="text-xl font-black text-gray-900 mb-2">
                  {t.formTitle}
                </h4>
                <p className="text-sm text-gray-500">
                  {t.formSubtitle}
                </p>
              </div>

              {submitStatus === "success" && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={16} />
                  {t.successMessage}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {submitError || t.errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.firstName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder={t.formPlaceholderFirstName}
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.lastName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder={t.formPlaceholderLastName}
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t.formPlaceholderEmail}
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t.formPlaceholderPhone}
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.message} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder={t.formPlaceholderMessage}
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-6 py-4 rounded-xl
                    bg-cyan-500 hover:bg-cyan-600
                    disabled:bg-cyan-300 disabled:cursor-not-allowed
                    text-white font-black text-sm
                    transition-all duration-200
                    shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5
                  "
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {t.send}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm text-gray-300 font-semibold">{t.footer}</p>
            <p className="text-xs text-gray-600 mt-1">{t.footerSub}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            SGRFS
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;
