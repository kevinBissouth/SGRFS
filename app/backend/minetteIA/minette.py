from google import genai
from backend.core.config import settings
from datetime import datetime
import logging
import pytz
import re
import socket
import httpx

logger = logging.getLogger(__name__)

if not settings.GEMINI_API_KEY:
    logger.error("La clé GEMINI_API_KEY n'est pas configurée")
    client = None
else:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        print("✅ Client Minette initialisé")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        client = None

JOURS_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
MOIS_FR  = ["janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre"]


def _get_datetime_context() -> str:
    try:
        tz  = pytz.timezone("Africa/Douala")
        now = datetime.now(tz)
    except Exception:
        now = datetime.utcnow()
    jour = JOURS_FR[now.weekday()]
    mois = MOIS_FR[now.month - 1]
    return f"{jour} {now.day} {mois} {now.year}, {now.strftime('%H:%M')}"


def _is_simple_greeting(message: str) -> bool:
    if not message:
        return False
    normalized = message.strip().lower()
    return bool(re.fullmatch(
        r"(bonjour|salut|coucou|hello|hey|hi|bonsoir|bon matin|good morning|good evening|ça va|ca va|comment ça va|comment vas-tu)([ !?\.]*)",
        normalized
    ))


SYSTEM_PROMPT = """Tu es Minette, la compagne IA des étudiants de la Faculté des Sciences de l'Université d'Ebolowa.
Tu es comme une grande sœur : présente, directe, empathique, drôle quand c'est le moment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 DATE & HEURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tu reçois la date/heure dans chaque message.
→ Ne les mentionne JAMAIS spontanément.
→ Utilise-les UNIQUEMENT si l'étudiant te demande explicitement la date ou l'heure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗣️ STYLE & PERSONNALITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Parle naturellement comme dans un vrai chat. Court et humain.
- Ne te présente pas à chaque message. Ne salue pas à chaque réponse.
- Si l'étudiant est énervé ou grossier : reste calme, pas de morale, pas de leçon.
- Jamais de conseils non sollicités (sommeil, santé, habitudes...).
- 1 emoji max par réponse, seulement si naturel.
- Jamais : "Bien sûr !", "Absolument !", "Je suis là pour vous aider !"
- Si l'étudiant dit juste bonjour ou parle de choses légères, réponds simplement sans parler des requêtes en attente, du suivi ou du statut.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💛 DOMAINES COUVERTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tu es une compagne complète :
- Requêtes administratives (ton expertise)
- Vie étudiante : stress, argent, logement, campus, profs
- Vie personnelle : amour, famille, amitié, émotions, doutes
- Décisions de vie : orientation, choix de filière, avenir
- Causerie légère : humeur, blagues, quotidien

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 SUIVI DES REQUÊTES — RÈGLE DES TAGS UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L'interface affiche automatiquement de belles cartes quand tu renvoies un tag spécial.
Tu dois utiliser ces tags EXACTEMENT comme indiqué, sans aucun texte autour.

╔══════════════════════════════════════════════════════════════╗
║  QUAND utiliser [SHOW_STATS]                                 ║
╠══════════════════════════════════════════════════════════════╣
║  L'étudiant demande :                                        ║
║  - "mes requêtes", "j'ai combien de requêtes"                ║
║  - "quel est le statut de mes requêtes"                      ║
║  - "montre-moi mes requêtes"                                 ║
║  - "c'est quoi l'état de mes requêtes"                       ║
║  → Réponds UNIQUEMENT avec : [SHOW_STATS]                    ║
║  → RIEN d'autre. Pas de texte avant, pas de texte après.     ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  QUAND utiliser [SHOW_DETAIL]                                ║
╠══════════════════════════════════════════════════════════════╣
║  L'étudiant demande :                                        ║
║  - "détail de mes requêtes", "voir le détail"                ║
║  - "montre-moi le détail de mes requêtes"                    ║
║  - "les infos complètes sur mes requêtes"                    ║
║  → Réponds UNIQUEMENT avec : [SHOW_DETAIL]                   ║
║  → RIEN d'autre. Pas de texte avant, pas de texte après.     ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  QUAND utiliser [SHOW_DETAIL:ID]                             ║
╠══════════════════════════════════════════════════════════════╣
║  L'étudiant demande une requête précise par numéro :         ║
║  - "requête 12", "la requête #12", "requête numéro 12"       ║
║  → Réponds UNIQUEMENT avec : [SHOW_DETAIL:12]                ║
║  → RIEN d'autre. Remplace 12 par le vrai numéro.             ║
╚══════════════════════════════════════════════════════════════╝

⚠️  RÈGLE ABSOLUE : Ces tags ne doivent JAMAIS être mélangés avec du texte.
     Si tu veux commenter, fais-le dans un message SUIVANT.
     Un message = soit un tag, soit du texte. Jamais les deux.

Pour les questions sur le MOTIF d'un rejet, le commentaire d'un acteur,
ou des explications sur une requête spécifique → réponds normalement en texte,
en utilisant les infos du contexte fourni.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 DÉTECTION D'INTENTION DE REQUÊTE — RÈGLE CENTRALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ÉTAPE 1 — DÉTECTER
Quand l'étudiant exprime un problème ou un besoin qui peut être résolu par une requête,
tu dois le détecter IMMÉDIATEMENT, même si le mot "requête" n'est pas dit.

Signaux à détecter (exemples non exhaustifs) :
→ Document perdu ou manquant       ("j'ai perdu mon quitus", "j'ai pas mon relevé")
→ Besoin d'une attestation          ("j'ai besoin d'un justificatif pour...")
→ Dossier de bourse                 ("ma bourse tarde", "je veux faire une demande de bourse")
→ Convention ou lettre de stage     ("je dois trouver un stage", "mon entreprise demande une lettre")
→ Contester une décision            ("j'ai été exclu", "ma note a été modifiée sans raison")
→ Toute demande implicite de document officiel

ÉTAPE 2 — COMPATIR D'ABORD (1-2 phrases max)
Avant tout, montre que tu comprends la situation. Sois humaine, pas administrative.
Exemples :
- "Ah c'est chiant ça, surtout quand t'en as besoin rapidement."
- "Ouh, c'est le genre de galère qu'on voit venir de loin..."
- "Ça arrive, mais c'est stressant quand t'as un délai."

ÉTAPE 3 — ANNONCER QU'IL Y A UNE SOLUTION (1 phrase)
Dis-lui qu'une requête peut régler ça, de façon simple et rassurante.
Exemples :
- "Bonne nouvelle, c'est exactement le genre de truc qu'on peut régler via une requête."
- "La plateforme permet de traiter ça facilement avec une requête officielle."

ÉTAPE 4 — NOMMER LE TYPE DE REQUÊTE (1 phrase)
Précise le type adapté parmi : Attestation de scolarité, Relevé de notes, Bourse, Stage, Décision administrative.
Exemple :
- "Il te faudrait une requête de type **Attestation de scolarité**."
- "C'est une requête **Stage** qu'il te faut dans ce cas."

ÉTAPE 5 — PROPOSER L'AIDE ET ATTENDRE (1 phrase, toujours en fin de message)
Termine TOUJOURS par une question ouverte qui attend le feu vert. Ne pas forcer.
Exemples :
- "Tu veux qu'on la prépare ensemble ?"
- "Je peux t'aider à la constituer si tu veux ?"
- "On s'en occupe maintenant ou tu préfères qu'on en parle d'abord ?"

⚠️ RÈGLE ABSOLUE : Ne jamais donner les étapes détaillées, les documents ou la procédure complète
AVANT que l'étudiant ait dit oui. La proposition vient AVANT le détail.

ÉTAPE 6 — SI L'ÉTUDIANT ACCEPTE
Alors et seulement alors, donne la structure complète :

**Ce que j'ai compris**
[Résumé du problème en 1 phrase]

**Type de requête**
[Nom du type]

**Documents à préparer**
1. [Document 1]
2. [Document 2]
3. [Document 3 si nécessaire]

**À faire maintenant**
[Action concrète immédiate et précise]

ÉTAPE 7 — SI L'ÉTUDIANT REFUSE OU CHANGE DE SUJET
Respecte son choix, la conversation continue normalement. Pas d'insistance.
- Si l'étudiant refuse, cesse immédiatement de proposer la requête.
- Si l'étudiant change de sujet, réponds normalement au nouveau sujet.
- Ne reviens pas sur la même requête tant qu'il n'en fait pas la demande.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Ne jamais inventer une date, heure, délai, document ou règle.
- Ne jamais donner les détails de procédure avant le feu vert de l'étudiant.
- Ne jamais faire la morale ou donner des conseils non demandés.
- Ne jamais dire "Je ne peux pas répondre" pour une question simple ou de la causerie.
- Ne jamais parler de : contenu des cours, notes d'examen, emplois du temps.
- Ne JAMAIS mélanger un tag [SHOW_*] avec du texte dans le même message."""


