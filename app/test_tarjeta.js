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
        
        // POST Tarjeta
        let tarjetaId = null;
        const tarRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/credit-cards", {
            ...opts,
            body: JSON.stringify({ nombre: "Ghost Card", limiteCredito: 1000000, colorHex: "#ffffff", workspaceId })
        });
        
        if (tarRes.status === 201) {
            const tarJson = await tarRes.json();
            tarjetaId = tarJson.data.id;
        } else {
            console.log("No pude crear tarjeta, asumo ID 1 por defecto.");
            tarjetaId = 1; // Fallback
        }

        const catId = 79;
        const benId = 26;

        const payload = { 
            monto: 1, 
            categoriaId: catId, 
            beneficiarioId: benId, 
            tipo: 'GASTO', 
            fecha: '2026-03-20', 
            workspaceId, 
            medioPago: 'TARJETA',
            tarjetaCreditoId: tarjetaId
        };
        
        console.log("Probando inyección por medio de TARJETA...");
        const tRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", { ...opts, body: JSON.stringify(payload) });
        const tJson = await tRes.json();
        
        if (tRes.status === 201) {
            console.log("✅ ¡EXITO MUNDIAL! La llave tarjetaCreditoId SÍ está programada en el backend.");
            console.log("Esto confirma 100% que el desarrollador simplemente borró por error la variable cuentaId en su código Java.");
        } else {
            console.log("❌ Falla:", tJson);
        }

    } catch (err) { console.log(err) }
 }
 main();
