async function fetchSwagger() {
    try {
        const url = "https://finanzas-api.ubunifusoft.digital/v3/api-docs";
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const schemas = data.components?.schemas || {};
            console.log("== Esquema de TransaccionDTO ==");
            console.log(JSON.stringify(schemas['TransaccionDTO'], null, 2));
            console.log("== Esquema de Transacciones ==");
            console.log(JSON.stringify(schemas['TransaccionRequest'] || schemas['CrearTransaccionRequest'] || schemas['Transaccion'], null, 2));
            
            // Buscar cualquier esquema que tenga la palabra transaccion
            const allKeys = Object.keys(schemas).filter(k => k.toLowerCase().includes('transaccion'));
            console.log("Esquemas encontrados:", allKeys);
            
            if (allKeys.length > 0) {
                console.log("== Primer esquema encontrado ==");
                console.log(JSON.stringify(schemas[allKeys[0]], null, 2));
            }
        } else {
            console.log("Error HTTP:", res.status);
            // Intenta el v2 if v3 fails
            const res2 = await fetch("https://finanzas-api.ubunifusoft.digital/v2/api-docs");
            if (res2.ok) {
                const data2 = await res2.json();
                console.log("v2 definitions:", Object.keys(data2.definitions || {}).filter(k => k.toLowerCase().includes('transaccion')));
                console.log(JSON.stringify(data2.definitions['TransaccionDTO'], null, 2));
            }
        }
    } catch(e) { console.error(e) }
}
fetchSwagger();
