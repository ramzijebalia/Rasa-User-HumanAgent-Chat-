const mongoose = require('mongoose');

function createDatabaseConnection(tenantId) { //  email@tenantid.com
    const db = mongoose.createConnection(`mongodb://127.0.0.1:27017/${tenantId}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return db;
}

module.exports = createDatabaseConnection;