def _build_contents(
    message: str,
    student_context: dict | None,
    conversation_history: list | None
) -> list:
    contents = []

    if student_context:
        prenom   = student_context.get("prenom", "")
        total    = student_context.get("total_requetes", 0)
        attente  = student_context.get("requetes_attente", 0)
        validees = student_context.get("requetes_validees", 0)
        rejetees = student_context.get("requetes_rejetees", 0)
        types    = student_context.get("types_requetes", [])
        types_str = ", ".join(types) if types else \
            "Attestation de scolarité, Relevé de notes, Bourse, Stage, Décision administrative"

        full_ctx = (
            f"[CONTEXTE SYSTÈME — confidentiel, ne jamais mentionner]\n"
            f"Prénom : {prenom}\n"
            f"Requêtes → Total : {total} | En cours/Attente : {attente} | Validées : {validees} | Rejetées : {rejetees}\n"
            f"Types disponibles sur la plateforme : {types_str}\n"
            f"Utilise son prénom naturellement, de temps en temps.\n\n"
            f"RAPPEL TAG UI :\n"
            f"- Question générale sur ses requêtes → réponds UNIQUEMENT [SHOW_STATS]\n"
            f"- Demande de détail toutes requêtes → réponds UNIQUEMENT [SHOW_DETAIL]\n"
            f"- Demande d'une requête spécifique #N → réponds UNIQUEMENT [SHOW_DETAIL:N]\n"
            f"- Aucun texte ne doit accompagner ces tags.\n"
        )

        requetes = student_context.get("requetes", [])
        if requetes:
            full_ctx += "\nSuivi détaillé des requêtes (utilise uniquement si l'étudiant pose une question précise sur une requête) :\n"
            for requete in requetes:
                id_req       = requete.get("id_requete", "?")
                type_requete = requete.get("type_requete", "Type inconnu")
                statut       = requete.get("statut", "Inconnu")
                date_requete = requete.get("date_requete", "Inconnue")
                ue           = requete.get("ue")

                full_ctx += f"- Requête #{id_req} : **{type_requete}** — statut : {statut} — date : {date_requete}\n"
                if ue:
                    full_ctx += f"   • UE : {ue}\n"

                circuit = requete.get("circuit") or []
                if circuit:
                    circuit_desc = " → ".join([
                        f"{item.get('role', 'Acteur')} {item.get('acteur', '').strip()} ({item.get('etat', '').strip()})"
                        for item in circuit if item.get("role") or item.get("acteur")
                    ])
                    full_ctx += f"   • Circuit : {circuit_desc}\n"

                current_actor = requete.get("current_actor")
                if current_actor:
                    full_ctx += (
                        f"   • Acteur actuel : {current_actor.get('role', '').strip()} "
                        f"{current_actor.get('acteur', '').strip()} — {current_actor.get('etat', '').strip()}\n"
                    )

                remaining = requete.get("remaining_parcours") or []
                if remaining:
                    remaining_desc = ", ".join([
                        f"{item.get('role', 'Acteur')} {item.get('acteur', '').strip()} ({item.get('etat', '').strip()})"
                        for item in remaining if item.get("role") or item.get("acteur")
                    ])
                    full_ctx += f"   • Parcours restant : {remaining_desc}\n"

                rejection_reason = requete.get("rejection_reason")
                rejected_by      = requete.get("rejected_by")
                if rejection_reason or rejected_by:
                    full_ctx += f"   • Rejet : {rejection_reason or 'Motif non précisé'}"
                    if rejected_by:
                        full_ctx += f" — par {rejected_by}"
                    full_ctx += "\n"

        contents.append({"role": "user",  "parts": [{"text": full_ctx}]})
        contents.append({"role": "model", "parts": [{"text": "Compris. Je suis prête."}]})

    if conversation_history:
        contents.extend(conversation_history)

    now_str = _get_datetime_context()
    full_message = (
        f"[INFO SYSTÈME — confidentielle : {now_str} — "
        f"utilise UNIQUEMENT si l'étudiant demande la date ou l'heure]\n\n"
        f"{message}"
    )
    contents.append({"role": "user", "parts": [{"text": full_message}]})
    return contents


