const express = require('express');
const router  = express.Router();
const pool    = require('../database');
const path    = require('path');

// ── Middleware de autenticação ──────────────────────────────────────────────
function auth(req, res, next) {
  const senha = req.headers['x-admin-senha'];
  if (!senha || senha !== process.env.ADMIN_SENHA) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  next();
}

// ── GET /admin  → serve o painel HTML ──────────────────────────────────────
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// ── GET /admin/leads  → lista leads com filtros ────────────────────────────
router.get('/leads', auth, async (req, res) => {
  const { status, objetivo, busca } = req.query;
  const params = [];
  let where = 'WHERE 1=1';

  if (status)  { params.push(status);  where += ` AND status = $${params.length}`; }
  if (objetivo){ params.push(objetivo); where += ` AND objetivo = $${params.length}`; }
  if (busca)   {
    params.push(`%${busca}%`);
    where += ` AND (nome ILIKE $${params.length} OR email ILIKE $${params.length} OR whatsapp ILIKE $${params.length})`;
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leads ${where} ORDER BY criado_em DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar leads.' });
  }
});

// ── GET /admin/leads/:id  → detalhe de um lead ─────────────────────────────
router.get('/leads/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Lead não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar lead.' });
  }
});

// ── PATCH /admin/leads/:id  → atualiza status ──────────────────────────────
router.patch('/leads/:id', auth, async (req, res) => {
  const { status, anotacao } = req.body;
  try {
    await pool.query(
      'UPDATE leads SET status = COALESCE($1, status), anotacao = COALESCE($2, anotacao) WHERE id = $3',
      [status || null, anotacao || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar lead.' });
  }
});

// ── DELETE /admin/leads/:id  → remove lead ─────────────────────────────────
router.delete('/leads/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar lead.' });
  }
});

// ── GET /admin/stats  → números do dashboard ───────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'novo')         AS novos,
        COUNT(*) FILTER (WHERE status = 'em_contato')   AS em_contato,
        COUNT(*) FILTER (WHERE status = 'publicando')   AS publicando,
        COUNT(*) FILTER (WHERE status = 'encerrado')    AS encerrados,
        COUNT(*)                                         AS total,
        COUNT(*) FILTER (WHERE criado_em >= NOW() - INTERVAL '7 days') AS ultimos_7_dias
      FROM leads
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
  }
});

module.exports = router;
