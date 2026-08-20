const express = require('express');
const pool = require('../db');
const router = express.Router();

const { align } = require('../alignment');
const { v4: uuidv4 } = require('uuid');

function parseSequences(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const seqs = [];
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const name = line.slice(0, idx).trim();
      const sequence = line.slice(idx + 1).replace(/\s+/g, '').toUpperCase();
      seqs.push({ name, sequence });
    }
  }
  return seqs;
}
router.post('/sequences/compare/:batchId', async (req, res) => {
  const { batchId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM sequences WHERE batch_id = $1',
      [batchId]
    );
    const seqs = result.rows;

    if (seqs.length < 2) {
      return res.status(400).json({ error: 'Batch needs at least 2 sequences' });
    }

    const comparisons = [];
    for (let i = 0; i < seqs.length; i++) {
      for (let j = i + 1; j < seqs.length; j++) {
        const r = align(seqs[i].sequence, seqs[j].sequence);
        const identityScore = Math.round(r.identity * 10000) / 100; // e.g. 87.65

        const saved = await pool.query(
          `INSERT INTO comparisons (batch_id, sequence_id_1, sequence_id_2, identity_score)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [batchId, seqs[i].id, seqs[j].id, identityScore]
        );

        comparisons.push({
          ...saved.rows[0],
          name1: seqs[i].name,
          name2: seqs[j].name,
        });
      }
    }

    comparisons.sort((a, b) => b.identity_score - a.identity_score);
    res.json({ batchId, comparisons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compare batch' });
  }
});
router.post('/sequences/batch', async (req, res) => {
  const { text } = req.body;
  const parsed = parseSequences(text);

  if (parsed.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 sequences' });
  }

  const batchId = uuidv4();

  try {
    const inserted = [];
    for (const seq of parsed) {
      const result = await pool.query(
        'INSERT INTO sequences (name, sequence, batch_id) VALUES ($1, $2, $3) RETURNING *',
        [seq.name, seq.sequence, batchId]
      );
      inserted.push(result.rows[0]);
    }
    res.json({ batchId, sequences: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save batch' });
  }
});

router.get('/sequences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sequences ORDER BY date_added DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sequences' });
  }
});

router.get('/sequences/motif/:batchId', async (req, res) => {
  const { batchId } = req.params;
  const { motif } = req.query;

  if (!motif) {
    return res.status(400).json({ error: 'Provide a motif to search for' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM sequences WHERE batch_id = $1',
      [batchId]
    );

    const searchTerm = motif.toUpperCase();
    const matches = result.rows
      .map(seq => {
        const positions = [];
        let idx = seq.sequence.indexOf(searchTerm);
        while (idx !== -1) {
          positions.push(idx);
          idx = seq.sequence.indexOf(searchTerm, idx + 1);
        }
        return { name: seq.name, sequence: seq.sequence, positions };
      })
      .filter(seq => seq.positions.length > 0);

    res.json({ motif: searchTerm, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search motif' });
  }
});

module.exports = router;
