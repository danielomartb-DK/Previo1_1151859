async function scan() {
    try {
        const loginRes = await fetch("https://finanzas-api.ubunifusoft.digital/api/auth/login", {
           method: 'POST', headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({email: "test1234@test.com", password: "password123"})
        });
        const data = await loginRes.json();
        const token = data.data.token;
        const opts = { method: 'GET', headers: {'Authorization': 'Bearer ' + token} };
        
        console.log("Iniciando escaneo de transacciones en la red...");
        
        let foundAny = false;
        // Escanear workspaces del 1 al 50
        for (let i = 1; i <= 50; i++) {
            const url = `https://finanzas-api.ubunifusoft.digital/api/transactions?workspaceId=${i}`;
            const res = await fetch(url, opts);
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    console.log(`\n✅ ¡TRANSACCIONES ENCONTRADAS EN WORKSPACE ${i}!`);
                    console.log(JSON.stringify(json.data[0], null, 2));
                    foundAny = true;
                    break; // Solo necesitamos ver 1 exitosa
                }
            }
        }
        
        if (!foundAny) {
            console.log("No se encontraron transacciones en los primeros 50 workspaces.");
        }
    } catch (err) { console.log(err) }
 }
 scan();
