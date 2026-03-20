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
        
        const catId = 79;
        const benId = 26;
        const cuentaId = 72;

        const propertyNames = [
            "cuentaId", "idCuenta", "cuenta_id", "cuentaBancariaId", "fuentePagoId", "cuenta", "accountId", "cuentaOrigenId"
        ];

        for (const prop of propertyNames) {
            console.log(`\nProbando KEY: ${prop}`);
            const payload = { monto: 1, categoriaId: catId, beneficiarioId: benId, tipo: 'GASTO', fecha: '2026-03-20', workspaceId, medioPago: 'TRANSFERENCIA' };
            
            if (prop === "cuenta") {
                payload[prop] = { id: cuentaId };
            } else {
                payload[prop] = cuentaId;
            }

            const tRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", { ...opts, body: JSON.stringify(payload) });
            const tJson = await tRes.json();
            
            if (tRes.status === 201) {
                console.log(`✅ EXITO ENCONTRADO! LLAVE: ${prop}`);
            } else {
                const isCheckConstraint = String(tJson.mensaje).includes('ck_fuente_pago');
                if (isCheckConstraint) {
                    console.log(`❌ FALLÓ con ck_fuente_pago (null insertado)`);
                } else {
                    console.log(`⚠️ ERROR DIFERENTE ENCONTRADO PARA ${prop}!!!`);
                    console.log(tJson.mensaje);
                }
            }
        }
    } catch (err) { console.log(err) }
 }
 test();
