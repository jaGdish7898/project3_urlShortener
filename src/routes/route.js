const express = require('express');
const router = express.Router();


let urlController=require("../controllers/urlController")

//Apis
//1)to create short url
router.post("/url/shorten",urlController.shortenUrl)
//2) to redirect to original url
router.get("/:urlCode",urlController.getUrl)













module.exports = router;