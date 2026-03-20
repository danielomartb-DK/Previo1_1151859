async function test() {
   try {
       const loginRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/auth/login", {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: "test1234@test.com", password: "password123"})
       });
       const data = await loginRes.json();
       const token = data.data.token;
       const workspaceId = data.data.workspaces[0].id;
       const opts = { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}, body: JSON.stringify({workspaceId: workspaceId}) };
       
       const cRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/categorias", opts);
       console.log("Cat Err:", (await cRes.json()).mensaje);

       const bRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/beneficiarios", opts);
       console.log("Ben Err:", (await bRes.json()).mensaje);
       
       const tRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", opts);
       console.log("Tra Err:", (await tRes.json()).mensaje);
   } catch (err) { }
}
test();
