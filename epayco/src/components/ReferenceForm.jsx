import { useState } from "react";

export default function ReferenceForm({ onSuccess }) {
    const [ref, setRef] = useState("");
    const [loading, setLoading] = useState(false);

    // const fechaVencida = (fechaCaducidad) => {
    //     const hoy = new Date();
    //     const fecha = new Date(fechaCaducidad);
    //     return fecha < hoy;
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ref.trim()) {
            alert("Por favor ingrese la referencia");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/verificar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ txtID: ref }),
            });

            const data = await res.json();
            setLoading(false);

            if (!data.success) {
                alert(data.mensaje || "Referencia no válida");
                return;
            }

            // // 🔥 Validar fecha de vencimiento
            // if (fechaVencida(data.fecha)) {
            //     alert("La referencia está vencida. Por favor comuníquese con Admisiones.");
            //     return;
            // }

            // 🔥 Enviar datos al formulario principal
            onSuccess({
                reference: data.referencia.split("/")[0],
                docNumber: data.identificacion,

                firstName: data.nombre.split(" ")[0],
                lastName: data.nombre.split(" ").slice(1).join(" "),

                amount: data.valor,
                email: data.email,
                description: data.orden,

                program: data.programa,
                stado: data.stado,

                // campos vacíos para completar
                city: "",
                state: "",
                address: "",
                phone: ""
            });

        } catch (err) {
            setLoading(false);
            alert("Error conectando con el servidor");
        }
    };

    return (
        <div className="container mt-5 text-center">
            <img src="assets/img/logo2.png" style={{ width: "200px" }} />
            <h4 className="mt-3">Ingresa tu código de referencia</h4>

            <form onSubmit={handleSubmit} className="mt-3">
                <input
                    className="form-control"
                    placeholder="Referencia"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                />

                <button className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? "Verificando..." : "Verificar"}
                </button>
            </form>

            <p className="mt-4">
                Portal exclusivo para estudiantes de Barranquilla.<br />
                Departamento de Sistemas.
            </p>
        </div>
    );
}
