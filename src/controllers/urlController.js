

var validUrl = require('valid-url');
const urlModel = require("../models/urlModel");
const { exists } = require("../models/urlModel");

//------------------------------------- Redis Connection--------------------------------------------------------

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    16851,
  "redis-16851.c12.us-east-1-4.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("syIZhPb6h5RKOhrvAQgoGJrzrNTWjeAs", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//---------------------------Validation functions-----------------------------------------------------------
const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//---------------------------------------------------------------------------------------------------------

const shortenUrl=async function(req,res){
    try{
        if(!isValidRequestBody(req.body)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide blog details'})
        }
        let {longUrl}=req.body;
        

        if(!isValid(longUrl)) {
            return res.status(400).send({status: false, message: 'Blog body is required'})
            
        }
        //we will trim the link here if any one has passed it with spaces ,to validate its structure

        if(!/(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/.test(longUrl)) {
            res.status(400).send({status: false, message: `logoLink is not a valid URL`})
            return
        }

        let data=await urlModel.findOne({longUrl})
        if(data){
            res.status(302).send({msg:"shorturl for this already exists",shortUrl:data.shortUrl})
            return
        }
        let urlCode=(Math.random() + 1).toString(36).substring(7);
        let baseUrl="http://localhost:3000/"
        let shortUrl=baseUrl+urlCode;

        let obj={longUrl,shortUrl,urlCode}
        let savedData=await urlModel.create(obj)
        
        res.status(200).send({data:obj})
    }
    catch(err){
        res.status(500).send({status:false,data:err})
        console.log(err)
    }
}
module.exports.shortenUrl=shortenUrl




const getUrl = async function(req,res){
try{
   if(!isValid(req.params.urlCode)){
   return res.status(400).send({status:false,messege:"urlCode is not valid"})

   }

   let UrlFromCache = await GET_ASYNC(`${req.params.urlCode}`)

   if(UrlFromCache){
       let data=JSON.parse(UrlFromCache)
       res.status(200).redirect(data.longUrl)
        // res.send({url:data.longUrl})
       
   }else{
       
    let urlData = await urlModel.findOne({urlCode:req.params.urlCode})
    if(urlData){
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(urlData))
        res.status(200).redirect(urlData.longUrl)
    }else{
        res.status(400).send({status:false,msg:"longUrl is not found for given urlCode"})
    }
}
}
catch(error){
    console.log(error)
    return res.status(500).send({status: false,msg: error.message})
}    
}
module.exports.getUrl=getUrl







