import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  MessageCircle,
  FileText,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  CheckCircle,
  BookOpen,
  Plus,
  Menu,
  X,
  Info,
  Globe,
  Eye,
  Send,
  ArrowLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Download,
  Trash2,
  Image as ImageIcon,
  File,
  Check,
  Calendar,
  Paperclip,
  Clock,
  Users,
  Building,
  GraduationCap,
  UserCheck,
  Filter,
  Search,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import API_BASE_URL from "../config";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes requêtes", href: "/request", icon: FileText },
  { label: "Documents", href: "/docs", icon: BookOpen },
  { label: "Profil", href: "/profile", icon: User },
  { label: "Paramètres", href: "/settings", icon: Settings },
  { label: "Infos", href: "/info", icon: Info },
];

const formatName = (prenom, nom) => {
  if (!prenom || !nom) return "Étudiant";
  return `${prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase()} ${nom}`;
};

const needsUE = (titre) => {
  return titre?.toLowerCase().includes("révision") || titre?.toLowerCase().includes("revision");
};

const normalizeRequete = (r, docsCount = 0) => {
  const statut = String(r.statut || "").toLowerCase();
  const isValidated = statut.includes("valid") || statut.includes("accept") || statut.includes("approv");
  const isRejected = statut.includes("rejet") || statut.includes("refus") || statut.includes("reject");
  return {
    id: r.id_requete, typeId: r.id_type_requete,
    title_fr: r.type_requete || "Requête académique",
    title_en: r.type_requete || "Academic request",
    date: r.date_requete ? new Date(r.date_requete).toISOString().split("T")[0] : "",
    status_fr: r.statut || "En attente", status_en: r.statut || "Pending",
    statusColor: isValidated ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-amber-500",
    statusText: isValidated ? "text-green-700" : isRejected ? "text-red-700" : "text-amber-700",
    bgLight: isValidated ? "bg-green-50" : isRejected ? "bg-red-50" : "bg-amber-50",
    documentsCount: docsCount,
    id_ues: r.id_ues,
  };
};

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
function NotificationPopup({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed z-50 top-4 right-4 animate-slide-in-right">
      <div className="bg-green-50 border-l-4 border-green-500 shadow-lg p-3 flex items-center gap-2 rounded-r-xl">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle size={14} className="text-green-600" /></div>
        <div><p className="text-xs font-semibold text-green-800">{message}</p><p className="text-[10px] text-green-600">Votre demande a été enregistrée</p></div>
      </div>
    </div>
  );
}

