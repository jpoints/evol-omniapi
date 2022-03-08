const Axios = require('axios');
const fs = require("fs");

//configure axios
//https://axios-http.com/docs/intro
const axios = Axios.create();

//Running the functions
  getData("https://moderncampus.com/", "content.html");

//example functions
  async function getData(url,path){
    let request = {
        url: url,
        method: 'get',
        headers:{},
        data:{}
    }
    let response = await axios(request);
    console.log(request.url, "", response.status);
    //console.log(response.data);
    fs.writeFileSync(`./${path}`, response.data);
}

  

