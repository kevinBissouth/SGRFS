import React, { useState, useEffect, useRef } from "react";
import {
    Bell, FileText, LayoutDashboard, User, Settings, LogOut,
    BookOpen, Menu, X, Info, Send, Trash2, MessageCircle,
    Loader2, ExternalLink, Image as ImageIcon,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";
import { useLanguage } from "../components/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

// ============================================================
//  NAVIGATION
// ============================================================
const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mes requêtes", href: "/request", icon: FileText },
    { label: "Documents", href: "/docs", icon: BookOpen },
    { label: "Profil", href: "/profile", icon: User },
    { label: "Paramètres", href: "/settings", icon: Settings },
    { label: "Infos", href: "/info", icon: Info },
];

// ============================================================
//  FONCTIONS API BACKEND
// ============================================================
const getStudentId = () => {
    try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.id_etudiant || u.id || u.user_id || null;
    } catch { return null; }
};

const safeFetch = async (url, fallback = null) => {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch { }
    return fallback;
};

const getStudentData = () => {
    try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u && typeof u === "object" ? u : {};
    } catch { return {}; }
};

const fetchRequestDetails = async (id_requete) => {
    if (!id_requete) return null;
    return await safeFetch(`${API_BASE_URL}/requete/${id_requete}/details`, null);
};

const fetchStudentRequests = async () => {
    const id = getStudentId();
    const basic = id ? await safeFetch(`${API_BASE_URL}/requete/by_etudiant/${id}`, []) : [];
    if (!basic || !basic.length) return [];

    const detailsList = await Promise.all(basic.map((req) => fetchRequestDetails(req.id_requete)));
    return basic.map((req) => {
        const details = detailsList.find((d) => d && d.id_requete === req.id_requete) || null;
        const parcours = details?.parcours || [];
        const currentIndex = parcours.findIndex((p) => /en cours|en traitement/i.test(String(p.etat || "").toLowerCase()));
        const currentStep = currentIndex !== -1
            ? parcours[currentIndex]
            : parcours.find((p) => /en attente|en traitement|en cours/i.test(String(p.etat || "").toLowerCase())) || parcours[0] || null;
        const remainingParcours = currentIndex !== -1
            ? parcours.slice(currentIndex + 1)
            : parcours.filter((p) => !/valid|termin|trait[ée]|fait/i.test(String(p.etat || "").toLowerCase()));
        const rejectedStep = parcours.find((p) => /rejet|refus/i.test(String(p.etat || "").toLowerCase()));

        return {
            ...req,
            details,
            circuit: parcours.map((p) => ({
                ordre: p.ordre,
                acteur: [`${p.nom || ""}`.trim(), `${p.prenom || ""}`.trim()].filter(Boolean).join(" "),
                role: p.role,
                etat: p.etat,
                commentaire: p.commentaire,
                date_traitement: p.date_traitement,
            })),
            current_actor: currentStep && {
                acteur: [`${currentStep.nom || ""}`.trim(), `${currentStep.prenom || ""}`.trim()].filter(Boolean).join(" "),
                role: currentStep.role,
                etat: currentStep.etat,
                commentaire: currentStep.commentaire,
                date_traitement: currentStep.date_traitement,
            },
            remaining_parcours: remainingParcours.map((p) => ({
                ordre: p.ordre,
                acteur: [`${p.nom || ""}`.trim(), `${p.prenom || ""}`.trim()].filter(Boolean).join(" "),
                role: p.role,
                etat: p.etat,
            })),
            rejection_reason: rejectedStep?.commentaire || null,
            rejected_by: rejectedStep
                ? [`${rejectedStep.role || ""}`.trim(), `${rejectedStep.nom || ""}`.trim(), `${rejectedStep.prenom || ""}`.trim()].filter(Boolean).join(" ")
                : null,
        };
    });
};

const fetchStudentDocuments = () => {
    const id = getStudentId();
    return id ? safeFetch(`${API_BASE_URL}/documents_reponse_requete/etudiant/${id}`, []) : [];
};

