const express = require('express');
const { broadcast } = require('../ws');

const router = express.Router();

router.post('/notify', (req, res) => {
  const { type, data } = req.body;

  broadcast({ type, data });

  res.sendStatus(200);
});

module.exports = router;
