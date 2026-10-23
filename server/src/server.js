const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CD2 Marketplace Backend is running on port ${PORT}`);
    console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👉 Health Check: http://localhost:${PORT}/health`);
    console.log(`👉 Database: PostgreSQL (cd2_marketplace_db)`);
    console.log(`====================================================`);
});
