async function test() {
    try {
        const url1 = "https://finanzas-api.ubunifusoft.digital/v3/api-docs";
        const res = await fetch(url1);
        if (res.ok) {
            const data = await res.json();
            const schemas = data.components?.schemas || {};
            console.log("Transaccion Schema:", JSON.stringify(schemas['TransaccionDTO'], null, 2));
            console.log("CrearTransaccionRequest Schema:", JSON.stringify(schemas['CrearTransaccionRequest'], null, 2));
        } else {
            console.log("v3 falló");
        }
    } catch(e) { console.error(e) }
}
test();
