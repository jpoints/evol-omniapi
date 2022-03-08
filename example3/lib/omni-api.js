const Axios = require('axios');
const fs = require("fs");
const FormData = require('form-data');
//uncomment if you have an invalid ssl certificate
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

class OMNIAPI {

    constructor(params) {
        this.host = params.host;
        this.skin = params.skin;
        this.account = params.account;
        this.site = params.site;
        this.username = params.username;
        this.password = params.password;
        this.token = "";
        this.cookie = "";
        this.log = []
        this.axios = Axios.create({
          baseURL:`https://${this.host}`,
          timeout: 60000,
          maxContentLength: 152428890,
          maxBodyLength: 152428890,
          validateStatus: function (status) {return true}//axios throws an error for non 200 error codes.
        });
    }

    async login(){
        //Define the parameters
        let params = {
            "skin":this.skin,
            "account":this.account,
            "username":this.username,
            "password":this.password
        }
    
        //Format the request
        let request = {
          url: '/authentication/login',
          method: 'post',
          headers:{
            "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
          },
          data: new URLSearchParams(params).toString()
        }
        
        //Send the request
        var response = await this.axios(request);
    
        //Work with the response
        console.log("User connected? : ",response.status);
        this.handleResponse({url:request.url,method:request.method,headers:request.method,data:params},response);

        //Store token is successful
        if(response.status === 200){
          this.token = response.data.gadget_token;
        }
        else{
          console.log("Error", response.data);
        }
        return response
    }

    async logout(){
        let request = {
            url: '/authentication/logout',
            method: 'post',
            headers:{
              "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
              "Cookie":this.cookie
            },
            data: {}
          }
          
          //Send the request
          var response = await this.axios(request);
      
          //Work with the response
          this.handleResponse(request,response);
          return response
    }

