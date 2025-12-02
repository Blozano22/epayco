const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); // Lee PUBLIC_KEY y PRIVATE_KEY desde .env

const app = express();

app.use(cors());            // Permitir peticiones desde React
app.use(express.json());

// 👉 Login directo a ePayco (antes lo hacía PHP)
async function loginEpayco() {
    const publicKey = process.env.VITE_PUBLIC_KEY;
    const privateKey = process.env.VITE_PRIVATE_KEY;

    const auth = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");

    const res = await axios.post(
        "https://apify.epayco.co/login",
        {}, // body vacío
        {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },
        }
    );

    return res.data.token; // { token: "..." }
}

// // 👉 Ruta limpia: /api/create-session  (YA NO TIENE .php)
// app.post("/api/create-session", async (req, res) => {
//     try {
//         // 1. Login para obtener token
//         const token = await loginEpayco();

//         if (!token) {
//             return res.status(500).json({
//                 success: false,
//                 message: "No se pudo obtener token de ePayco",
//             });
//         }

//         // 2. IP del cliente
//         let ip =
//             (req.headers["x-forwarded-for"] &&
//                 req.headers["x-forwarded-for"].split(",")[0].trim()) ||
//             req.socket.remoteAddress ||
//             "";

//         if (ip === "::1" || ip === "127.0.0.1" || !ip) {
//             ip = "201.245.254.45";
//         }

//         // 3. Payload de la sesión (igual que en tu PHP)
//         // const payload = {
//         //     checkout_version: "2",
//         //     name: "Demo Tienda Node",
//         //     description: "Pago de ejemplo con ePayco Smart Checkout",
//         //     currency: "COP",
//         //     amount: 100000,
//         //     country: "CO",
//         //     lang: "ES",
//         //     ip,
//         //     test: true,
//         // };
//         // const payload = {
//         //     test: true,
//         //     ip: "186.83.184.123",

//         //     name: "Smart Checkout Test",
//         //     description: "Pago de prueba ePayco",
//         //     currency: "COP",
//         //     amount: 45000,
//         //     taxBase: 37815,
//         //     tax: 7185,
//         //     taxIco: 0,
//         //     country: "CO",
//         //     lang: "ES",

//         //     // ⬇️ Estos sí se pueden enviar (teléfono correcto)
//         //     phone: "3124567890",
//         //     cellPhone: "3124567890",

//         //     // ⬇️ Billing válido (SIN city y SIN country)
//         //     billing: {
//         //         email: "juan.perez@example.com",
//         //         name: "Juan Pérez",
//         //         address: "Calle 123 # 45 - 67",
//         //         typeDoc: "CC",
//         //         numberDoc: "1032456789",
//         //         callingCode: "+57",
//         //         mobilePhone: "3124567890"
//         //     },

//         //     response: "https://mipagina.com/resultado",
//         //     confirmation: "https://mipagina.com/confirmacion",

//         //     checkout_version: "2"
//         // };


//         const f = req.body; // <-- formulario del front

//         const payload = {
//             test: true,
//             ip,
//             name: `${f.firstName} ${f.lastName}`,
//             description: "Pago de matrícula",
//             currency: "COP",
//             amount: Number(f.amount),
//             country: "CO",
//             lang: "ES",

//             phone: f.phone,
//             cellPhone: f.phone,

//             billing: {
//                 email: f.email,
//                 name: f.firstName + " " + f.lastName,
//                 address: f.address,
//                 typeDoc: f.docType,
//                 numberDoc: f.docNumber,
//                 callingCode: "+57",
//                 mobilePhone: f.phone
//             },

//             response: "https://americana.edu.co",
//             // confirmation: "https://tupagina.com/confirmacion",

//             checkout_version: "2"
//         };

//         // 4. Crear sesión en ePayco
//         const epaycoRes = await axios.post(
//             "https://apify.epayco.co/payment/session/create",
//             payload,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         // Te devuelvo lo que responde ePayco tal cual
//         return res.json(epaycoRes.data);
//     } catch (err) {
//         console.error("🔥 ERROR BACKEND:", err.response?.data || err.message);
//         return res.status(500).json({
//             success: false,
//             message: "Error en create-session",
//             details: err.response?.data || err.message,
//         });
//     }
// });

