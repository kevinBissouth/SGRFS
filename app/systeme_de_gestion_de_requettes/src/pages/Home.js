import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../components/LanguageContext";
import {
  FileText,
  Clock3,
  BookOpen,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronRight,
  Send,
  CheckCircle,
} from "lucide-react";

// ─── translations ─────────────────────────────────────────────────────────────
const translations = {
  fr: {
    heroTitle: "Gérez vos requêtes académiques en ligne",
    heroSubtitle:
      "Soumettez, suivez et gérez vos demandes universitaires depuis votre téléphone, rapidement et en toute sécurité.",
    accessSystem: "Accéder au tableau de bord",
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
    contactPhone: "+237 699 00 00 00",
    contactEmail: "devteam@univ-ebolo.cm",
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
    accessSystem: "Go to dashboard",
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
    contactPhone: "+237 699 00 00 00",
    contactEmail: "devteam@univ-ebolo.cm",
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

  const t = translations[lang];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simuler l'envoi (remplacer par votre appel API réel)
    try {
      // Exemple d'appel API:
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("Erreur réseau");
      
      // Simulation temporaire
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
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
        className="relative bg-cover bg-center flex items-center justify-center px-4 py-[152px] min-h-[92svh]"
        style={{ backgroundImage: "url('/universite.jpg')" }}
      >
        {/* gradient overlay — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/75 via-blue-900/65 to-blue-950/85" />

        <div className="relative z-10 text-center max-w-2xl mx-auto animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {t.heroTitle}
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-lg mx-auto mb-8 leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* CTA stack — single column on mobile */}
          <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
            <a
              href="/register"
              className="
                flex items-center justify-center gap-2
                px-6 py-4 rounded-2xl
                bg-cyan-400 hover:bg-cyan-300 active:scale-95
                text-blue-900 font-bold text-base
                shadow-lg shadow-cyan-500/30
                transition-all duration-200
              "
            >
              <ArrowRight size={20} />
              {t.getStarted}
            </a>

            <a
              href="/dashboard"
              className="
                flex items-center justify-center gap-1.5
                text-sm text-blue-200 hover:text-white
                transition-colors duration-150 pt-1
              "
            >
              {t.accessSystem}
              <ArrowRight size={15} />
            </a>
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
      <section id="about" className="bg-gray-50 px-4 py-14 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5">
            {t.whyTitle}
          </h3>
          <div className="space-y-4 text-gray-600 leading-relaxed text-base">
            <p>{t.whyText1}</p>
            <p>{t.whyText2}</p>
            <p>{t.whyText3}</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white px-4 py-14 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
            {t.advantagesTitle}
          </h3>
          <p className="text-gray-500 text-center mb-8 text-sm sm:text-base">
            {t.whyText1}
          </p>

          {/* 2-col grid on mobile, 4-col on xl */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {features(t).map((f, i) => (
              <div
                key={i}
                className="
                  bg-gray-50 rounded-2xl p-5
                  border border-gray-100
                  flex flex-col gap-3
                  hover:-translate-y-0.5 transition-transform duration-200
                "
              >
                <div
                  className={`${f.bg} ${f.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-snug mb-1">
                    {f.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="process" className="bg-gray-100 px-4 py-14 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-1">
            {t.howTitle}
          </h3>
          <p className="text-gray-500 text-center mb-8 text-sm sm:text-base">
            {t.howSubtitle}
          </p>

          {/* Vertical timeline on mobile, horizontal on md+ */}
          <div className="flex flex-col md:flex-row gap-0 md:gap-4">
            {steps(t).map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1">
                  {/* step circle */}
                  <div
                    className={`
                      ${s.color} text-white
                      w-11 h-11 rounded-full
                      flex items-center justify-center
                      text-base font-bold shrink-0
                      shadow-md
                    `}
                  >
                    {s.n}
                  </div>
                  <div className="md:text-center pb-6 md:pb-0">
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {s.text}
                    </p>
                  </div>
                </div>
                {/* connector */}
                {i < steps(t).length - 1 && (
                  <div className="
                    hidden md:flex items-center text-gray-300 self-start mt-3
                  ">
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS DETAIL ───────────────────────────────────────────────── */}
      <section className="bg-blue-900 text-white px-4 py-14 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            {t.processTitle}
          </h3>
          <p className="text-blue-200 text-center mb-8 text-sm sm:text-base max-w-xl mx-auto">
            {t.processSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: "01", title: t.processStep1Title, text: t.processStep1Text },
              { n: "02", title: t.processStep2Title, text: t.processStep2Text },
              { n: "03", title: t.processStep3Title, text: t.processStep3Text },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
              >
                <p className="text-3xl font-black text-white/20 mb-2 leading-none">
                  {p.n}
                </p>
                <p className="font-semibold text-white text-sm mb-1">
                  {p.title}
                </p>
                <p className="text-blue-200 text-xs leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION (with form) ──────────────────────────────────────── */}
      <section id="contact" className="bg-gray-100 text-white px-4 py-14 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {t.contactTitle}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {t.formSubtitle}
            </p>
          </div>

          {/* Two columns: contact info + form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Contact info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-cyan-500" />
                  {t.contactTitle}
                </h4>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-cyan-500 shrink-0" />
                    <span className="text-sm">{t.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-cyan-500 shrink-0" />
                    <span className="text-sm">{t.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-cyan-500 shrink-0" />
                    <span className="text-sm">{t.contactAddress}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  {t.hoursTitle}
                </h4>
                <p className="text-sm text-gray-600">{t.hoursDays}</p>
                <p className="text-sm text-cyan-600 font-semibold mt-1">
                  {t.hoursTime}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  {t.assistTitle}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t.assistText}
                </p>
              </div>
            </div>

            {/* Right column - Contact form */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                {t.formTitle}
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                {t.formSubtitle}
              </p>

              {submitStatus === "success" && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={16} />
                  {t.successMessage}
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {t.errorMessage}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-6 py-3 rounded-xl
                    bg-cyan-500 hover:bg-cyan-600
                    disabled:bg-cyan-300 disabled:cursor-not-allowed
                    text-white font-semibold text-sm
                    transition-all duration-200
                    shadow-md shadow-cyan-500/20
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
      <footer className="bg-gray-900 text-gray-400 text-center px-4 py-6">
        <p className="text-sm">{t.footer}</p>
        <p className="text-xs text-gray-600 mt-1">{t.footerSub}</p>
      </footer>

    </div>
  );
}

export default Home;