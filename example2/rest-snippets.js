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
let log = []; //this will store the response data

//Running the functions
//This will create an snippet, view it, edit it, and delete it
(async () => {
  await omniLogin();

//REST Apis
  await getSnippetsList();
  let snippetData = {
    category:"Test",
    name:"test",
    group:"Everyone",
    sites:[creds.site],
    content:"This is the snippet content",
    description:"This is my desc"
  }
  await createSnippet(snippetData);
  await getSnippet("test");
  await deleteSnippet("test");
  await getSnippet("test");//this will fail, it no longer exist

  await omniLogout();
  await getSnippetsList();//this will throw a 401 error, we are logged out.

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
    log.push([loggedin.headers,loggedin.data]);

    

  
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

// rest apis
async function getSnippetsList(){

  //Define the parameters
  let params = {
      start:0,
      sort:"name",
      desc:false,
      size:999,
      filter:"",
      size:999,
      site:creds.site
  }

  //Format the request
  let request = {
    url: `/rs/snippets`,
    method: 'get',
    headers:{
      "Content-Type":"application/json",
      "X-Auth-Token" : token
    },
    data: params
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Get Snippets",response.status);
  
  if(response.status === 200){
    log.push([response.headers,response.data]);
  }
  else{
    console.log("Error : ",response.headers['x-reason']);
  }
}


async function createSnippet(data){
 //Define the parameters
  let params = data;

  //Format the request
  let request = {
    url: `/rs/snippets`,
    method: 'post',
    headers:{
      "Content-Type":"application/json",
      "X-Auth-Token" : token
    },
    data: params
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Create Snippet",response.status);
  
  if(response.status === 201){
    log.push([response.headers,response.data]);
    return response.data;
  }
  else{
    console.log("Error : ",response.headers["x-reason"]);
  }
}

async function getSnippet(name){
    //Define the parameters
    let params = {
      sites:creds.site
  }

  let category = "Test";

  //Format the request
  let request = {
    url: `/rs/snippets/${category}/${name}?${new URLSearchParams(params)}`,
    method: 'get',
    headers:{
      "X-Auth-Token" : token
    },
    data: ""
  }

  //Send the request
  let response = await axios(request);

  //Work with the response
  console.log("Get Snippet",response.status);

  if(response.status === 200){
    log.push([response.headers,response.data]);
    return response.data
  }
  else{
    console.log("Error : ",response.headers['x-reason']);
  }
}

async function deleteSnippet(name){
      //Define the parameters
      let params = {
        category:"Test",
        name:name
    }
  
    //Format the request
    let request = {
      url: `/rs/snippets/${params.category}/${params.name}`,
      method: 'delete',
      headers:{
        "Content-Type":"application/json",
        "X-Auth-Token" : token
      },
      data: params
    }

   
  
    //Send the request
    let response = await axios(request);
  
    //Work with the response
    console.log("Delete Snippet",response.status);
  
    if(response.status === 204){
      log.push([response.headers,response.data]);
      return response.data
    }
    else{
      console.log("Error : ",response.data);
    }
}

//helpers

function writeResponse(){
  fs.writeFileSync(`report-rest.json`, JSON.stringify(log,null, 2));
}









