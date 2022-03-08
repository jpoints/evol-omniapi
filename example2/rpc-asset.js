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
let token = "";//used to authenticate the most requests.
let cookie = "";//needed to logout. /authoriaztion/* endpoints do not accept the token. 
let log = [];//

//Running the functions
//This will create an asset, view it, and delete it
(async () => {
  await omniLogin();

  //legacy Apis
  await getAssetsList("/");

  let assetData = {
    "name": "test",
    "description": "test description",
    "group": "Everyone",
    "readers": "Everyone",
    "content": "this is a test",
    "site_locked": false,
    "site": creds.site,
    "type": 2,
    "tags": "test"
  }
  let asset = await createAsset(assetData);
  await getAsset(asset.asset);
  await deleteAsset(asset.asset);
  await getAsset(asset.asset);//this will fail, it no longer exist

  await omniLogout();
  
  await getAssetsList();//this will throw a 401 error, we are logged out.
  writeResponse();
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
    log.push(loggedin.data);

    

  
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

// legacy apis
async function getAssetsList(path){

  //Define the parameters
  let params = {
    site:creds.site,
    path:"/OMNI-ASSETS",
    count:100,
    start:0,
    sort_key:"name",
    sort_order:"asc",
    ignore_readers:false,
    "authorization_token":token
  }

  //Format the request
  let request = {
    url: `/assets/list?${new URLSearchParams(params)}`,
    method: 'get',
    headers:{
      "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: {}
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Asset List: ",response.status);
  
  if(response.status === 200){
    log.push(response.data);
  }
  else{
    console.log("Error : ",response.data);
  }
}

async function createAsset(data){

  //Define the parameters
  let params = data;
  params["authorization_token"] = token;

  //Format the request
  let request = {
    url: `/assets/new`,
    method: 'post',
    headers:{
      "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: new URLSearchParams(params)
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Create Asset: ",response.status);

  if(response.status === 200){
    log.push(response.data);
    return response.data;
  }
  else{
    console.log("Error : ",response.data);
  }
}

async function getAsset(assetid){
  //Define the parameters
  let params = {
    site:creds.site,
    asset:assetid,
    "authorization_token":token
  }

  //Format the request
  let request = {
    url: `/assets/view?${new URLSearchParams(params)}`,
    method: 'get',
    headers:{
      "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: {}
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Get Asset: ",response.status);
  
  if(response.status === 200){
    log.push(response.data);
    return response.data
  }
  else{
    console.log("Error : ",response.data);
  }
}

async function deleteAsset(assetid){
  //Define the parameters
  let params = {
    site:creds.site,
    asset:assetid,
    "authorization_token":token
  }

  //Format the request
  let request = {
    url: `/assets/delete`,
    method: 'post',
    headers:{
      "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: new URLSearchParams(params)
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Delete Asset: ",response.status);

  if(response.status === 200){
    log.push(response.data);
    return response.data
  }
  else{
    console.log("Error : ",response.data);
    return response.data
  }
}

//helpers

function writeResponse(){
  fs.writeFileSync(`report-rpc.json`, JSON.stringify(log,null, 2));

}









