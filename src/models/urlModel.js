const mongoose=require('mongoose')
const validator=require('validator');

const urlSchema=new mongoose.Schema({
    urlCode:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        
    },
    longUrl:{
        type:String,
        required:true,
        validate:{
            validator:validator.isURL,
            message:'{VALUE} is not a valid email',         
            isAsync:false,
            trim:true
        }
        
    },
    shortUrl:{
        type:String,
        required:true,
        unique:true
    },
    
}, {timestamps: true} )



module.exports=mongoose.model("P3_urlshorten",urlSchema)  
//type: String,

