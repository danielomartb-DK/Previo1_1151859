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
        
        const payload = {
            nombre: "Billetera Efectivo",
            tipo: "EFECTIVO", 
            saldoInicial: 0,
            workspaceId: parseInt(workspaceId)
        };
        
        const cRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/cuentas", { ...opts, body: JSON.stringify(payload) });
        const cData = await cRes.json();
        console.log("Cuentas POST HTTP Status:", cRes.status);
        console.log("Cuentas POST FULL:", JSON.stringify(cData, null, 2));
    } catch (err) { console.log(err) }
 }
 test();
