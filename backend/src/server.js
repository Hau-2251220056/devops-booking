require('dotenv').config();

const app = require('./app');

console.log(' [BOOT] server.js starting...');

const PORT = process.env.PORT || 5000;

console.log(' [ENV] PORT =', PORT);

if (!PORT) {
    console.error(' PORT is not defined');
    throw new Error('PORT is not defined');
}

try {
    app.listen(PORT, () => {
        console.log(' [SERVER] Server is running');
        console.log(` [SERVER] Listening on port: ${PORT}`);
        console.log('Health check: /api/health');
    });
} catch (err) {
    console.error(' [FATAL] Failed to start server:');
    console.error(err);
    process.exit(1);
}

process.on('uncaughtException', (err) => {
    console.error(' [UNCAUGHT_EXCEPTION]');
    console.error(err);
});

process.on('unhandledRejection', (err) => {
    console.error(' [UNHANDLED_REJECTION]');
    console.error(err);
});
