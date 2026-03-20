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

        const baseKeys = ['cuenta', 'billetera', 'origen', 'fuente', 'pago', 'banco', 'bancaria', 'destino', 'tarjeta', 'credito', 'account', 'source', 'wallet', 'bank'];
        const prefixes = ['', 'id', 'id_'];
        const suffixes = ['', 'Id', '_id', 'ID'];
        
        let allKeys = [];
        for (let base of baseKeys) {
            for (let pre of prefixes) {
                for (let suf of suffixes) {
                    allKeys.push(pre + base + suf);
                    allKeys.push(pre + base.charAt(0).toUpperCase() + base.slice(1) + suf);
                }
            }
        }
        
        // Agregar algunas hardcoded compuestas
        allKeys.push('fuentePagoId', 'fuente_pago_id', 'idFuentePago', 'id_fuente_pago');
        allKeys.push('cuentaBancariaId', 'cuenta_bancaria_id', 'idCuentaBancaria');
        allKeys.push('tarjetaCreditoId', 'tarjeta_credito_id', 'idTarjetaCredito');
        allKeys.push('cuentaOrigenId', 'cuenta_origen_id');
        
        // Limpiar unicos
        allKeys = [...new Set(allKeys)];
        console.log(`Verificando ${allKeys.length} combinaciones posibles...`);

        async function testKeys(keys) {
            let payload = { monto: 1, categoriaId: catId, beneficiarioId: benId, tipo: 'GASTO', fecha: '2026-03-20', workspaceId, medioPago: 'TRANSFERENCIA' };
            // Llenar el payload con TODAS las llaves del lote asignando cuentaId
            keys.forEach(k => payload[k] = cuentaId);
            
            // Caso especial de cuenta objeto anidado (lo añadimos explícitamente si está en este lote)
            if (keys.includes('cuenta')) payload['cuenta'] = { id: cuentaId };
            if (keys.includes('fuentePago')) payload['fuentePago'] = { id: cuentaId };
            
            const res = await fetch("https://finanzas-api.ubunifusoft.digital/api/transactions", { ...opts, body: JSON.stringify(payload) });
            return res.status === 201;
        }

        // Test global
        if (!await testKeys(allKeys)) {
            console.log("❌ NINGUNA de las 400 combinaciones funcionó. El fallo no es de mapeo de variables simples.");
            return;
        }
        console.log("✅ EL GLOBAL FUNCIONA! Iniciando búsqueda binaria...");

        // Busqueda binaria aislando el subset exitoso
        let subset1 = allKeys.slice(0, Math.floor(allKeys.length / 2));
        let subset2 = allKeys.slice(Math.floor(allKeys.length / 2));
        let activeSubset = await testKeys(subset1) ? subset1 : subset2;
        
        while (activeSubset.length > 1) {
            const left = activeSubset.slice(0, Math.floor(activeSubset.length / 2));
            const right = activeSubset.slice(Math.floor(activeSubset.length / 2));
            if (await testKeys(left)) {
                activeSubset = left;
            } else {
                activeSubset = right;
            }
        }
        
        console.log(`\n🎉 LA LLAVE EXACTA Y CORRECTA ES:\n ======> '${activeSubset[0]}' <======`);
        
    } catch (err) { console.log(err) }
 }
 main();
