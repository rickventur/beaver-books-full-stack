const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ── Rotas ───────────────────────────────────────────────────────────────────
app.use('/leads',  require('./leads'));
app.use('/admin',  require('./admin'));
app.use('/books',  require('./books'));
app.use('/orders', require('./orders'));

// ── Páginas HTML ────────────────────────────────────────────────────────────
app.get('/catalogo', (req, res) => {
  res.sendFile(path.join(__dirname, 'catalogo.html'));
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', projeto: 'Beaver Books Backend', versao: '1.1.0' });
});

// ── Inicia o servidor ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Beaver Books rodando na porta ${PORT}`);
  console.log(`📊 Painel admin: http://localhost:${PORT}/admin`);
  console.log(`📚 Catálogo:     http://localhost:${PORT}/catalogo`);
});
