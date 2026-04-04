const jwt = require('jsonwebtoken');
const { Note } = require('../models');

const intentPatterns = {
    home: /\b(go|open|take|navigate|move)?\s*(to\s*)?(home|dashboard)\b/i,
    materials: /\b(go|open|take|navigate|move)?\s*(to\s*)?(materials?|notes?)\b/i,
    community: /\b(go|open|take|navigate|move)?\s*(to\s*)?(community|question)\b/i,
    chat: /\b(go|open|take|navigate|move)?\s*(to\s*)?(chat|message|inbox)\b/i,
    profile: /\b(go|open|take|navigate|move)?\s*(to\s*)?(profile|account)\b/i,
    feedback: /\b(go|open|take|navigate|move)?\s*(to\s*)?(feedback|help|support)\b/i,
    upload: /\b(upload|add|post)\b.*\b(file|note)\b|\b(upload|file)\b/i,
    notifications: /\b(open|show|view|check)?\s*(notifications?|bell)\b/i,
};

const topicDictionary = {
    math: ['math', 'mathematics', 'calculus', 'algebra', 'statistics', 'probability', 'trigonometry'],
    physics: ['physics', 'mechanics', 'thermodynamics', 'electromagnetism', 'optics'],
    chemistry: ['chemistry', 'organic', 'inorganic', 'physical chemistry'],
    programming: ['programming', 'coding', 'javascript', 'python', 'java', 'react', 'node'],
    dbms: ['dbms', 'database', 'sql', 'mysql', 'normalization'],
    os: ['operating system', 'os', 'process', 'thread', 'scheduling'],
    networks: ['computer networks', 'network', 'tcp', 'udp', 'routing', 'osi'],
    elective: ['elective', 'electives', 'course', 'courses', 'corse', 'subject', 'subjects'],
};

const stopWords = new Set([
    'i', 'want', 'need', 'for', 'the', 'a', 'an', 'to', 'please', 'me', 'give', 'show', 'about', 'my',
]);

const parseUserFromToken = (req) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
        if (!token || !process.env.JWT_SECRET) return null;
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

const detectPortalAction = (message) => {
    if (intentPatterns.upload.test(message)) {
        return {
            action: { type: 'upload' },
            reply:
                'Opening upload modal. Add title, description, semester, subject, and file type, then upload your note.',
        };
    }

    if (intentPatterns.home.test(message)) {
        return { action: { type: 'navigate', path: '/home' }, reply: 'Opening Home page.' };
    }

    if (intentPatterns.materials.test(message)) {
        return { action: { type: 'navigate', path: '/materials' }, reply: 'Taking you to Materials.' };
    }

    if (intentPatterns.community.test(message)) {
        return { action: { type: 'navigate', path: '/community' }, reply: 'Opening Community page.' };
    }

    if (intentPatterns.chat.test(message)) {
        return { action: { type: 'navigate', path: '/chat' }, reply: 'Opening Chat page.' };
    }

    if (intentPatterns.profile.test(message)) {
        return { action: { type: 'navigate', path: '/profile' }, reply: 'Opening your Profile.' };
    }

    if (intentPatterns.feedback.test(message)) {
        return { action: { type: 'navigate', path: '/feedback' }, reply: 'Opening Feedback page.' };
    }

    if (intentPatterns.notifications.test(message)) {
        return {
            reply: 'Use the bell icon on the top bar to open notifications.',
        };
    }

    return null;
};

const extractMatchedTopics = (message) => {
    const text = message.toLowerCase();
    const matched = [];

    Object.entries(topicDictionary).forEach(([topic, aliases]) => {
        if (aliases.some((alias) => text.includes(alias))) {
            matched.push(topic);
        }
    });

    return matched;
};

const extractQueryTokens = (message) => {
    return message
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token && token.length > 2 && !stopWords.has(token));
};

const scoreNote = (note, message, matchedTopics) => {
    const haystack = `${note.title || ''} ${note.description || ''} ${note.subject || ''}`.toLowerCase();
    const queryTokens = extractQueryTokens(message);

    let score = 0;

    queryTokens.forEach((token) => {
        if (haystack.includes(token)) score += 2;
    });

    if (matchedTopics.length) {
        matchedTopics.forEach((topic) => {
            if (haystack.includes(topic)) score += 5;
            topicDictionary[topic].forEach((alias) => {
                if (haystack.includes(alias)) score += 3;
            });
        });
    }

    score += Math.min(note.likes || 0, 20) * 0.2;
    return score;
};