app.post("/api/create-session", async (req, res) => {
    try {
        // 1️⃣ Login para obtener token (como ya lo tienes)
        const token = await loginEpayco();

        if (!token) {
            return res.status(500).json({
                success: false,
                message: "No se pudo obtener token de ePayco",
            });
        }

        // 2️⃣ IP del cliente
        let ip =
            (req.headers["x-forwarded-for"] &&
                req.headers["x-forwarded-for"].split(",")[0].trim()) ||
            req.socket.remoteAddress ||
            "";

        if (ip === "::1" || ip === "127.0.0.1" || !ip) {
            ip = "201.245.254.45";
        }

        // 3️⃣ Datos que vienen del frontend
        const f = req.body;

        console.log("📥 Datos recibidos del front:", f);

        // 4️⃣ Payload para ePayco Smart Checkout
        const payload = {
            test: true,
            ip,

            // Info básica de la transacción
            name: `${f.firstName} ${f.lastName}`,
            description: f.description || "Pago de matrícula",
            currency: "COP",
            amount: Number(f.amount),
            country: "CO",
            lang: "ES",

            // Referencia / factura
            invoice: String(f.invoice || ""),   // referencia que muestras en el formulario

            // Teléfonos
            phone: f.phone,
            cellPhone: f.phone,

            // Datos de facturación
            billing: {
                email: f.email,
                name: `${f.firstName} ${f.lastName}`,
                address: f.address,
                typeDoc: f.docType,
                numberDoc: f.docNumber,
                callingCode: "+57",
                mobilePhone: f.phone,
            },

            // URLs de retorno (pon luego las definitivas o desde .env)
            response: "https://americana.edu.co",
            // confirmation: "https://americana.edu.co/epayco/confirmacion",

            checkout_version: "2",
        };

        console.log("📤 Enviando payload a ePayco:", payload);

        // 5️⃣ Crear sesión en ePayco
        const epaycoRes = await axios.post(
            "https://apify.epayco.co/payment/session/create",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("📦 Respuesta ePayco:", epaycoRes.data);

        // 6️⃣ Devolver tal cual al frontend
        return res.json(epaycoRes.data);
    } catch (err) {
        console.error("🔥 ERROR BACKEND create-session:", err.response?.data || err.message);

        return res.status(500).json({
            success: false,
            message: "Error en create-session",
            details: err.response?.data || err.message,
        });
    }
});


app.post("/api/verificar", async (req, res) => {
    const { txtID } = req.body;

    if (!txtID) {
        return res.json({
            success: false,
            mensaje: "Debe enviar la referencia"
        });
    }

    try {
        // 1️⃣ URL EXACTA DEL PHP
        const url = `http://190.60.75.134/searches/gou_en_linea.json?periodos=${txtID}`;

        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "Connection": "Keep-Alive"
            },
            timeout: 3000
        });

        const datos = response.data;

        if (!Array.isArray(datos) || datos.length < 1) {
            return res.json({
                success: false,
                mensaje: "Esta referencia no está registrada."
            });
        }

        const row = datos[0];

        //  🟡 Ajuste EXACTO según tu PHP
        const identificacion = row[1];
        const nombre = row[2];
        const email = row[3];
        const referencia = row[0] + " / " + new Date().toISOString();
        const valor = Number(row[6]);
        const programa = row[4];
        const stado = row[7];
        const fecha = row[8];

        let orden = row[5] !== null ? row[5] : row[6];

        return res.json({
            success: true,
            identificacion,
            nombre,
            referencia,
            valor: valor.toString(),
            programa,
            email,
            orden,
            stado,
            fecha,
            mensaje: "Datos encontrados!"
        });

    } catch (error) {
        console.error("ERROR en verificar:", error.message);

        return res.json({
            success: false,
            mensaje: "Error al consultar la referencia. Intente nuevamente."
        });
    }
});


// Servidor
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend funcionando en http://localhost:${PORT}`);
});
