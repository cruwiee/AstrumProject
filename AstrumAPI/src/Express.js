const express = require('express');
const app = express();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(5000, () => console.log('Server running on port 5000'));
