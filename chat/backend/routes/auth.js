const { login,register, getAllUsers, logOut,checkUniqueFields} = require("../controllers/userController");
const { saveCustomer , userWithLastMsg} = require("../controllers/customerController");
const { saveConversation , allConversations  , chatHistory , updateinquiryType } = require("../controllers/conversationController");
const { retrieveColors ,  saveColors } = require("../controllers/chatColorsController");
const { trainRasaBot , startRasaActions , startRasaServer , addTrainingData, stopRasaServer } = require("../controllers/rasaController");
const {LoginMultiTenant , dbConnectionMiddleware , retrieveColorsMiddleware } = require('../utils/multitenancy.js')



const router = require("express").Router();

// uesr routers 
router.post("/login",  LoginMultiTenant, login);
router.post("/register", dbConnectionMiddleware ,register);
router.get("/logout/:id", logOut);

// customer router
router.post("/savecustomer",dbConnectionMiddleware, saveCustomer);
router.post("/checkUniqueFields" , dbConnectionMiddleware , checkUniqueFields);

// conversation routers
router.post("/saveconversation",dbConnectionMiddleware , saveConversation);
router.get("/allconversations",dbConnectionMiddleware, allConversations);
router.get("/chat-history", dbConnectionMiddleware , chatHistory);
router.get("/users-with-last-message",dbConnectionMiddleware, userWithLastMsg);


// chat colors routers
router.get("/retrievecolors", dbConnectionMiddleware , retrieveColors);
router.post("/savecolors", dbConnectionMiddleware ,  saveColors);

// rasa bot routers
router.post("/train-rasa-bot", trainRasaBot);
router.post("/start-rasa-actions-server", startRasaActions);
router.post("/start-rasa-server", startRasaServer);
router.post("/add-training-data", addTrainingData);
router.post("/stop-rasa-server", stopRasaServer);


module.exports = router;
