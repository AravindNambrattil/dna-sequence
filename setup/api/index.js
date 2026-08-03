const express = require('express');
const sequenceRoutes = require('./routes/sequences');

const app = express();
app.use(express.json());
app.use('/api', sequenceRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
