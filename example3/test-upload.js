const OMNIAPI = require("./lib/omni-api.js");
const creds = require("../secureplace/creds.js");
creds.host = "a.cms.omniupdate.com";


let omniapi = new OMNIAPI(creds);

(async () => {
    await omniapi.login();

//upload image
    params = {
        path:"/",
        overwrite:true,
        access:"Everyone",
        name:"test.html",
        filepath:"./upload/test.html"
    }
    await omniapi.upload_file("/files/upload",params);

    params = {
        path:"/",
        overwrite:true,
        access:"Everyone",
        name:"test.jpg",
        filepath:"./upload/test.jpg"
    }
    await omniapi.upload_image("/files/image_upload",params);

    await omniapi.logout();
    omniapi.report('report-upload.json');
})();