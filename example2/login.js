const axiosLib = require('axios');
const fs = require("fs");
const querystring = require('querystring');

//configure axios, https://axios-http.com/docs/intro
let axios = axiosLib.create({
    baseURL:'https://a.cms.omniupdate.com/', //allows for relative paths
    timeout: 60000,//60000ms or 10mins
    maxContentLength: 152428890,//allows for controlling
    maxBodyLength: 152428890,
    validateStatus: function (status) {return true}//axios throws an error for non 200 error codes.
});


//get login credentials
let creds = require("../secureplace/creds.js");
//example format
//let creds = {
//  username: '',
//  password: '',
//  skin: '',
//  account: '',
//  site:''
//}

//authenticators that we will use with the api. 
var token = "";//used to authenticate the most requests.
var cookie = "";//needed to logout. /authoriaztion/* endpoints do not accept the token. 

//Running the functions
(async () => {
  await omniLogin();
  await omniLogout();
})();

//----example functions------
async function omniLogin(skin,account,username,password){
    //Define the parameters
    // We will be using the creds object directly

    //Format the request
    let request = {
      url: '/authentication/login',
      method: 'post',
      headers:{
        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
      },
      data: new URLSearchParams(creds)
    }
    
    //Send the request
    var loggedin = await axios(request);

    //Work with the response
    console.log("User connected? : ",loggedin.status);
    writeResponse(`login.json`,loggedin.data)

    

  
    if(loggedin.status === 200){
      token = loggedin.data.gadget_token;
      cookie = loggedin.headers["set-cookie"];
      return
    }
    else{
      console.log(loggedin.data);
      return
    }
}

async function omniLogout(){
  //Define the parameters
  // no params
  
  //Format the request
    let request = {
      url: '/authentication/logout',
      method: 'post',
      headers:{
        "Cookie":cookie
      },
      data: {}
    }
    
    //Send the request
    var response = await axios(request);

    //Work with the response
    console.log("Logout successful? : ",response.status);
}

//helpers

function writeResponse(path,data){
  fs.writeFileSync(`report-${path}`, JSON.stringify(data,null, 2));

}









