async function main() {
    try {
        const loginRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/auth/login", {
           method: 'POST', headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({email: "test1234@test.com", password: "password123"})
        });
        const data = await loginRes.json();
        const token = data.data.token;
        const workspaceId = data.data.workspaces[0].id;
        const opts = { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token} };
        
        const catId = 79;
        const benId = 26;
        const cuentaId = 72;

        const payload = { monto: 1, categoriaId: catId, beneficiarioId: benId, tipo: 'GASTO', fecha: '2026-03-20', workspaceId, medioPago: 'TRANSFERENCIA' };

        // Test 1: nested routes
        let tRes = await fetch(`https://finanzas-api.ubunifusoft.digital/api/cuentas/${cuentaId}/transacciones`, { ...opts, body: JSON.stringify(payload) });
        console.log("Ruta anidada ES:", tRes.status);

        tRes = await fetch(`https://finanzas-api.ubunifusoft.digital/api/cuentas/${cuentaId}/transactions`, { ...opts, body: JSON.stringify(payload) });
        console.log("Ruta anidada EN:", tRes.status);

    } catch (err) { console.log(err) }
 }
 main();
