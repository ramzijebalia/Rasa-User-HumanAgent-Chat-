const mongoose = require("mongoose");
const createDatabaseConnection = require('./dbConnection');

module.exports.LoginMultiTenant = async (req, res, next) => {
    const email = req.body?.email || '';
    const domain = email.split('@')[1].split('.')[0];
    const dbName = `${domain}`;
    if (!email
      || email.length < 1
      || !domain
      || domain.length < 1
    ) return res.sendStatus(500);
    console.log("dbName", dbName);
  try {
    // Connect to MongoDB
    const connection = createDatabaseConnection(dbName)
    if (!connection) return res.sendStatus(500);
    console.log(`Connected to Database: ${dbName}`);
    req.databaseConnection = connection
    next();

  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", status: false });
  }
};

// dbConnectionMiddleware
module.exports.dbConnectionMiddleware = async (req, res, next) => {
  try {
    const dbName = req.query.companyPrefix || req.body.companyPrefix || req.body.tenantId || req.query.tenantId
    if (!dbName) return res.status(400).json({ msg: "Company prefix not provided", status: false });
    
    // Connect to MongoDB
    const connection = createDatabaseConnection(dbName)
    if (!connection) return res.sendStatus(500);
    console.log(`Connected to Database: ${dbName}`);
    req.databaseConnection = connection
    next();

  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", status: false });
  };
};