// ─── FILE UPLOADER ────────────────────────────────────────────────────────────
function FileUploader({ onFileUpload, onFileRemove, uploadedFiles, requiredDocs, lang }) {
  const fileInputRef = useRef(null);
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (["image/jpeg", "image/png", "application/pdf"].includes(file.type)) onFileUpload(file);
      else alert(lang === "fr" ? "Seuls JPG, PNG et PDF acceptés" : "Only JPG, PNG and PDF files are accepted");
    });
    e.target.value = "";
  };
  const getFileIcon = (type) => type?.startsWith("image/") ? <ImageIcon size={14} /> : <File size={14} />;
  const t = { fr: { requiredDocs: "Documents requis", uploadedDocs: "Documents téléchargés" }, en: { requiredDocs: "Required documents", uploadedDocs: "Uploaded documents" } }[lang];
  // 
  return (
    <div className="space-y-3">
      {requiredDocs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-600 mb-2">{t.requiredDocs} :</p>
          <div className="space-y-2">
            {requiredDocs.map((doc, idx) => {
              const isUploaded = uploadedFiles.some((f) => f.requiredDoc === doc);
              return (
                <div key={idx} className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
                  <div className="flex items-center gap-2">
                    {isUploaded ? <Check size={14} className="text-green-600" /> : <File size={14} className="text-amber-500" />}
                    <span className={`text-xs ${isUploaded ? "text-green-700" : "text-amber-700"}`}>{doc}</span>
                  </div>
                  {!isUploaded ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600"><Plus size={12} /></button>
                  ) : (
                    <button type="button" onClick={() => { const f = uploadedFiles.find((x) => x.requiredDoc === doc); if (f) onFileRemove(f); }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {uploadedFiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-600 mb-2">{t.uploadedDocs} :</p>
          <div className="space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">{getFileIcon(file.type)}<span className="text-xs text-gray-700 truncate max-w-[150px]">{file.name}</span><span className="text-[10px] text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span></div>
                <button type="button" onClick={() => onFileRemove(file)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,application/pdf" multiple onChange={handleFileSelect} className="hidden" />
    </div>
  );
}

// ─── ÉTAPE 1 ──────────────────────────────────────────────────────────────────
function RequestStep1({ formData, setFormData, selectedType, setSelectedType, lang, onNext, student, requestTypes, loadingTypes, allUes, loadingUes, exigencesCache, setExigencesCache, exigencesMap, setExigencesMap }) {
  const [exigencesForType, setExigencesForType] = useState([]);
  const [loadingExigences, setLoadingExigences] = useState(false);

  useEffect(() => {
    if (formData.requestTypeId && exigencesCache[formData.requestTypeId]) {
      setExigencesForType(exigencesCache[formData.requestTypeId]);
    }
  }, []);

  const handleTypeChange = async (e) => {
    const typeId = parseInt(e.target.value);
    const type = requestTypes.find((t) => t.id_type_requete === typeId);
    setSelectedType(type || null);
    setFormData({ ...formData, requestTypeId: typeId, ueId: "", uploadedDocuments: [], requiredDocuments: [] });

    if (typeId) {
      if (exigencesCache[typeId]) {
        setExigencesForType(exigencesCache[typeId]);
        setFormData((prev) => ({ ...prev, requiredDocuments: exigencesCache[typeId] }));
      } else {
        setLoadingExigences(true);
        try {
          const res = await fetch(`${API_BASE_URL}/type_requetes/get_all_exigence/${typeId}`);
          if (res.ok) {
            const data = await res.json();
            const titres = data.map((e) => e.titre);
            const map = {};
            data.forEach((e) => { map[e.titre] = e.id_exigence; });
            setExigencesForType(titres);
            setFormData((prev) => ({ ...prev, requiredDocuments: titres }));
            setExigencesCache((prev) => ({ ...prev, [typeId]: titres }));
            setExigencesMap((prev) => ({ ...prev, ...map }));
          }
        } catch { setExigencesForType([]); }
        finally { setLoadingExigences(false); }
      }
    } else {
      setExigencesForType([]);
    }
  };

  const handleUEChange = (e) => setFormData({ ...formData, ueId: parseInt(e.target.value) || "" });
  const handleFileUpload = (file) => {
    const current = [...(formData.uploadedDocuments || [])];
    const missingDoc = formData.requiredDocuments.find(
      (doc) => !current.some((f) => f.requiredDoc === doc)
    );
    if (missingDoc) {
      file.requiredDoc = missingDoc;
      setFormData({
        ...formData,
        uploadedDocuments: [...current, file]
      });
    }
  };
  const handleFileRemove = (fileToRemove) => {
    setFormData({
      ...formData,
      uploadedDocuments: formData.uploadedDocuments.filter((f) => f !== fileToRemove)
    });
  };
  const isStepValid = () => {
    if (!formData.requestTypeId) return false;
    if (selectedType && needsUE(selectedType.titre) && !formData.ueId) return false;
    return (formData.requiredDocuments?.length || 0) <= (formData.uploadedDocuments?.length || 0);
  };

  const t = {
    fr: { step1: "Étape 1/2", studentInfo: "Informations de l'étudiant", nom: "Nom", prenom: "Prénom", matricule: "Matricule", filiere: "Filière", niveau: "Niveau", requestType: "Type de requête", requestTypePlaceholder: "Sélectionnez le type de requête", ue: "Unité d'Enseignement", uePlaceholder: "Sélectionnez l'UE", next: "Suivant", loading: "Chargement...", loadingExigences: "Chargement des pièces..." },
    en: { step1: "Step 1/2", studentInfo: "Student Information", nom: "Last Name", prenom: "First Name", matricule: "Student ID", filiere: "Program", niveau: "Level", requestType: "Request Type", requestTypePlaceholder: "Select request type", ue: "Teaching Unit", uePlaceholder: "Select UE", next: "Next", loading: "Loading...", loadingExigences: "Loading documents..." },
  }[lang];

  const niveauLabel = student?.id_niveau?.niveau || student?.niveau || "—";
  const filiereLabel = student?.id_niveau?.filiere || student?.filiere || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div><span className="text-xs text-gray-500">{t.step1}</span></div>
        <div className="h-px flex-1 bg-gray-200 mx-2" /><div className="flex items-center gap-2 opacity-50"><div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">2</div><span className="text-xs text-gray-400">Confirmation</span></div>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2"><User size={14} /> {t.studentInfo}</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-[10px] text-blue-600">{t.nom}</p><p className="font-semibold text-gray-800">{student?.nom || "—"}</p></div>
          <div><p className="text-[10px] text-blue-600">{t.prenom}</p><p className="font-semibold text-gray-800">{student?.prenom || "—"}</p></div>
          <div><p className="text-[10px] text-blue-600">{t.matricule}</p><p className="font-semibold text-gray-800">{student?.matricule || "—"}</p></div>
          <div><p className="text-[10px] text-blue-600">{t.filiere}</p><p className="font-semibold text-gray-800">{filiereLabel}</p></div>
          <div className="col-span-2"><p className="text-[10px] text-blue-600">{t.niveau}</p><p className="font-semibold text-gray-800">{niveauLabel}</p></div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">{t.requestType} <span className="text-red-500">*</span></label>
        {loadingTypes ? <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> {t.loading}</div> : (
          <select value={formData.requestTypeId} onChange={handleTypeChange} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
            <option value="">{t.requestTypePlaceholder}</option>
            {requestTypes.map((rt) => <option key={rt.id_type_requete} value={rt.id_type_requete}>{rt.titre}</option>)}
          </select>
        )}
      </div>
      {selectedType && needsUE(selectedType.titre) && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.ue} <span className="text-red-500">*</span></label>
          {loadingUes ? <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> {t.loading}</div> : (
            <select value={formData.ueId} onChange={handleUEChange} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="">{t.uePlaceholder}</option>
              {allUes.map((ue) => <option key={ue.id_ue} value={ue.id_ue}>{ue.intitule} ({ue.code})</option>)}
            </select>
          )}
        </div>
      )}
      {selectedType && (loadingExigences ? <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> {t.loadingExigences}</div> : exigencesForType.length > 0 && <FileUploader onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} uploadedFiles={formData.uploadedDocuments || []} requiredDocs={exigencesForType} lang={lang} />)}
      <button onClick={onNext} disabled={!isStepValid()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 text-sm transition-all shadow-md">{t.next} <ChevronRightIcon size={14} /></button>
    </div>
  );
}

// ─── ÉTAPE 2 ──────────────────────────────────────────────────────────────────
function RequestStep2({ formData, selectedType, lang, onSubmit, onBack, student, allUes, submitting }) {
  const [letterData, setLetterData] = useState(null);
  const selectedUE = formData.ueId ? allUes.find((u) => u.id_ue === parseInt(formData.ueId)) : null;

  const generateLetterMessage = useCallback(() => {
    if (!selectedType || !student) return null;
    const today = new Date();
    const niveauLabel = student?.id_niveau?.niveau || student?.niveau || "";
    const filiereLabel = student?.id_niveau?.filiere || student?.filiere || "";
    const date = today.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" });

    if (lang === "fr") {
      const studentInfo = `${student.nom} ${student.prenom}\n${student.matricule}\n${filiereLabel}\n${niveauLabel}\n${student.email || ""}\n${student.telephone || ""}`;
      const dateLine = `Ebolowa, le ${date}`;
      let objet = `Objet : ${selectedType.titre.toLowerCase()}`;
      let corps = `Madame le Doyen,\n\n    Je suis étudiant en ${filiereLabel} ${niveauLabel} à la Faculté des Sciences de l'Université d'Ebolowa. Je me permets de vous écrire cette lettre pour solliciter votre bienveillance afin d'obtenir `;
      if (selectedType && needsUE(selectedType.titre) && selectedUE) corps += `une révision de mes notes pour l'Unité d'Enseignement "${selectedUE.intitule}".\n\n    Je pense qu'une erreur a pu se produire lors de l'évaluation de cette unité.\n\n    Je vous prie de bien vouloir procéder à une vérification approfondie de ma copie d'examen.\n\n`;
      else corps += `traiter ma demande concernant "${selectedType.titre}".\n\n    Cette démarche est d'une importance capitale pour la poursuite normale de mon parcours académique.\n\n`;
      corps += `    Dans l'attente d'une suite favorable, veuillez agréer, Madame le Doyen, l'expression de ma profonde gratitude.\n\n`;
      let piecesJointes = `Pièces jointes :\n`;
      if (formData.requiredDocuments?.length > 0) formData.requiredDocuments.forEach((doc) => { const u = formData.uploadedDocuments?.some((f) => f.requiredDoc === doc); piecesJointes += `  - ${doc}${u ? " (✓ déposé)" : ""}\n`; });
      else piecesJointes += `  - Aucune pièce jointe\n`;
      return { studentInfo, dateLine, destinataire: "A Madame le Doyen", objet, corps, piecesJointes, signature: `${student.nom} ${student.prenom}` };
    } else {
      const studentInfo = `${student.nom} ${student.prenom}\n${student.matricule}\n${filiereLabel}\n${niveauLabel}\n${student.email || ""}\n${student.telephone || ""}`;
      const dateLine = `Ebolowa, ${date}`;
      let corps = `Dear Dean,\n\n    I am a student in ${filiereLabel} ${niveauLabel} at the Faculty of Sciences of the University of Ebolowa. I am writing to respectfully request `;
      if (selectedType && needsUE(selectedType.titre) && selectedUE) corps += `a grade revision for "${selectedUE.intitule}".\n\n`;
      else corps += `to process my request regarding "${selectedType.titre}".\n\n`;
      corps += `    Thank you in advance for your favorable response.\n\n`;
      let piecesJointes = `Attached documents :\n`;
      if (formData.requiredDocuments?.length > 0) formData.requiredDocuments.forEach((doc) => { const u = formData.uploadedDocuments?.some((f) => f.requiredDoc === doc); piecesJointes += `  - ${doc}${u ? " (✓ uploaded)" : ""}\n`; });
      else piecesJointes += `  - No attached documents\n`;
      return { studentInfo, dateLine, destinataire: "To Madam the Dean", objet: `Subject: ${selectedType.titre.toLowerCase()}`, corps, piecesJointes, signature: `${student.nom} ${student.prenom}` };
    }
  }, [selectedType, student, selectedUE, formData.uploadedDocuments, formData.requiredDocuments, lang]);

  useEffect(() => { setLetterData(generateLetterMessage()); }, [generateLetterMessage]);

  const handleDownloadPDF = () => {
    if (!letterData) return;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = 30; const m = 20;
    pdf.setFontSize(14); pdf.setFont("helvetica", "bold"); pdf.text("UNIVERSITÉ D'EBOLOWA", m, y); y += 6;
    pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.text("Faculté des Sciences", m, y); y += 8;
    pdf.line(m, y, 190, y); y += 8;
    const sl = pdf.splitTextToSize(letterData.studentInfo, 80); pdf.text(sl, m, y);
    pdf.text(letterData.dateLine, 190 - pdf.getTextWidth(letterData.dateLine), y); y += sl.length * 5 + 5;
    pdf.text(letterData.destinataire, 190 - pdf.getTextWidth(letterData.destinataire), y); y += 10;
    pdf.setFont("helvetica", "bold");
    pdf.splitTextToSize(letterData.objet.toUpperCase(), 160).forEach((l) => { pdf.text(l, (210 - pdf.getTextWidth(l)) / 2, y); y += 6; });
    y += 5; pdf.setFont("helvetica", "normal");
    const cl = pdf.splitTextToSize(letterData.corps, 160); pdf.text(cl, m, y); y += cl.length * 5 + 5;
    const pl = pdf.splitTextToSize(letterData.piecesJointes, 160); pdf.text(pl, m, y); y += pl.length * 5 + 10;
    pdf.text(letterData.signature, 190 - pdf.getTextWidth(letterData.signature), y);
    pdf.save(`requete_${student.matricule}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const t = { fr: { step2: "Étape 2/2", confirm: "Envoyer", back: "Retour", download: "Télécharger", sending: "Envoi..." }, en: { step2: "Step 2/2", confirm: "Submit", back: "Back", download: "Download PDF", sending: "Sending..." } }[lang];
  if (!letterData) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 opacity-50"><div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">1</div><span className="text-xs text-gray-400">Informations</span></div>
        <div className="h-px flex-1 bg-gray-200 mx-2" /><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div><span className="text-xs text-gray-500">{t.step2}</span></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100"><div className="flex items-center gap-2"><img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-0.5 shadow-sm" /><div><p className="text-[10px] font-bold text-gray-800">UNIVERSITÉ D'EBOLOWA</p><p className="text-[8px] text-gray-500">Faculté des Sciences</p></div></div></div>
          <div className="flex justify-between items-start mb-4"><pre className="text-[10px] text-gray-800 font-sans whitespace-pre-wrap">{letterData.studentInfo}</pre><p className="text-[10px] text-gray-600">{letterData.dateLine}</p></div>
          <div className="text-right mb-4"><p className="text-[10px] text-gray-800 font-semibold">{letterData.destinataire}</p></div>
          <div className="text-center my-4"><p className="text-[11px] font-bold text-gray-800 uppercase">{letterData.objet}</p></div>
          <pre className="text-[10px] text-gray-700 font-sans whitespace-pre-wrap leading-relaxed my-4">{letterData.corps}</pre>
          <pre className="text-[10px] text-gray-700 font-sans whitespace-pre-wrap my-4">{letterData.piecesJointes}</pre>
          <div className="text-right mt-6 pt-3 border-t border-gray-100"><pre className="text-[10px] text-gray-800 font-sans">{letterData.signature}</pre></div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onBack} disabled={submitting} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 flex items-center justify-center gap-1 text-xs transition-all"><ChevronLeft size={12} /> {t.back}</button>
        <button onClick={handleDownloadPDF} disabled={submitting} className="flex-1 py-1 rounded-lg border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 flex items-center justify-center gap-1 text-xs transition-all"><Download size={12} /> {t.download}</button>
        <button onClick={() => onSubmit({ ...formData, date: new Date().toISOString().split("T")[0] })} disabled={submitting} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-1 text-xs transition-all shadow-md">{submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} {submitting ? t.sending : t.confirm}</button>
      </div>
    </div>
  );
}

// ─── FORMULAIRE ────────────────────────────────────────────────────────────────
function RequestFormWithPagination({ onClose, onSubmit, lang, student, requestTypes, loadingTypes, allUes, loadingUes, submitting, exigencesCache, setExigencesCache, exigencesMap, setExigencesMap }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ requestTypeId: "", ueId: "", uploadedDocuments: [], requiredDocuments: [] });
  const [selectedType, setSelectedType] = useState(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const content = step === 1 ? (
    <RequestStep1 formData={formData} setFormData={setFormData} selectedType={selectedType} setSelectedType={setSelectedType} lang={lang} onNext={() => setStep(2)} student={student} requestTypes={requestTypes} loadingTypes={loadingTypes} allUes={allUes} loadingUes={loadingUes} exigencesCache={exigencesCache} setExigencesCache={setExigencesCache} exigencesMap={exigencesMap} setExigencesMap={setExigencesMap} />
  ) : (
    <RequestStep2 formData={formData} selectedType={selectedType} lang={lang} onSubmit={(data) => onSubmit(data)} onBack={() => setStep(1)} student={student} allUes={allUes} submitting={submitting} />
  );

  if (isMobile) return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <button onClick={onClose} disabled={submitting} className="p-2 rounded-xl bg-gray-100 text-gray-700 disabled:opacity-50"><ArrowLeft size={20} /></button>
          <div className="flex-1"><h1 className="text-base font-bold text-gray-900">Nouvelle requête</h1></div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">{student?.prenom?.charAt(0) || "?"}</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">{content}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white"><h2 className="text-lg font-bold text-gray-800">Nouvelle requête</h2><button onClick={onClose} disabled={submitting} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"><X size={18} /></button></div>
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, light, text }) {
  return <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"><div className="flex items-center justify-between mb-3"><p className="text-3xl font-extrabold text-gray-900">{value}</p><div className={`${light} ${text} w-10 h-10 rounded-xl flex items-center justify-center`}><Icon size={20} /></div></div><p className="text-xs text-gray-500">{title}</p></div>;
}

function RequestCard({ request, lang, onClick }) {
  const statusConfig = {
    "en attente": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
    "validée": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle },
    "rejetée": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: X },
    "en cours": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Loader2 },
  };
  const sk = String(request.status_fr || "").toLowerCase().trim();
  const config = statusConfig[sk] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FileText };
  const StatusIcon = config.icon;

  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg cursor-pointer border border-gray-100 transition-all duration-300 hover:border-blue-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <FileText size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm truncate">{lang === "fr" ? request.title_fr : request.title_en}</h3>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1"><Calendar size={10} />{request.date}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shrink-0 ${config.bg} ${config.text} border ${config.border}`}>
          <StatusIcon size={10} className={request.status_fr === "en cours" ? "animate-spin" : ""} />
          <span>{request.status_fr}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Paperclip size={12} className="text-gray-500" />
          </div>
          <span className="font-medium">{request.documentsCount || 0} pièce(s)</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 group">
          <span className="font-semibold text-xs">Détails</span>
          <Eye size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST TRACKING ──────────────────────────────────────────────────────────
function RequestTracking({ request, lang, onClose }) {
  const [details, setDetails] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/requete/${request.id}/details`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDetails(data);
      } catch { setDetails(null); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [request.id]);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoadingDocs(true);
      setDocuments([]);
      try {
        const res = await fetch(`${API_BASE_URL}/documents/by_requete/${request.id}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(Array.isArray(data) ? data : []);
        }
      } catch { setDocuments([]); }
      finally { setLoadingDocs(false); }
    };
    fetchDocs();
  }, [request.id]);

  const handleOpenDocument = (doc) => {
    window.open(`${API_BASE_URL}/${doc.chemin}`, "_blank");
  };

  const t = {
    fr: {
      title: "Suivi de la requête", type: "Type", date: "Date", status: "Statut",
      ue: "Unité d'Enseignement", steps: "Workflow de validation",
      documents: "Pièces jointes", noDocs: "Aucune pièce jointe",
      openDoc: "Ouvrir", loading: "Chargement...", error: "Impossible de charger",
      timeline: "Chronologie", completed: "Terminé", pending: "En attente",
      rejected: "Rejeté", current: "En cours", days: "jours", reason: "Motif du rejet",
    },
    en: {
      title: "Request Tracking", type: "Type", date: "Date", status: "Status",
      ue: "Teaching Unit", steps: "Validation Workflow",
      documents: "Attachments", noDocs: "No attachments",
      openDoc: "Open", loading: "Loading...", error: "Unable to load",
      timeline: "Timeline", completed: "Completed", pending: "Pending",
      rejected: "Rejected", current: "In progress", days: "days", reason: "Rejection reason",
    },
  }[lang];

  const getStatusBadge = (statut) => {
    const s = String(statut || "").toLowerCase();
    if (s.includes("rejet") || s.includes("refus")) return "bg-red-100 text-red-700";
    if (s.includes("valid") || s.includes("accept")) return "bg-green-100 text-green-700";
    if (s.includes("cours")) return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) return <ImageIcon size={isMobile ? 14 : 16} />;
    return <File size={isMobile ? 14 : 16} />;
  };

  const isRejected = details?.statut_requete &&
    String(details.statut_requete).toLowerCase().includes("rejet");

  const getRejectedStep = () => {
    if (!details?.parcours) return null;
    return details.parcours.find(step => {
      const e = String(step.etat || "").toLowerCase();
      return e.includes("rejet") || e.includes("refus");
    });
  };

  const rejectedStep = getRejectedStep();

  const getWorkflowStats = () => {
    if (!details?.parcours) return { total: 0, completed: 0, current: 0, rejected: false, percentage: 0 };
    const total = details.parcours.length;
    const completed = details.parcours.filter(s => {
      const e = String(s.etat || "").toLowerCase();
      return e.includes("valid") || e.includes("accept") || e.includes("approuv");
    }).length;
    const rejected = details.parcours.some(s => {
      const e = String(s.etat || "").toLowerCase();
      return e.includes("rejet") || e.includes("refus");
    });
    const current = rejected ? -1 : details.parcours.findIndex(s => {
      const e = String(s.etat || "").toLowerCase();
      return e.includes("cours");
    });
    return { total, completed, current, rejected, percentage: (completed / total) * 100 };
  };

  const stats = getWorkflowStats();

  const WorkflowGraph = () => {
    if (!details?.parcours) return null;

    const steps = details.parcours;

    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-green-700">{t.completed}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] text-blue-700">{t.current}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-[10px] text-gray-600">{t.pending}</span>
            </div>
            {stats.rejected && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] text-red-700">{t.rejected}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-blue-600">{stats.completed}/{stats.total}</span>
            <span className="text-[10px] text-gray-500 ml-1">étapes</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Progression</span>
            <span>{Math.round(stats.percentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${stats.rejected ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-green-500'}`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        <div className={`${isMobile ? 'space-y-4' : 'space-y-3'}`}>
          {steps.map((step, idx) => {
            const etat = String(step.etat || "").toLowerCase();
            const isCompleted = etat.includes("valid") || etat.includes("accept") || etat.includes("approuv");
            const isCurrent = etat.includes("cours") && !stats.rejected;
            const isRejectedStep = etat.includes("rejet") || etat.includes("refus");
            const statusColor = isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : isRejectedStep ? "bg-red-500" : "bg-gray-300";

            let progressWidth = "0%";
            if (isCompleted) progressWidth = "100%";
            else if (isCurrent) progressWidth = "50%";
            else if (isRejectedStep) progressWidth = "100%";

            return (
              <div
                key={idx}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className={`flex items-center gap-3 ${isMobile ? 'flex-col items-start' : ''}`}>
                  <div className={`${isMobile ? 'w-full' : 'w-44'} flex-shrink-0`}>
                    <p className={`text-xs md:text-sm font-semibold truncate ${isCurrent ? 'text-blue-600' : isRejectedStep ? 'text-red-600' : 'text-gray-700'}`}>
                      {step.nom} {step.prenom?.charAt(0)}.
                    </p>
                    <p className="text-[9px] text-gray-400 truncate">{step.role}</p>
                  </div>

                  <div className={`flex-1 relative ${isMobile ? 'w-full' : ''}`}>
                    <div className={`h-9 rounded-lg overflow-hidden relative transition-all duration-300 ${isRejectedStep ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${statusColor} ${isCurrent ? 'opacity-80' : 'opacity-90'}`}
                        style={{
                          width: progressWidth,
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />

                      {isCurrent && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>
                      )}

                      {isRejectedStep && (
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg, rgba(255,255,255,0.3)_0px, rgba(255,255,255,0.3)_10px, transparent_10px, transparent_20px)]" />
                      )}

                      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-white drop-shadow-sm" />
                        ) : isCurrent ? (
                          <Loader2 size={14} className="text-white animate-spin" />
                        ) : isRejectedStep ? (
                          <X size={14} className="text-white drop-shadow-sm" />
                        ) : (
                          <Clock size={12} className="text-gray-400" />
                        )}
                      </div>

                      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        {isCompleted && step.date_traitement ? (
                          <span className="text-[8px] md:text-[9px] text-white font-medium whitespace-nowrap drop-shadow-sm">
                            {new Date(step.date_traitement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[8px] md:text-[9px] text-blue-600 font-semibold whitespace-nowrap bg-white/80 px-1.5 py-0.5 rounded-full">
                            {t.current}
                          </span>
                        ) : isRejectedStep ? (
                          <span className="text-[8px] md:text-[9px] text-red-600 font-semibold whitespace-nowrap bg-white/80 px-1.5 py-0.5 rounded-full">
                            {t.rejected}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {hoveredStep === idx && !isMobile && (
                  <div className="absolute left-48 top-10 z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <p className="font-semibold">{step.nom} {step.prenom}</p>
                    <p className="text-gray-300 text-[10px]">{step.role}</p>
                    {step.date_traitement && (
                      <p className="text-gray-400 text-[9px] mt-1">
                        {new Date(step.date_traitement).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-[8px] text-gray-400 px-2">
            <span>Début</span>
            <span>→</span>
            <span>En cours</span>
            <span>→</span>
            <span>Terminé</span>
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <div className="space-y-5">
      <div className="sticky top-0 bg-gray-50 -mx-5 -mt-5 px-5 pt-5 pb-3 border-b border-gray-200 z-20 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Eye size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {t.title}
              </h2>
              <p className="text-xs text-gray-400">#{request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={20} className="text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-gray-500">{t.loading}</p>
        </div>
      ) : !details ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
            <X size={32} className="text-red-500" />
          </div>
          <p className="text-base font-semibold text-red-500">{t.error}</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                  <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">{t.type}</p>
                  <p className="text-xs font-bold text-gray-800 mt-1 line-clamp-2">{details.type_requete}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200">
                  <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">{t.date}</p>
                  <p className="text-xs font-bold text-gray-800 mt-1">
                    {details.date_requete ? new Date(details.date_requete).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }) : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">{t.status}</p>
                <span className={`inline-flex mt-1 px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusBadge(details.statut_requete)}`}>
                  {details.statut_requete}
                </span>
              </div>
              {details.ue && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                  <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">{t.ue}</p>
                  <p className="text-xs font-bold text-gray-800 mt-1">{details.ue.intitule}</p>
                  <p className="text-[10px] text-gray-500">{details.ue.code}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                  <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">{t.type}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1 line-clamp-2">{details.type_requete}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200">
                  <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">{t.date}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {details.date_requete ? new Date(details.date_requete).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">{t.status}</p>
                <span className={`inline-flex mt-1 px-3 py-1.5 text-xs font-bold rounded-lg ${getStatusBadge(details.statut_requete)}`}>
                  {details.statut_requete}
                </span>
              </div>
              {details.ue && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                  <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">{t.ue}</p>
                  <p className="text-xs font-bold text-gray-800 mt-1 truncate">{details.ue.intitule}</p>
                  <p className="text-[10px] text-gray-500">{details.ue.code}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <h3 className="font-bold text-gray-800">{t.steps}</h3>
              {!stats.rejected && stats.current >= 0 && (
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Étape {stats.current + 1}/{stats.total}
                  </span>
                </div>
              )}
            </div>

            <WorkflowGraph />
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <Paperclip size={14} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t.documents}</h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{documents.length} fichier(s)</span>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 size={20} className="animate-spin text-blue-500" />
                <span className="text-sm text-gray-400">{t.loading}</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <File size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">{t.noDocs}</p>
              </div>
            ) : (
              <div className={`space-y-2 ${isMobile ? 'max-h-52 overflow-y-auto' : ''}`}>
                {documents.map((doc) => (
                  <div
                    key={doc.id_document}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-3 md:px-4 py-2.5 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer"
                    onClick={() => handleOpenDocument(doc)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                        {getFileIcon(doc.type_fichier)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-gray-800 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {doc.nom_original}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-gray-400">{doc.type_fichier}</p>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <p className="text-[10px] text-gray-400">
                            {(doc.taille || (doc.chemin?.length % 1000000)).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg bg-white text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-500 hover:text-white shadow-sm"
                      title={t.openDoc}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isRejected && rejectedStep && rejectedStep.commentaire && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                  <X size={16} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-700">{t.reason}</p>
                  <p className="text-sm text-red-600 mt-1">{rejectedStep.commentaire}</p>
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <User size={10} />
                    Par {rejectedStep.nom} {rejectedStep.prenom} • {rejectedStep.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );

  if (isMobile) return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">{content}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{content}</div>
        </div>
      </div>
    </div>
  );
}

function RequestsTable({ lang, requests, loading, onViewRequest }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fr = requests.filter((r) => { const m = r.title_fr.toLowerCase().includes(searchTerm.toLowerCase()); const s = String(r.status_fr || "").toLowerCase(); const ms = filterStatus === "all" || (filterStatus === "pending" && (s.includes("attente") || s.includes("cours"))) || (filterStatus === "approved" && (s.includes("valid") || s.includes("accept"))) || (filterStatus === "rejected" && (s.includes("rejet") || s.includes("refus"))); return m && ms; });
  const stats = { total: requests.length, pending: requests.filter((r) => { const s = String(r.status_fr || "").toLowerCase(); return s.includes("attente") || s.includes("cours"); }).length, approved: requests.filter((r) => { const s = String(r.status_fr || "").toLowerCase(); return s.includes("valid") || s.includes("accept"); }).length, rejected: requests.filter((r) => { const s = String(r.status_fr || "").toLowerCase(); return s.includes("rejet") || s.includes("refus"); }).length };
  const st = { fr: { total: "Total requêtes", pending: "En attente", approved: "Validées", rejected: "Rejetées" }, en: { total: "Total requests", pending: "Pending", approved: "Approved", rejected: "Rejected" } }[lang];
  const sc = { total: { light: "bg-blue-50", text: "text-blue-600" }, pending: { light: "bg-amber-50", text: "text-amber-600" }, approved: { light: "bg-green-50", text: "text-green-600" }, rejected: { light: "bg-red-50", text: "text-red-600" } };
  if (loading) return <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 size={32} className="animate-spin text-blue-500" /><p className="text-sm text-gray-500">{lang === "fr" ? "Chargement..." : "Loading..."}</p></div>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title={st.total} value={stats.total} icon={FileText} light={sc.total.light} text={sc.total.text} />
        <StatCard title={st.pending} value={stats.pending} icon={Clock} light={sc.pending.light} text={sc.pending.text} />
        <StatCard title={st.approved} value={stats.approved} icon={CheckCircle} light={sc.approved.light} text={sc.approved.text} />
        <StatCard title={st.rejected} value={stats.rejected} icon={X} light={sc.rejected.light} text={sc.rejected.text} />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={lang === "fr" ? "Rechercher..." : "Search..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        </div>
        <div className="relative">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"><Filter size={14} className="text-gray-500" /></button>
          {isFilterOpen && <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border z-10 overflow-hidden">{[{ value: "all", label: lang === "fr" ? "Tous" : "All" }, { value: "pending", label: lang === "fr" ? "En attente" : "Pending" }, { value: "approved", label: lang === "fr" ? "Validées" : "Approved" }, { value: "rejected", label: lang === "fr" ? "Rejetées" : "Rejected" }].map((o) => <button key={o.value} onClick={() => { setFilterStatus(o.value); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-all ${filterStatus === o.value ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}>{o.label}</button>)}</div>}
        </div>
      </div>
      {fr.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700">{lang === "fr" ? "Aucune requête trouvée" : "No requests found"}</p>
          <p className="text-xs text-gray-400 mt-1">{lang === "fr" ? "Essayez de modifier vos critères de recherche" : "Try changing your search criteria"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{fr.map((r) => <RequestCard key={r.id} request={r} lang={lang} onClick={() => onViewRequest(r)} />)}</div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
function RequestDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lang, setLang] = useState("fr");
  const [showForm, setShowForm] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [student, setStudent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [allUes, setAllUes] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingUes, setLoadingUes] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [exigencesCache, setExigencesCache] = useState({});
  const [exigencesMap, setExigencesMap] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { window.location.href = "/login"; return; }
    try { setStudent(JSON.parse(raw)); } catch { window.location.href = "/login"; }
  }, []);

  useEffect(() => {
    if (!student?.id_etudiant) return;
    (async () => {
      setLoadingRequests(true); setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE_URL}/requete/by_etudiant/${student.id_etudiant}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const requestsWithDocs = await Promise.all(data.map(async (req) => {
          let docsCount = 0;
          try {
            const docsRes = await fetch(`${API_BASE_URL}/documents/by_requete/${req.id_requete}`);
            if (docsRes.ok) {
              const docs = await docsRes.json();
              docsCount = Array.isArray(docs) ? docs.length : 0;
            }
          } catch (e) {
            console.error("Erreur chargement docs:", e);
          }
          return normalizeRequete(req, docsCount);
        }));

        setRequests(requestsWithDocs);
      } catch { setErrorMsg(lang === "fr" ? "Impossible de charger vos requêtes." : "Unable to load your requests."); }
      finally { setLoadingRequests(false); }
    })();
  }, [student?.id_etudiant]);

  useEffect(() => {
    (async () => {
      setLoadingTypes(true);
      try { const res = await fetch(`${API_BASE_URL}/type_requetes/get_all_type_requetes/`); setRequestTypes(res.ok ? await res.json() : []); } catch { setRequestTypes([]); }
      finally { setLoadingTypes(false); }
    })();
  }, []);

  useEffect(() => {
    if (!student?.id_etudiant) return;
    (async () => {
      setLoadingUes(true);
      try {
        const res = await fetch(`${API_BASE_URL}/etudiant/etudiant/${student.id_etudiant}/ues`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAllUes(data.ues || []);
      } catch { setAllUes([]); }
      finally { setLoadingUes(false); }
    })();
  }, [student?.id_etudiant]);

  const studentName = student ? formatName(student.prenom, student.nom) : "Étudiant";
  const firstLetter = student?.prenom?.charAt(0).toUpperCase() || "?";

  const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/"; };
  const toggleLang = () => setLang((p) => (p === "fr" ? "en" : "fr"));
  const handleViewRequest = (req) => { setSelectedRequest(req); setShowTracking(true); };

  const uploadDocument = async (file, idExigence, idRequete) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file, file.name);
    formDataUpload.append("id_exigence", parseInt(idExigence));
    formDataUpload.append("id_requete", parseInt(idRequete));

    console.log("📦 Upload:", file.name, file.type, file.size);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formDataUpload,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("❌ Erreur upload:", err);
    }

    return res.ok;
  };

  const handleSubmitRequest = async (formData) => {
    if (!student?.id_etudiant) return;
    setSubmitting(true);
    try {
      const payload = {
        id_etudiant: student.id_etudiant,
        date_requete: formData.date || new Date().toISOString().split("T")[0],
        id_type_requete: formData.requestTypeId,
        id_ues: formData.ueId ? parseInt(formData.ueId) : null,
        statut: "En attente",
      };
      const res = await fetch(`${API_BASE_URL}/requete/add_requete/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || "Erreur"); }

      const created = await res.json();
      const idRequete = created.id_requete;

      if (formData.uploadedDocuments?.length > 0 && idRequete) {
        for (const fileData of formData.uploadedDocuments) {
          console.log("📎 Fichier:", fileData.name, fileData.type, fileData.size, fileData.requiredDoc);
          const idExigence = exigencesMap[fileData.requiredDoc];
          if (idExigence && fileData.name && fileData.size) {
            await uploadDocument(fileData, idExigence, idRequete);
          } else {
            console.error("❌ Fichier invalide ou exigence inconnue:", fileData);
          }
        }
      }

      const updatedRes = await fetch(`${API_BASE_URL}/requete/by_etudiant/${student.id_etudiant}`);
      if (updatedRes.ok) {
        const data = await updatedRes.json();
        const requestsWithDocs = await Promise.all(data.map(async (req) => {
          let docsCount = 0;
          try {
            const docsRes = await fetch(`${API_BASE_URL}/documents/by_requete/${req.id_requete}`);
            if (docsRes.ok) {
              const docs = await docsRes.json();
              docsCount = Array.isArray(docs) ? docs.length : 0;
            }
          } catch (e) { }
          return normalizeRequete(req, docsCount);
        }));
        setRequests(requestsWithDocs);
      }
      setShowForm(false); setShowNotification(true); setTimeout(() => setShowNotification(false), 3000);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const currentT = { fr: { myRequests: "Mes requêtes", manageRequests: "Gérez vos requêtes académiques", logout: "Déconnexion", student: "Étudiant", requestSent: "Requête envoyée" }, en: { myRequests: "My requests", manageRequests: "Manage your academic requests", logout: "Logout", student: "Student", requestSent: "Request sent" } }[lang];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white fixed h-screen">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10"><img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 shadow-lg" /><div><p className="text-sm font-bold">Université d'Ebolowa</p><p className="text-[10px] text-blue-300">Faculté des Sciences</p></div></div>
          <nav className="flex-1 px-3 py-4 space-y-1">{navItems.map(({ label, href, icon: Icon }) => <a key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${href === "/request" ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"}`}><Icon size={18} />{label}</a>)}</nav>
          <div className="px-3 py-4 border-t border-white/10"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"><LogOut size={16} /> {currentT.logout}</button></div>
        </aside>

        {drawerOpen && <div className="md:hidden fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} /><aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl"><div className="flex items-center justify-between px-5 py-4 border-b border-white/10"><div className="flex items-center gap-2.5"><img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5" /><p className="text-sm font-bold">Université d'Ebolowa</p></div><button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={20} /></button></div><nav className="flex-1 px-3 py-4 space-y-1">{navItems.map(({ label, href, icon: Icon }) => <a key={href} href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium ${href === "/request" ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"}`} onClick={() => setDrawerOpen(false)}><Icon size={18} />{label}</a>)}</nav><div className="px-3 py-4 border-t border-white/10"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold"><LogOut size={16} /> {currentT.logout}</button></div></aside></div>}

        <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <button className="md:hidden p-2 rounded-xl bg-gray-100 shrink-0" onClick={() => setDrawerOpen(true)}><Menu size={20} /></button>
              <div className="flex-1">
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">{currentT.myRequests}</h1>
                <p className="text-[10px] text-gray-500 hidden sm:block">{currentT.manageRequests}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.location.href = "/minette"} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"><MessageCircle size={16} /><span className="text-xs font-semibold">Minette IA</span></button>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"><Bell size={18} className="text-gray-500" /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" /></button>
                <button onClick={toggleLang} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-xs"><Globe size={14} /><span className="font-medium">{lang === "fr" ? "FR" : "EN"}</span></button>
                <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">{firstLetter}</div>
                  <div className="hidden sm:block"><p className="text-xs font-semibold text-gray-800 truncate">{studentName}</p><p className="text-[10px] text-gray-500">{currentT.student}</p></div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 w-full max-w-7xl mx-auto pb-28 md:pb-6">
            {/* Hero Section - Grand cadre de présentation (sans bouton Nouvelle requête) */}
            <div className="mb-8">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={20} className="text-yellow-400 shrink-0" />
                    <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">Gestion des requêtes</span>
                  </div>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {lang === "fr"
                      ? "Consultez l'historique de toutes vos requêtes académiques. Suivez leur état d'avancement et accédez aux documents associés."
                      : "View the history of all your academic requests. Track their progress and access associated documents."}
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{errorMsg}</div>}
            <RequestsTable lang={lang} requests={requests} loading={loadingRequests} onViewRequest={handleViewRequest} />
          </div>
        </main>

        {/* MOBILE BOTTOM NAV - Labels corrigés */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
          {[
            { href: "/dashboard", icon: LayoutDashboard, label: lang === "fr" ? "Tableau de bord" : "Dashboard" },
            { href: "/request", icon: FileText, label: lang === "fr" ? "Mes requêtes" : "Requests" },
            { href: "/minette", icon: MessageCircle, label: "Minette IA" },
            { href: "/docs", icon: BookOpen, label: lang === "fr" ? "Documents" : "Docs" },
            { href: "/info", icon: Info, label: lang === "fr" ? "Infos" : "Info" },
          ].map(({ href, icon: Icon, label }) => {
            if (href === "/minette") return <a key={href} href={href} className="relative flex flex-col items-center justify-start"><div className="-mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-transform hover:scale-110 active:scale-95"><Icon size={24} /></div><span className="text-[9px] mt-1 font-semibold text-gray-700">Minette IA</span></a>;
            return <a key={href} href={href} className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium transition-all ${href === "/request" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}><Icon size={18} /><span>{label}</span></a>;
          })}
        </nav>

        {!showForm && <button onClick={() => setShowForm(true)} className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Plus size={22} /></button>}
      </div>

      {showNotification && <NotificationPopup message={currentT.requestSent} onClose={() => setShowNotification(false)} />}
      {showForm && student && <RequestFormWithPagination onClose={() => setShowForm(false)} onSubmit={handleSubmitRequest} lang={lang} student={student} requestTypes={requestTypes} loadingTypes={loadingTypes} allUes={allUes} loadingUes={loadingUes} submitting={submitting} exigencesCache={exigencesCache} setExigencesCache={setExigencesCache} exigencesMap={exigencesMap} setExigencesMap={setExigencesMap} />}
      {showTracking && selectedRequest && <RequestTracking request={selectedRequest} lang={lang} onClose={() => { setShowTracking(false); setSelectedRequest(null); }} />}

      <style>{`@keyframes slide-in-right{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.animate-slide-in-right{animation:slide-in-right .3s ease-out}`}</style>
    </div>
  );
}

export default RequestDashboard;