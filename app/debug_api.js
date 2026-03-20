async function test() {
    try {
        const loginRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/auth/login", {
           method: 'POST', headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({email: "test1234@test.com", password: "password123"})
        });
        const data = await loginRes.json();
        const token = data.data.token;
        const workspaceId = data.data.workspaces[0].id;
        
        const opts = { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token} };
        
        await fetch("https://finanzas-api.ubunifusoft.digital/api/categorias", { ...opts, body: JSON.stringify({nombre: "🍔 Comida", tipo: "GASTO", workspaceId: workspaceId}) });
        await fetch("https://finanzas-api.ubunifusoft.digital/api/beneficiarios", { ...opts, body: JSON.stringify({nombre: "El Tio Sam", workspaceId: workspaceId}) });
        
        const getOpts = { method: 'GET', headers: {'Authorization': 'Bearer ' + token} };
        
        const bRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/beneficiarios?workspaceId=" + workspaceId, getOpts);
        const bData = await bRes.json();
        console.log("Beneficiarios FULL:", JSON.stringify(bData.data, null, 2));

        const cRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/categorias?workspaceId=" + workspaceId, getOpts);
        const cData = await cRes.json();
        console.log("Categorias FULL:", JSON.stringify(cData.data, null, 2));
    } catch (err) { console.log(err) }
 }
 test();
