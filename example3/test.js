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

    //rs endpoints
    let params = {
        size:3
    }
    await omniapi.get_rs("/rs/snippets",params);

//Create Snippet
    let snippet = {
        category:"Test",
        name:"bob",
        group:"Everyone",
        content:"This is the snippet content",
        description:"This is my desc"
    }
    await omniapi.post_rs("/rs/snippets",snippet);
    let current = await omniapi.get_rs(`/rs/snippets/${snippet.category}/${snippet.name}`);
    response = await omniapi.get_rs(`/rs/snippets/${snippet.category}/${snippet.name}/content`);
    console.log(response.data);
    current.data.content = "Updated content"
    
    await omniapi.put_rs(`/rs/snippets/${snippet.category}/${snippet.name}`,current.data);
    response = await omniapi.get_rs(`/rs/snippets/${snippet.category}/${snippet.name}/content`);
    console.log(response.data);

    await omniapi.delete_rs(`/rs/snippets/${snippet.category}/${snippet.name}`);

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

    let publish = await omniapi.post("/files/publish",{path:"/_sidenav.inc",log:"",target:creds.site});
    console.log(publish.data);
    await omniapi.wait_for_worker(publish.data.key);

    //publish = await omniapi.post("/sites/publish",{});
    //console.log(publish.data.key);
    //await omniapi.wait_for_worker(publish.data.key);

    await omniapi.logout();
    omniapi.report('test.json');
})();