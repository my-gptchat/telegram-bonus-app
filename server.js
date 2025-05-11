// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory DB (replace with real DB in production)
const users = {}; // { telegram_id: { payeer_wallet, last_bonus_time, total_received } }

const PAYEER_ACCOUNT = 'P12345678';
const PAYEER_API_ID = 'your_api_id';
const PAYEER_API_SECRET = 'your_api_secret';

function sendBonusToPayeer(wallet, amount) {
  // Simulated Payeer request (replace with real API call)
  return new Promise((resolve) => {
    console.log(`Sending $${amount} to ${wallet}`);
    resolve({ success: true, transaction_id: Date.now() });
  });
}

app.post('/bonus', async (req, res) => {
  const { telegram_id, payeer_wallet } = req.body;
  const now = Date.now();
  const user = users[telegram_id] || {
    payeer_wallet,
    last_bonus_time: 0,
    total_received: 0,
  };

  if (now - user.last_bonus_time < 5 * 60 * 1000) {
    return res.status(429).json({ error: 'Бонус доступен раз в 5 минут' });
  }

  const bonus = (Math.random() * 0.04 + 0.01).toFixed(2);
  const response = await sendBonusToPayeer(payeer_wallet, bonus);

  if (response.success) {
    user.last_bonus_time = now;
    user.total_received += parseFloat(bonus);
    users[telegram_id] = user;
    return res.json({ success: true, amount: bonus });
  } else {
    return res.status(500).json({ error: 'Ошибка при отправке бонуса' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