const getRecommendedNotes = async (message) => {
    const matchedTopics = extractMatchedTopics(message);
    const notes = await Note.findAll({
        where: { is_blocked: false },
        attributes: ['id', 'title', 'description', 'subject', 'semester', 'type', 'likes', 'file_url'],
        limit: 80,
        order: [['createdAt', 'DESC']],
    });

    if (!notes.length) return [];

    const scored = notes
        .map((note) => ({ note, score: scoreNote(note, message, matchedTopics) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => ({
            id: item.note.id,
            title: item.note.title,
            subject: item.note.subject,
            semester: item.note.semester,
            type: item.note.type,
            score: Number(item.score.toFixed(2)),
        }));

    if (scored.length) return scored;

    // Fallback: if no textual match, return popular recent notes so user still gets value.
    return notes
        .sort((a, b) => {
            const byLikes = (b.likes || 0) - (a.likes || 0);
            if (byLikes !== 0) return byLikes;
            return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 5)
        .map((note) => ({
            id: note.id,
            title: note.title,
            subject: note.subject,
            semester: note.semester,
            type: note.type,
            score: 0,
        }));
};

const needsNoteRecommendation = (message) => {
    const text = message.toLowerCase();

    if (/\b(topic|topics|recommend|suggest|best note|study|learn|prepare|syllabus|notes? for|about|elective|course|corse|subject)\b/i.test(text)) {
        return true;
    }

    // Very short messages (e.g. "elective", "dbms", "physics notes") should be treated as topic intent.
    const tokens = extractQueryTokens(text);
    return tokens.length > 0 && tokens.length <= 4;
};

const hasExplicitNoteIntent = (message) => {
    return /\b(topic|topics|recommend|suggest|best note|study|learn|prepare|syllabus|notes? for|about|elective|course|corse|subject|notes?)\b/i.test(
        message.toLowerCase()
    );
};

const askGemini = async ({ message, recommendations }) => {
    const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) return null;

    const recSummary = recommendations.length
        ? recommendations
            .map((n, idx) => `${idx + 1}. ${n.title} (${n.subject || 'N/A'}, sem ${n.semester || 'N/A'})`)
            .join('\n')
        : 'No strongly matching notes found.';

    const prompt = `You are StudyBuddy Assistant. Reply in a short, friendly, practical way.\nUser message: ${message}\nTop note recommendations:\n${recSummary}\nIf user asks portal navigation, mention exact page names: Home, Materials, Community, Chat, Profile, Feedback. If recommendations exist, highlight 1-3 relevant notes.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
};

exports.chat = async (req, res) => {
    try {
        const { message = '' } = req.body;

        if (!message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const user = parseUserFromToken(req);
        const actionResult = detectPortalAction(message);

        let recommendations = [];
        const shouldRecommend = actionResult
            ? hasExplicitNoteIntent(message)
            : needsNoteRecommendation(message);

        if (shouldRecommend) {
            recommendations = await getRecommendedNotes(message);
        }

        let reply = actionResult?.reply;

        if (!reply) {
            const aiReply = await askGemini({ message, recommendations });
            if (aiReply) {
                reply = aiReply;
            }
        }

        if (!reply && recommendations.length) {
            const top = recommendations.slice(0, 3).map((n) => n.title).join(', ');
            reply = `I found ${recommendations.length} relevant notes. You can start with: ${top}. Open any recommendation below to view it.`;
        }

        if (!reply) {
            reply =
                'I can help with portal actions and note discovery. Ask me to navigate, upload notes, or recommend notes for a topic (for example: "recommend notes for calculus").';
        }

        return res.status(200).json({
            reply,
            action: actionResult?.action || null,
            recommendations,
            meta: {
                userId: user?.id || null,
                source: process.env.GEMINI_API_KEY ? 'gemini+rules' : 'rules+notes',
            },
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Assistant request failed' });
    }
};
