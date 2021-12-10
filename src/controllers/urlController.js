
const AuthorModel = require("../models/blogModel")
var validUrl = require('valid-url');
const urlModel = require("../models/urlModel");
const { exists } = require("../models/urlModel");


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
        if(!(/(.com|.org|.co.in|.in)/.test(longUrl))){
            return res.Status(400).send({status:false,msg:"Url is not valid"})
        }
        if((longUrl.includes("https://") && longUrl.match(/https:\/\//g).length!==1)||(longUrl.includes("http://") && longUrl.match(/http:\/\//g).length!==1) || (longUrl.includes("ftp://") && longUrl.match(/ftp:\/\//g).length!==1))
        return res.status(400).send({status:false,msg:"Url is not valid"})
        
        if(longUrl.includes("w")&&(longUrl.indexOf("w")===6||longUrl.indexOf("w")===7||longUrl.indexOf("w")===8)){
            let arr=[];
            longUrl=longUrl.trim()
            let i=longUrl.indexOf("w");
            while(longUrl[i]=="w"){
                if(longUrl[i]==="w"){
                arr.push(longUrl[i])
            }
            i++
        }
        if(!(arr.length===3)) 
        return res.status(400).send({status:false,msg:"Url is not valid"})
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
   let urlData = await urlModel.findOne({urlCode:req.params.urlCode})
    if(!isValid(urlData.longUrl)){
       return res.status(400).send({status:false,messege:"longUrl in db for given urlCode is not valid"})
    }
    res.status(200).redirect(urlData.longUrl)

}
catch(error){
    return res.status(500).send({status: false,msg: error.message})
}    
}
module.exports.getUrl=getUrl







