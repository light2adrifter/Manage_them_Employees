const db = require('./db/connection');
const inquirer = require("inquirer");
const { promptUser } = require('./utils/functions');

// Start server after DB connection
db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    promptUser();
});