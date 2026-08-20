const express = require('express');
const cors = require('cors');
const sequenceRoutes = require('./routes/sequences');

const a = express();
a.use(cors());
a.use(express.json());
a.use('/api', sequenceRoutes);

const PORT = 3000;
a.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
