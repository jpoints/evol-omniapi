const OMNIAPI = require("./lib/omni-api.js");
const creds = require("../secureplace/creds.js");
creds.host = "a.cms.omniupdate.com";


let omniapi = new OMNIAPI(creds);

(async () => {
    await omniapi.login();
   
    let publish = await omniapi.post("/sites/publish",{});
    await omniapi.wait_for_worker(publish.data.key);

    await omniapi.logout();
    omniapi.report('report-sitepub.json');
})();