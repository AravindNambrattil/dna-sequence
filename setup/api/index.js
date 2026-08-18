const express = require('express');
const cors = require('cors');
const sequenceRoutes = require('./routes/sequences');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', sequenceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
