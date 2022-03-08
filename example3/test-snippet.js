const OMNIAPI = require("./lib/omni-api.js");
const creds = require("../secureplace/creds.js");
creds.host = "a.cms.omniupdate.com";


let omniapi = new OMNIAPI(creds);

(async () => {
    await omniapi.login();

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

    current.data.content = "Updated content"
    
    await omniapi.put_rs(`/rs/snippets/${snippet.category}/${snippet.name}`,current.data);
    await omniapi.delete_rs(`/rs/snippets/${snippet.category}/${snippet.name}`);

    await omniapi.logout();
    omniapi.report('report-snippet.json');
})();