const fetchRequestTypes = () => safeFetch(`${API_BASE_URL}/type_requetes/get_all_type_requetes/`, []);

// ============================================================
//  APPEL MINETTE API
// ============================================================
const callMinetteAPI = async (message, lang, studentContext, conversationHistory = null, imageBase64 = null) => {
    try {
        const payload = {
            message,
            langue: lang,
            student_context: studentContext,
            conversation_history: conversationHistory,
        };
        if (imageBase64) payload.image_base64 = imageBase64;

        const response = await axios.post(`${API_BASE_URL}/ai/chat`, payload, { timeout: 30000 });
        return response.data.response;
    } catch (error) {
        console.error("Minette API error:", error.response?.status, error.message);
        return null;
    }
};

// ============================================================
//  FORMATAGE MESSAGES
// ============================================================
const formatMessageWithLinks = (text, isUser = false) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
        if (part?.match(urlRegex))
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                    className={`${isUser ? "text-white/90 hover:text-white" : "text-blue-500 hover:text-blue-700"} underline inline-flex items-center gap-0.5 break-all`}>
                    {part.length > 30 ? part.slice(0, 30) + "…" : part}
                    <ExternalLink size={9} className="inline shrink-0" />
                </a>
            );
        return formatTextWithBold(part, i, isUser);
    });
};

const formatTextWithBold = (text, prefix, isUser = false) => {
    if (!text) return null;
    return text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
            ? <strong key={`${prefix}-${i}`} className={`font-semibold ${isUser ? "text-white" : "text-slate-900"}`}>{p.slice(2, -2)}</strong>
            : p
    );
};

const formatMessage = (text, isUser = false) =>
    text.split("\n").map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-0.5" />;

        const textColor = isUser ? "text-white" : "text-slate-800";
        const titleColor = isUser ? "text-white" : "text-slate-900";
        const emojiHighlight = line.match(/^(✅|⚠️|🚫|✨|🔷|🔸|🤖|👉|📌|🔹)\s*/);
        if (emojiHighlight)
            return (
                <div key={i} className="flex items-start gap-2 my-1">
                    <span className="text-base">{emojiHighlight[1]}</span>
                    <span className={`flex-1 break-words text-xs ${textColor}`}>{formatMessageWithLinks(line.slice(emojiHighlight[0].length).trim(), isUser)}</span>
                </div>
            );

        if (/^#+\s/.test(line)) {
            const title = line.replace(/^#+\s+/, "");
            return <div key={i} className={`text-sm font-semibold ${titleColor} mt-2 mb-1`}>{formatTextWithBold(title, i, isUser)}</div>;
        }
        if (/^\*\*.+\*\*$/.test(line))
            return <div key={i} className={`text-sm font-semibold ${titleColor} mt-2 mb-1`}>{formatTextWithBold(line, i, isUser)}</div>;

        const indentMatch = line.match(/^(\s*)([-•*])\s+/);
        if (indentMatch) {
            const indentSize = Math.min(indentMatch[1].length, 4) * 4;
            return (
                <div key={i} className="flex items-start gap-2 my-0.5" style={{ paddingLeft: `${indentSize}px` }}>
                    <span className="mt-0.5 text-blue-300 shrink-0 text-xs">•</span>
                    <span className={`flex-1 break-words text-xs ${textColor}`}>{formatMessageWithLinks(line.replace(/^(\s*[-•*]\s+)/, ""), isUser)}</span>
                </div>
            );
        }
        if (/^\d+\.\s/.test(line))
            return (
                <div key={i} className="flex items-start gap-2 my-0.5">
                    <span className="text-blue-300 font-semibold min-w-[18px] shrink-0 text-xs">{line.match(/^\d+/)[0]}.</span>
                    <span className={`flex-1 break-words text-xs ${textColor}`}>{formatMessageWithLinks(line.replace(/^\d+\.\s/, ""), isUser)}</span>
                </div>
            );
        if (/^([^:]+):\s*(.+)$/.test(line)) {
            const [, key, value] = line.match(/^([^:]+):\s*(.+)$/) || [];
            return (
                <div key={i} className={`flex items-start gap-2 my-0.5 text-xs ${textColor}`}>
                    <span className={`font-semibold ${titleColor}`}>{key.trim()}:</span>
                    <span className="flex-1 break-words">{formatMessageWithLinks(value.trim(), isUser)}</span>
                </div>
            );
        }
        return <div key={i} className={`mb-0.5 break-words text-xs ${textColor}`}>{formatMessageWithLinks(line, isUser)}</div>;
    });

