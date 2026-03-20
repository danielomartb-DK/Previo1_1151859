async function test() {
    try {
        const loginRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/auth/login", {
           method: 'POST', headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({email: "test1234@test.com", password: "password123"})
        });
        const data = await loginRes.json();
        const token = data.data.token;
        const workspaceId = data.data.workspaces[0].id;
        const opts = { method: 'GET', headers: {'Authorization': 'Bearer ' + token} };
        
        const cRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/categorias?workspaceId=" + workspaceId, opts);
        const cats = await cRes.json();
        console.log("Categorias Query Param:", JSON.stringify(cats, null, 2));

        const bRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/beneficiarios?workspaceId=" + workspaceId, opts);
        console.log("Beneficiarios:", (await bRes.json()).status);
        
        const tRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions?workspaceId=" + workspaceId, opts);
        console.log("Transactions:", (await tRes.json()).status);
    } catch (err) { console.log(err) }
 }
 test();