    async get(url,data){
        //Define the parameters
        let params = this.defaultData(data,"rpc");

        //Format the request
        let request = {
            url: `${url}?${new URLSearchParams(params)}`,
            method: 'get',
            headers:{
                "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
            },
            data: ""
        }

        //Send the request
        let response = await this.axios(request);

        //Work with the response
        this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);
        return response
    }

    async get_rs(url,data){
           //Define the parameters
           let params = this.defaultData(data);

           //Format the request
           let request = {
                url: `${url}?${new URLSearchParams(params)}`,
               method: 'get',
               headers:{
                   "Content-Type":"application/json",
                   "X-Auth-Token" : this.token
               },
               data: {}
           }
   
           //Send the request
           let response = await this.axios(request);
   
           //Work with the response
           this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);

           return response
    }

    async post(url,data){
         //Define the parameters
         let params = this.defaultData(data,"rpc");

         //Format the request
         let request = {
             url: `${url}`,
             method: 'post',
             headers:{
                "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"
             },
             data: new URLSearchParams(params)
         }
 
         //Send the request
         let response = await this.axios(request);
 
         //Work with the response
         this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);
         return response
    }

    async post_rs(url,data){
         //Define the parameters
         let params = this.defaultData(data);

         //Format the request
         let request = {
              url: `${url}`,
             method: 'post',
             headers:{
                 "Content-Type":"application/json",
                 "X-Auth-Token" : this.token
             },
             data: params
         }
 
         //Send the request
         let response = await this.axios(request);
 
         //Work with the response
         this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);

         return response
    }

    async post_rs_text(url,text){
        //Define the parameters

        //Format the request
        let request = {
             url: `${url}`,
            method: 'post',
            headers:{
                "Content-Type":"text/plain",
                "X-Auth-Token" : this.token
            },
            data: params
        }

        //Send the request
        let response = await this.axios(request);

        //Work with the response
        this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);

        return response
    }

    async put(){}

    async put_rs(url,data){
           //Define the parameters
           let params = this.defaultData(data);

           //Format the request
           let request = {
                url: `${url}`,
               method: 'put',
               headers:{
                   "Content-Type":"application/json",
                   "X-Auth-Token" : this.token
               },
               data: params
           }
   
           //Send the request
           let response = await this.axios(request);
   
           //Work with the response
           this.handleResponse({url:url,method:request.method,headers:request.method,data:params},response);
  
           return response
    }

    async put_rs_text(){}

    async delete(){}

    async delete_rs(url,data){
          //Define the parameters
          let params = this.defaultData(data);

          //Format the request
          let request = {
               url: `${url}`,
              method: 'delete',
              headers:{
                  "Content-Type":"application/json",
                  "X-Auth-Token" : this.token
              },
              data: params
          }
  
          //Send the request
          let response = await this.axios(request);
  
          //Work with the response
          this.handleResponse({url:url,method:request.method,headers:request.headers,data:params},response);
 
          return response
    }

    async upload_file(url,data){
        const form = new FormData();
        let params = this.defaultData(data);
        form.append(params.name, fs.createReadStream(params.filepath,{filename: 'upload.zip'}));
        let headers = form.getHeaders();
        headers["Cookie"] = this.cookie;
        let response = await this.axios.post(`${url}${params ? '?' : ''}${ new URLSearchParams(params)}`, form, { headers: headers});
        params.url = url;

        this.handleResponse({url:url,method:"post-upload",headers:headers,data:params},response);

        return response
    }

    async upload_image(url,data){
        let params = this.defaultData(data);
        params.filename = params.name;
        params.data = await fs.readFileSync(params.filepath,{ encoding: 'base64' });
        let headers = {}
        headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
        headers["Cookie"] = this.cookie;
        let form = new URLSearchParams(params)
        let response = await this.axios.post(`${url}`, form, {headers: headers});
        this.handleResponse({url:url,method:"post-upload-image",headers:headers,data:params},response);
        return response
    }

    async wait_for_worker(workerkey,maxSecs,failwait){
        var self = this
        var finished = false
        var notfound = 0
        var totalTries = 3
        var retries = 0
        var error = false
        var response = {}
        var status = {}
        var seconds = 1000;
        var failwait = 10000 || failwait
        var maxSeconds = maxSecs || 1200000;
        while(!finished && !error && !(seconds >= maxSeconds)){
            await self.sleep(1000);//each iteration will take one second
            response = await self.get("workers/status",{key:workerkey});
            if(response.status === 200){
              status = this.tryJson(response.data);
    
              error = status.error
    
              var log = {
                finished:status.finished,
                success_count:status.success_count,
                failed_count:status.failed_count,
                seconds:seconds/1000
              }
    
              //check if the worked has finished
              if(status.finished){
               finished = status.finished
              }
              else if(status.success && status.success[0]){
                finished = true
              }
    
              seconds = seconds + 1000
              console.log(JSON.stringify(log));
            }
            else{
              retries = retries + 1;
              console.log(`Failed: retry ${retries} of ${totalTries}`);
              if(retries >= totalTries){
                finished = true
                error = true
             }
            }
        }
        if(error){
          console.log(`worker misbehaving, waiting ${failwait /1000} seconds`);
          await self.sleep(failwait);
        }
        if(seconds >= maxSeconds){
          console.log(`Worker took longer than ${maxSeconds}secs to complete, moving on`);
        }
        return status
      }

//helpers
    defaultData(data,type){
        data = data || {}

        data.site = data.site || this.site
        data.account = data.account || this.account

        if(type === "rpc"){
            data.authorization_token = this.token
        }

        if(data.site === "ignore"){
            delete data.site
        }

        if(data.account === "ignore"){
            delete data.account
        }

        return data
    }

    handleResponse(request,response){
        console.log(response.status,"",request.method,": ",request.url);

        //update cookie if needed
        if(response.headers["set-cookie"]){
            console.log("----new api cookie----");
            this.cookie = response.headers["set-cookie"][0]
        }

        //add request to report
        let report = {
            "request":request,
            "response":{
                status:response.status,
                data:response.data,
                headers:response.headers
            }
        }
        this.log.push(report);
        
        if(`${response.status}`.startsWith('2')){
            //do nothing, but may do something later.
        }
        else{
            console.log("Error : ",response.data,response.headers["x-reason"]);
        }
    }

    report(path){
        path = path || "log.json"
        fs.writeFileSync(`./${path}`, JSON.stringify(this.log,null, 2));
    }

    tryJson(text){
        try { return JSON.parse(text);}
        catch(e) { return text
        }
    }

    sleep (ms = 0) {
        return new Promise(r => setTimeout(r, ms));
    }

}

module.exports = OMNIAPI;