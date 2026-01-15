require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.js');

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
