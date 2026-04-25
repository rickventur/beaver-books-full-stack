const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

// ── Rotas ───────────────────────────────────────────────────────────────────
app.use('/leads', require('./routes/leads'));
app.use('/admin', require('./routes/admin'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', projeto: 'Beaver Books Backend', versao: '1.0.0' });
});

// ── Inicia o servidor ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Beaver Books rodando na porta ${PORT}`);
  console.log(`📊 Painel admin: http://localhost:${PORT}/admin`);
});
