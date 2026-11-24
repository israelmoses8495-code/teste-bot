const htpp = require('http');
http .createServer((req, res) =>res.end( 'bot is running')).listen(3000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/【entity-baileys¦canonical_name=Baileys】');
const qrcode = require('qrcode-terminal');
const express = require(' express');
const pino = require('pino');

const app = express();
app.get('/', (req, res) => res.send('Test QR en ligne ✅'));
app.listen(process.env.PORT || 3000);

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ auth: state, logger: pino({level: 'silent'}) });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('=== SCANNE MOI ===');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (reconnect) start();
    } else if (connection === 'open') {
      console.log('✅ CONNECTÉ !');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const texte = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!texte) return;
    console.log('Reçu:', texte);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bonjour ! Test QR Code réussi ✅ Jai bien reçu : ' + texte });
  });
}
start();