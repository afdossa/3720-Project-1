const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/admin', routes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Admin service running on http://localhost:${PORT}`);
});