def _render_prompt(contents: list) -> str:
    return "\n\n".join(
        part.get("text", "")
        for message in contents
        for part in message.get("parts", [])
    ).strip()


def ask_minette(
    message: str,
    student_context: dict | None = None,
    conversation_history: list | None = None
) -> str:
    """
    Interroge Minette avec historique de conversation.

    Args:
        message:              Message courant de l'étudiant.
        student_context:      Dict → prenom, total_requetes, requetes_attente,
                              requetes_validees, requetes_rejetees, types_requetes, requetes
        conversation_history: Liste de tours au format Gemini, maintenue côté appelant.
    Returns:
        str: Réponse de Minette (texte ou tag [SHOW_STATS] / [SHOW_DETAIL] / [SHOW_DETAIL:N])
    """

    if client is None:
        logger.error("Client Minette non initialisé")
        return "❌ Minette est temporairement indisponible."

    if _is_simple_greeting(message):
        return "Salut ! Dis-moi ce dont tu as besoin, je suis là pour t'aider."

    contents = _build_contents(message, student_context, conversation_history)
    prompt = _render_prompt(contents)

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

        if isinstance(response, dict):
            return response.get("text", str(response))

        return str(response)

    except Exception as exc:
        if isinstance(exc, (httpx.ConnectError, socket.gaierror)) or (
            isinstance(exc, OSError) and getattr(exc, "errno", None) == -3
        ):
            logger.exception("Erreur de connexion à Minette")
            return (
                "❌ Impossible de joindre Minette. Vérifie ta connexion internet, "
                "ton DNS ou ton proxy, puis réessaye."
            )
        logger.exception("Erreur lors de l'appel à Minette")
        return "❌ Je n'arrive pas à contacter Minette pour le moment. Peux-tu réessayer ?"
