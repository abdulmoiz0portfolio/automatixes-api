const http = require('http');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const EVOLUTION_URL = 'http://localhost:8080';
const API_KEY = 'D90BC5A8E4FAF6BF4A04DC62495A8CAF';
const INSTANCE = 'test';

const PYTHON_PATH = 'C:\\Users\\Moiz Baig\\.gemini\\antigravity\\venv\\Scripts\\python.exe';
const TRANSCRIBE_SCRIPT = path.join(__dirname, 'transcribe.py');

const processedMessages = new Set();
setInterval(() => { if (processedMessages.size > 2000) processedMessages.clear(); }, 10 * 60 * 1000);

// Audio transcriber helper
async function transcribeAudio(messageData) {
  try {
    const res = await fetch(`${EVOLUTION_URL}/chat/getBase64FromMediaMessage/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageData,
        convertToMp4: false
      })
    });
    const result = await res.json();
    const base64Data = result?.base64;
    if (!base64Data) return '';

    const cleanBase64 = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
    const tempFile = path.join(__dirname, `temp_voice_${Date.now()}.ogg`);
    fs.writeFileSync(tempFile, Buffer.from(cleanBase64, 'base64'));

    return new Promise((resolve) => {
      execFile(PYTHON_PATH, [TRANSCRIBE_SCRIPT, tempFile], { encoding: 'utf8' }, (err, stdout) => {
        try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) {}
        if (err) {
          console.error('[TRANSCRIBE ERROR]', err.message);
          resolve('');
        } else {
          resolve((stdout || '').trim());
        }
      });
    });
  } catch (err) {
    console.error('[FETCH AUDIO ERROR]', err.message);
    return '';
  }
}

// Funny, witty reply generator
// 100% Natural, Human-like Conversational Replies (No robot / AI mentions)
function getNaturalReply(text, senderName) {
  const lower = (text || '').toLowerCase().trim();
  const name = senderName && senderName.trim().length > 0 ? senderName.split(' ')[0] : 'bhai';

  // Islamic greetings
  if (/^(salam|assalam|aoa|slam|slaam|aslamo|asalam)/i.test(lower)) {
    const salamReplies = [
      `Walaikum Assalam! Kya haal chaal hain?`,
      `Walaikum Assalam ${name}! Kaise ho bhai, sab theek?`,
      `Walaikum Assalam bhai, kaisa chal raha hai sab?`
    ];
    return salamReplies[Math.floor(Math.random() * salamReplies.length)];
  }

  // Morning greetings
  if (/^(gm|good morning|subah bakhair)/i.test(lower)) {
    const morningReplies = [
      `Morning ${name}! Kya haal hain? Kaisa chal raha hai din?`,
      `Subah bakhair! Uth gaye bhai? Kya plan hai aaj ka?`
    ];
    return morningReplies[Math.floor(Math.random() * morningReplies.length)];
  }

  // Night greetings
  if (/^(gn|good night|shab bakhair|so jao)/i.test(lower)) {
    return `Good night bhai, araam karo! Kal baat hoti hai InshaAllah.`;
  }

  // Asking how are you
  if (/kaise ho|kese ho|kya hal|kia hal|kese hen|kesy ho|how are you|kya scene/i.test(lower)) {
    const healthReplies = [
      `Alhamdulillah bilkul theek thaak! Aap sunao, sab khairiyat?`,
      `Theek thaak bhai, Allah ka karam hai. Aap sunayein kya chal raha hai?`,
      `Bas badhiya bhai, aap batao kya chal raha hai aaj kal?`
    ];
    return healthReplies[Math.floor(Math.random() * healthReplies.length)];
  }

  // Asking where are you
  if (/kahan ho|kidhar ho|kdr ho|kahan par ho|where are you/i.test(lower)) {
    const locationReplies = [
      `Thoda bahar tha bhai kaam se, bolo kya scene hai?`,
      `Bas thoda sa busy tha, batao sab khairiyat hai na?`
    ];
    return locationReplies[Math.floor(Math.random() * locationReplies.length)];
  }

  // Call / Talk requests
  if (/call karo|call me|baat karni|phone uthao|free ho|call pick/i.test(lower)) {
    const callReplies = [
      `Haan bhai, main zara 10-15 minute tak free ho kar call karta hoon aapse.`,
      `Thoda sa phasa hua hoon bhai, jaise hi free hota hoon call/message karta hoon.`
    ];
    return callReplies[Math.floor(Math.random() * callReplies.length)];
  }

  // Thanks / Gratitude
  if (/shukriya|thanks|thank you|jazakallah|thx/i.test(lower)) {
    return `Welcome bhai, koi masla hi nahi! ❤️`;
  }

  // Short affirmations
  if (/^(ok|theek|sahi|acha|hmmm|hmm|done|yes|haan|han)$/i.test(lower)) {
    const shortReplies = [
      `Theek ho gaya 👍`,
      `Sahi hai!`,
      `Done scene hai.`
    ];
    return shortReplies[Math.floor(Math.random() * shortReplies.length)];
  }

  // Banter / Friendly slang
  if (/lpc|bc|mc|kameene|kutte|chup|pagal|bakchodi|bachodi/i.test(lower)) {
    return `Haha bhai aaram se, kya ho gaya itna ghussa kyun kar rahe ho? 😂 Thanda paani piyo!`;
  }

  // Natural default replies for all other messages
  const defaultNaturalReplies = [
    `Haan bhai, bolo kya scene hai?`,
    `Acha theek hai, main dekh kar thodi der tak detail mein reply karta hoon aapse.`,
    `Sahi hai bhai, samajh gaya. Main abhi thoda masroof tha, thodi der mein baat karte hain.`
  ];

  return defaultNaturalReplies[Math.floor(Math.random() * defaultNaturalReplies.length)];
}

async function sendWhatsAppMessage(remoteJid, text) {
  const number = remoteJid.replace('@s.whatsapp.net', '');
  try {
    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: number,
        text: text
      })
    });
    const result = await res.json();
    console.log(`[REPLIED] To: ${number} | Reply: "${text.replace(/\n/g, ' ')}"`);
  } catch (err) {
    console.error(`[ERROR] Failed to send message to ${number}:`, err.message);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received' }));

      try {
        const payload = JSON.parse(body);
        const event = payload.event;
        const data = payload.data;

        if (event !== 'messages.upsert' || !data) return;

        const key = data.key || {};
        const fromMe = key.fromMe;
        const remoteJid = key.remoteJid || '';
        const messageId = key.id;

        // Skip self messages, status, groups
        if (fromMe || remoteJid === 'status@broadcast' || remoteJid.endsWith('@g.us')) return;

        const senderNumber = remoteJid.replace('@s.whatsapp.net', '');

        if (processedMessages.has(messageId)) return;
        processedMessages.add(messageId);

        const msg = data.message || {};
        let incomingText = msg.conversation || 
                           msg.extendedTextMessage?.text || 
                           msg.imageMessage?.caption || 
                           msg.videoMessage?.caption || '';

        const isVoice = !!msg.audioMessage;
        const isImage = !incomingText && !!msg.imageMessage;
        const isDoc = !incomingText && !!msg.documentMessage;

        if (!incomingText && !isVoice && !isImage && !isDoc) return;

        const pushName = data.pushName || '';

        let reply = '';
        if (isVoice) {
          console.log(`\n[VOICE NOTE] From: ${pushName} (${remoteJid}). Transcribing voice note...`);
          const transcribedText = await transcribeAudio(data);
          if (transcribedText) {
            console.log(`[VOICE TRANSCRIBED] Recognized: "${transcribedText}"`);
            reply = getNaturalReply(transcribedText, pushName);
          } else {
            console.log(`[VOICE NOTE] Low audio or unrecognizable speech.`);
            reply = `Voice note theek se clear nahi aaya bhai, shor ki wajah se samajh nahi saka. Likh kar bhej do ya dubara bol do!`;
          }
        } else if (isImage) {
          console.log(`\n[IMAGE RECEIVED] From: ${pushName} (${remoteJid})`);
          reply = `Image mil gayi hai bhai, dekh kar thodi der tak batata hoon.`;
        } else if (isDoc) {
          console.log(`\n[FILE RECEIVED] From: ${pushName} (${remoteJid})`);
          reply = `File receive ho gayi hai bhai, free ho kar check karta hoon.`;
        } else {
          console.log(`\n[NEW MESSAGE] From: ${pushName} (${remoteJid}): "${incomingText}"`);
          reply = getNaturalReply(incomingText, pushName);
        }

        // Natural human-like pause (2.5s) so it feels like a real person typing
        setTimeout(async () => {
          await sendWhatsAppMessage(remoteJid, reply);
        }, 2500);

      } catch (e) {
        console.error('[ERROR] Processing webhook:', e.message);
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Witty AI Auto-Responder Active (All Numbers Enabled)!\n');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  WhatsApp Bot RUNNING on port ${PORT}`);
  console.log(`  MODE: Auto-replying to ALL incoming numbers!`);
  console.log(`  (Groups & Status broadcasts are safely excluded)`);
  console.log(`====================================================`);
});
