const OMNIAPI = require("./lib/omni-api.js");
const creds = require("../secureplace/creds.js");
creds.host = "a.cms.omniupdate.com";


let omniapi = new OMNIAPI(creds);

(async () => {
    await omniapi.login();
    await omniapi.get("/assets/list",{size:3});

    //Create Asset
    let response = await omniapi.post("/assets/new",{
        "name": "test",
        "description": "test description",
        "group": "Everyone",
        "readers": "Everyone",
        "content": "this is a test",
        "site_locked": false,
        "type": 2,
        "tags": "test"
    });
    console.log(response.data);
    let assetid = response.data.asset;
    await omniapi.get("/assets/view",{asset:assetid});
    await omniapi.post("/assets/delete",{asset:assetid});

    await omniapi.logout();
    omniapi.report('report-asset.json');
})();