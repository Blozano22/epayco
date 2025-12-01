// import { useCallback, useEffect } from "react";
// import PagoFormulario from "./components/PagoFormulario";

// export default function Pago() {

//   // 🟢 Cargar script de ePayco SOLO una vez
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.epayco.co/checkout-v2.js";
//     script.async = true;

//     script.onload = () => {
//       console.log("🟢 Script de ePayco cargado.");
//     };

//     document.body.appendChild(script);
//   }, []);

//   const handlePay = useCallback(async () => {
//     try {
//       console.log("🟢 Creando sesión...");

//       const res = await fetch("http://localhost:4000/api/create-session", {
//         method: "POST",
//       });
//       const data = await res.json();

//       console.log("📦 Respuesta del backend:", data);

//       // Verificar estructura correcta del JSON
//       if (!data.success || !data.data || !data.data.sessionId) {
//         throw new Error("No se recibió sessionId válido");
//       }

//       const sessionId = data.data.sessionId;
//       console.log("✅ Session creada:", sessionId);

//       const handler = ePayco.checkout.configure({
//         sessionId: sessionId,
//         type: "onepage", // recomendado por la nueva versión
//         test: true
//       });

//       // Eventos opcionales
//       handler.onCreated(() => console.log("🟢 Checkout creado"));
//       handler.onErrors(e => console.error("❌ Error:", e));
//       handler.onClosed(() => console.log("🔒 Checkout cerrado"));

//       handler.open();

//     } catch (err) {
//       console.error("❌ Error iniciando pago:", err);
//       alert("Error iniciando pago: " + err.message);
//     }
//   }, []);

//   return (
//     <>
//       <PagoFormulario />

//       <script src="https://checkout.epayco.co/checkout-v2.js"></script>
//     </>
//   );

// }


import { useState } from "react";
import ReferenceForm from "./components/ReferenceForm";
import PagoFormulario from "./components/PagoFormulario";

export default function App() {
  const [data, setData] = useState(null);

  return (
    <>
      {!data ? (
        <ReferenceForm onSuccess={setData} />
      ) : (
        <PagoFormulario initialData={data} />
      )}
    </>
  );
}
