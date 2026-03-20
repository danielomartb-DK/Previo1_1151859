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
        
        const catRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/categorias", { ...opts, body: JSON.stringify({nombre: "🍔 Comida", tipo: "GASTO", workspaceId: workspaceId}) });
        const cData = await catRes.json();
        
        const benRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/beneficiarios", { ...opts, body: JSON.stringify({nombre: "El Tio Sam", workspaceId: workspaceId}) });
        const bData = await benRes.json();
        
        // Asumiendo que cData y bData devuelven el objeto creado con su ID en res.data
        const catId = cData.data ? cData.data.id : null;
        const benId = bData.data ? bData.data.id : null;
        
        if (catId && benId) {
            const tRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", { 
                ...opts, 
                body: JSON.stringify({
                    monto: 100, categoriaId: catId, beneficiarioId: benId, tipo: 'GASTO', fecha: '2026-03-20', descripcion: 'Test EFECTIVO', 
                    workspaceId: workspaceId,
                    medioPago: 'EFECTIVO'
                }) 
            });
            const tData = await tRes.json();
            console.log("Transaction con EFECTIVO:");
            console.log(JSON.stringify(tData, null, 2));

            const tRes2 = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", { 
                ...opts, 
                body: JSON.stringify({
                    monto: 100, categoriaId: catId, beneficiarioId: benId, tipo: 'GASTO', fecha: '2026-03-20', descripcion: 'Test TRANSFERENCIA', 
                    workspaceId: workspaceId,
                    medioPago: 'TRANSFERENCIA'
                }) 
            });
            const tData2 = await tRes2.json();
            console.log("Transaction con TRANSFERENCIA:");
            console.log(JSON.stringify(tData2, null, 2));
        } else {
            console.log("No pude crear categoria o beneficiario");
        }
    } catch (err) { console.log(err) }
 }
 test();
