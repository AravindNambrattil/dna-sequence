const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/sequences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sequences ORDER BY date_added DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sequences' });
  }
});

module.exports = router;