// ============================================================
//  WIDGET — STATS RÉSUMÉ
// ============================================================
const RequestStatsWidget = ({ requests, onShowDetail }) => {
    const total = requests.length;
    const enCours = requests.filter(r => {
        const s = String(r.statut || "").toLowerCase();
        return s.includes("attente") || s.includes("cours") || s.includes("pending");
    }).length;
    const validees = requests.filter(r => {
        const s = String(r.statut || "").toLowerCase();
        return s.includes("valid") || s.includes("accept") || s.includes("approv") || s.includes("termin");
    }).length;
    const rejetees = requests.filter(r => {
        const s = String(r.statut || "").toLowerCase();
        return s.includes("rejet") || s.includes("refus");
    }).length;

    const stats = [
        { label: "Total", value: total, emoji: "📄", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
        { label: "En cours", value: enCours, emoji: "⏳", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
        { label: "Validées", value: validees, emoji: "✅", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
        { label: "Rejetées", value: rejetees, emoji: "🚫", bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-medium">Mes requêtes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.map(({ label, value, emoji, bg, text, border }) => (
                    <div key={label} className={`${bg} border ${border} rounded-xl p-3 flex flex-col gap-1.5`}>
                        <span className="text-xl">{emoji}</span>
                        <span className={`text-2xl font-semibold leading-none ${text}`}>{value}</span>
                        <span className="text-[11px] text-slate-500">{label}</span>
                    </div>
                ))}
            </div>
            {total > 0 && (
                <button
                    onClick={onShowDetail}
                    className="mt-3 text-[11px] text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 font-medium"
                >
                    Voir le détail de mes requêtes →
                </button>
            )}
        </div>
    );
};

// ============================================================
//  WIDGET — DÉTAIL DES CARTES
// ============================================================
const RequestDetailWidget = ({ requests, targetId = null }) => {
    const items = targetId
        ? requests.filter(r => Number(r.id_requete) === Number(targetId))
        : requests;

    if (!items.length)
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
                Aucune requête trouvée.
            </div>
        );

    const getStatusStyle = (statut) => {
        const s = String(statut || "").toLowerCase();
        if (s.includes("rejet") || s.includes("refus"))
            return "bg-red-100 text-red-700";
        if (s.includes("valid") || s.includes("accept") || s.includes("approv") || s.includes("termin"))
            return "bg-emerald-100 text-emerald-700";
        return "bg-amber-100 text-amber-700";
    };

    return (
        <div className="w-full">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-medium">
                {targetId ? `Requête #${targetId}` : `Détail — ${items.length} requête${items.length > 1 ? "s" : ""}`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((req) => {
                    const status = req.statut || req.details?.statut_requete || "Inconnu";
                    const isRejected = /rejet|refus/i.test(String(status));
                    const nextSteps = req.remaining_parcours?.map(p =>
                        [p.role, p.acteur].filter(Boolean).join(" ").trim() || "Acteur"
                    ) || [];
                    const ue = req.ue
                        || (req.details?.ue ? `${req.details.ue.code || ""} ${req.details.ue.intitule || ""}`.trim() : null);

                    return (
                        <div key={req.id_requete} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm">

                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                        Requête #{req.id_requete}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-tight">
                                        {req.type_requete || req.details?.type_requete || "Type inconnu"}
                                    </p>
                                </div>
                                <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 flex-shrink-0 ${getStatusStyle(status)}`}>
                                    {status}
                                </span>
                            </div>

                            {/* Méta */}
                            <div className="flex flex-col gap-2.5">
                                {ue && (
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                            UE
                                        </span>
                                        <span className="text-[12px] text-slate-700">{ue}</span>
                                    </div>
                                )}

                                {req.current_actor && (
                                    <div className="flex items-start gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 text-sm">
                                            👤
                                        </span>
                                        <div>
                                            <p className="text-[10px] text-slate-400 mb-0.5">Acteur actuel</p>
                                            <p className="text-[12px] font-medium text-slate-800">
                                                {req.current_actor.role}
                                                {req.current_actor.acteur ? ` — ${req.current_actor.acteur}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {nextSteps.length > 0 && (
                                    <div className="flex items-start gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 text-sm">
                                            ⏳
                                        </span>
                                        <div>
                                            <p className="text-[10px] text-slate-400 mb-1">Parcours restant</p>
                                            <div className="flex flex-wrap gap-1">
                                                {nextSteps.map((step, i) => (
                                                    <span key={i} className="text-[11px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 border border-slate-200">
                                                        {step}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Box rejet */}
                            {isRejected && (
                                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[12px] text-red-700">
                                    <p className="font-semibold mb-0.5">Motif du refus</p>
                                    <p>{req.rejection_reason || "Non précisé"}</p>
                                    {req.rejected_by && (
                                        <p className="text-[11px] text-red-500 mt-1">Par {req.rejected_by}</p>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                                <span>{req.date_requete || req.details?.date_requete || "Date inconnue"}</span>
                                <span>
                                    {req.details?.parcours?.length
                                        ? `${req.details.parcours.length} étape${req.details.parcours.length > 1 ? "s" : ""}`
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
//  COMPOSANT PRINCIPAL
// ============================================================
function ChatBot() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { lang } = useLanguage();
    const [student, setStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [convHistory, setConvHistory] = useState([]);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [requests, setRequests] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [requestTypes, setRequestTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const studentName = [student?.prenom || student?.firstName, student?.nom || student?.lastName].filter(Boolean).join(" ") || "Étudiant";
    const studentInitial = (student?.prenom || student?.firstName || "É").charAt(0).toUpperCase();
    const studentRole = student?.role || "Étudiant";

    useEffect(() => {
        setStudent(getStudentData());
        (async () => {
            setLoading(true);
            const [r, d, rt] = await Promise.all([
                fetchStudentRequests(), fetchStudentDocuments(), fetchRequestTypes(),
            ]);
            setRequests(r || []);
            setDocuments(d || []);
            setRequestTypes(rt || []);
            setLoading(false);
        })();
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    useEffect(() => {
        textareaRef.current?.focus();
        setMessages([{
            id: 1, isBot: true, timestamp: new Date(),
            text_fr: `🌟 **Bonjour Étudiant !**\n\nJe suis **Minette**, ton assistante IA.\nJe peux t'aider avec tes requêtes, tes documents et tes questions. 😊`,
            text_en: `🌟 **Hello Student!**\n\nI am **Minette**, your AI assistant.\nI can help with your requests, documents, and questions. 😊`,
            widgetType: null,
            widgetTargetId: null,
        }]);
    }, []);

    const formatTime = (d) => d.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });

    // Détecter le tag widget dans la réponse de Minette
    const parseWidgetTag = (text) => {
        if (!text) return { widgetType: null, widgetTargetId: null, cleanText: text };
        const trimmed = text.trim();
        if (trimmed === "[SHOW_STATS]")
            return { widgetType: "stats", widgetTargetId: null, cleanText: null };
        if (trimmed === "[SHOW_DETAIL]")
            return { widgetType: "detail", widgetTargetId: null, cleanText: null };
        const detailMatch = trimmed.match(/^\[SHOW_DETAIL:(\d+)\]$/);
        if (detailMatch)
            return { widgetType: "detail", widgetTargetId: detailMatch[1], cleanText: null };
        return { widgetType: null, widgetTargetId: null, cleanText: text };
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setUploadedImage({
            base64: reader.result.split(",")[1],
            mimeType: file.type,
            previewUrl: reader.result,
            name: file.name,
        });
        reader.readAsDataURL(file);
    };

    const removeUploadedImage = () => {
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendMessage = async (question, imageData = null) => {
        if (!question.trim() && !imageData) return;
        if (isTyping) return;

        setMessages(prev => [...prev, {
            id: Date.now(), isBot: false,
            text_fr: question, text_en: question,
            timestamp: new Date(),
            imgPreview: imageData?.previewUrl || null,
            widgetType: null, widgetTargetId: null,
        }]);

        setInputMessage("");
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsTyping(true);
        setApiError(null);

        const studentContext = {
            prenom: student?.prenom || student?.firstName || "Étudiant",
            total_requetes: requests.length,
            requetes_attente: requests.filter(r => {
                const s = String(r.statut || "").toLowerCase();
                return s.includes("attente") || s.includes("cours") || s.includes("pending");
            }).length,
            requetes_validees: requests.filter(r => {
                const s = String(r.statut || "").toLowerCase();
                return s.includes("valid") || s.includes("accept") || s.includes("approv");
            }).length,
            requetes_rejetees: requests.filter(r => {
                const s = String(r.statut || "").toLowerCase();
                return s.includes("rejet") || s.includes("refus") || s.includes("reject");
            }).length,
            total_documents: documents.length,
            types_requetes: requestTypes.map(t => t.titre),
            requetes: requests.map(r => ({
                id_requete: r.id_requete,
                type_requete: r.type_requete || r.titre || r.type || "Requête",
                statut: r.statut || r.details?.statut_requete || "Inconnu",
                date_requete: r.date_requete || r.details?.date_requete || "Inconnue",
                ue: r.details?.ue ? `${r.details.ue.code || ""} ${r.details.ue.intitule || ""}`.trim() : null,
                circuit: r.circuit || [],
                current_actor: r.current_actor || null,
                remaining_parcours: r.remaining_parcours || [],
                rejection_reason: r.rejection_reason || null,
                rejected_by: r.rejected_by || null,
            })),
        };

        const aiResponse = await callMinetteAPI(question, lang, studentContext, convHistory, imageData?.base64 || null);

        let finalText = null;
        let widgetType = null;
        let widgetTargetId = null;

        if (aiResponse) {
            const parsed = parseWidgetTag(aiResponse);
            widgetType = parsed.widgetType;
            widgetTargetId = parsed.widgetTargetId;
            finalText = parsed.cleanText;

            setConvHistory(prev => [...prev,
            { role: "user", parts: [{ text: question }] },
            { role: "assistant", parts: [{ text: aiResponse }] },
            ].slice(-20));
        } else {
            finalText = lang === "fr"
                ? `❌ **Désolé**\n\nJe rencontre des difficultés techniques. Peux-tu réessayer dans quelques instants ? 🙏`
                : `❌ **Sorry**\n\nI'm experiencing technical difficulties. Can you try again in a few moments? 🙏`;
            setApiError(true);
        }

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            isBot: true,
            text_fr: finalText,
            text_en: finalText,
            widgetType,
            widgetTargetId,
            timestamp: new Date(),
        }]);

        setIsTyping(false);
    };

    const handleSendMessage = async () => {
        if ((!inputMessage.trim() && !uploadedImage) || isTyping) return;
        const question = inputMessage.trim() || (lang === "fr" ? "Analyse cette image." : "Analyze this image.");
        const img = uploadedImage;
        await sendMessage(question, img);
    };

    const handleShowDetail = () => {
        const msg = lang === "fr" ? "Montre-moi le détail de mes requêtes" : "Show me my request details";
        sendMessage(msg);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    const clearChat = () => {
        setMessages([{
            id: 1, isBot: true, timestamp: new Date(),
            text_fr: `🌟 **Bonjour Étudiant !**\n\nNouvelle conversation. Je suis **Minette**, que puis-je faire pour toi ? 😊`,
            text_en: `🌟 **Hello Student!**\n\nNew conversation. I'm **Minette**, what can I do for you? 😊`,
            widgetType: null, widgetTargetId: null,
        }]);
        setConvHistory([]);
        setApiError(null);
    };

    const T = {
        fr: {
            title: "Minette - IA", subtitle: "Faculté des Sciences",
            placeholder: "Écris ton message ici...", clearChat: "Nouvelle conversation", analyzeImage: "Envoyer une image",
        },
        en: {
            title: "Minette - AI", subtitle: "Faculty of Sciences",
            placeholder: "Type your message here...", clearChat: "New conversation", analyzeImage: "Send an image",
        },
    }[lang];

    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/"; };

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                    <p className="text-gray-500">Chargement de Minette…</p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">

            {/* TOPBAR */}
            <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm md:ml-64">
                <div className="px-4 py-2 md:py-3">
                    <div className="flex items-center justify-between gap-3">
                        <button className="md:hidden p-2 rounded-xl bg-gray-100 shrink-0" onClick={() => setDrawerOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={18} className="text-blue-500" />
                                <div>
                                    <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">{T.title}</h1>
                                    <p className="text-[8px] md:text-[9px] text-gray-400 truncate">{T.subtitle}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors group">
                                <Bell size={18} className="text-gray-500 group-hover:text-blue-500" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                            </button>
                            {/* <LanguageToggle className="items-center p-2" small={false} /> */}
                            <div className="flex items-center gap-2 pl-1 border-l border-gray-200 ml-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                                    {studentInitial}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{studentName}</p>
                                    <p className="text-[10px] text-gray-500">{studentRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex overflow-x-hidden">

                {/* SIDEBAR DESKTOP */}
                <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white fixed h-screen">
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white/10 p-0.5 shadow-lg" />
                        <div>
                            <p className="text-sm font-semibold">Université d'Ebolowa</p>
                            <p className="text-[10px] text-blue-300">Faculté des Sciences</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navItems.map(({ label, href, icon: Icon }) => (
                            <a key={href} href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${href === "/minette" ? "bg-blue-700 text-white shadow-lg" : "text-blue-100 hover:bg-blue-800 hover:translate-x-1"}`}>
                                <Icon size={18} />{label}
                            </a>
                        ))}
                    </nav>
                    <div className="px-3 py-4 border-t border-white/10">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg">
                            <LogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </aside>

                {/* DRAWER MOBILE */}
                {drawerOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside className="relative flex flex-col w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full shadow-2xl">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <div className="flex items-center gap-2.5">
                                    <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full bg-white/10 p-0.5" />
                                    <p className="text-sm font-semibold">Université d'Ebolowa</p>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                            </div>
                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {navItems.map(({ label, href, icon: Icon }) => (
                                    <a key={href} href={href} onClick={() => setDrawerOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium ${href === "/minette" ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800"}`}>
                                        <Icon size={18} />{label}
                                    </a>
                                ))}
                            </nav>
                            <div className="px-3 py-4 border-t border-white/10">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-sm font-semibold">
                                    <LogOut size={16} /> Déconnexion
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* ZONE DE CHAT */}
                <main className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
                    <div className="h-12 md:h-[72px] flex-shrink-0" />

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 pb-36 md:pb-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>

                                {/* Avatar bot */}
                                {msg.isBot && (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-1.5 md:mr-2 shrink-0 self-start mt-0.5 shadow-md">
                                        <MessageCircle size={14} className="text-white" />
                                    </div>
                                )}

                                {/* Bulle */}
                                <div className={`
                                    ${msg.isBot && msg.widgetType
                                        ? "max-w-[95%] w-full bg-transparent p-0 border-0 shadow-none"
                                        : msg.isBot
                                            ? "max-w-[80%] md:max-w-[75%] rounded-2xl px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-100 shadow-md text-gray-700"
                                            : "max-w-[80%] md:max-w-[75%] rounded-2xl px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                                    }
                                `}>
                                    {/* Widget STATS */}
                                    {msg.isBot && msg.widgetType === "stats" && (
                                        <RequestStatsWidget
                                            requests={requests}
                                            onShowDetail={handleShowDetail}
                                        />
                                    )}

                                    {/* Widget DETAIL */}
                                    {msg.isBot && msg.widgetType === "detail" && (
                                        <RequestDetailWidget
                                            requests={requests}
                                            targetId={msg.widgetTargetId}
                                        />
                                    )}

                                    {/* Message texte normal */}
                                    {!msg.widgetType && (
                                        <>
                                            {msg.imgPreview && (
                                                <img src={msg.imgPreview} alt="Upload" className="rounded-lg mb-1.5 max-h-32 md:max-h-48 object-cover w-full" />
                                            )}
                                            <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {formatMessage(lang === "fr" ? msg.text_fr : msg.text_en, !msg.isBot)}
                                            </div>
                                            <p className={`text-[8px] md:text-[9px] mt-1 ${msg.isBot ? "text-gray-400" : "text-blue-100"}`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-1.5 md:mr-2 shadow-md">
                                    <MessageCircle size={14} className="text-white" />
                                </div>
                                <div className="bg-white border border-gray-100 shadow-md rounded-2xl px-3 py-2 md:px-4 md:py-3">
                                    <div className="flex gap-1">
                                        {[0, 150, 300].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="flex-shrink-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg mb-10 md:mb-0">
                        {uploadedImage && (
                            <div className="mb-2 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                                <img src={uploadedImage.previewUrl} alt="Preview" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" />
                                <span className="text-[10px] md:text-xs text-gray-600 flex-1 truncate">{uploadedImage.name}</span>
                                <button onClick={removeUploadedImage} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                            </div>
                        )}
                        <div className="flex gap-2 items-center">
                            <button onClick={() => fileInputRef.current?.click()} title={T.analyzeImage}
                                className="p-2 md:p-2.5 rounded-xl bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all">
                                <ImageIcon size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={T.placeholder}
                                    rows={1}
                                    className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white resize-none transition-all"
                                    style={{ maxHeight: "60px" }}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={(!inputMessage.trim() && !uploadedImage) || isTyping}
                                className="group p-2 md:p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            >
                                <Send size={16} className="md:w-[18px] md:h-[18px] group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                        <button onClick={clearChat}
                            className="mt-2 text-[9px] md:text-[10px] text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1 ml-1">
                            <Trash2 size={10} />{T.clearChat}
                        </button>
                    </div>
                </main>

                {/* BOTTOM NAV MOBILE */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-5 z-40 safe-area-bottom shadow-lg">
                    {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
                        { href: "/request", icon: FileText, label: "Mes requêtes" },
                        { href: "/minette", icon: MessageCircle, label: "Minette IA", center: true },
                        { href: "/docs", icon: BookOpen, label: "Documents" },
                        { href: "/info", icon: Info, label: "Infos" },
                    ].map(({ href, icon: Icon, label, center }) => {
                        if (center) return (
                            <a key={href} href={href} className="relative flex flex-col items-center justify-start">
                                <div className="-mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-transform hover:scale-110 active:scale-95">
                                    <Icon size={24} />
                                </div>
                                <span className="text-[9px] mt-1 font-semibold text-gray-700">{label}</span>
                            </a>
                        );
                        return (
                            <a key={href} href={href} className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] sm:text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-all">
                                <Icon size={18} /><span>{label}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
                @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
                .animate-bounce { animation: bounce 1.4s infinite ease-in-out; }
                textarea { overflow-y: auto; }
            `}</style>
        </div>
    );
}

export default ChatBot;
