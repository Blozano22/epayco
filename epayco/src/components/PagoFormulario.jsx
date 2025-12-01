import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PagoFormulario({ initialData }) {

    // 🔥 Inicializar el formulario con los datos recibidos
    const [form, setForm] = useState({
        invoice: "",
        docNumber: "",
        docType: "CC",
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        state: "",
        address: "",
        amount: "",
        email: "",
        description: ""
    });

    // 🔥 Cargar datos cuando initialData llegue desde el ReferenceForm
    useEffect(() => {
        if (!initialData) return;

        console.log("🔥 Datos recibidos en PagoFormulario:", initialData);

        setForm({
            invoice: initialData.reference,
            docNumber: initialData.docNumber,
            docType: "CC",

            firstName: initialData.firstName,
            lastName: initialData.lastName,

            email: initialData.email,
            amount: initialData.amount,
            description: initialData.description,

            city: initialData.city || "",
            state: initialData.state || "",
            address: initialData.address || "",
            phone: initialData.phone || "",
        });
    }, [initialData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("📤 Enviando datos al backend:", form);

        const res = await fetch("http://localhost:4000/api/create-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        const data = await res.json();
        console.log("📦 Respuesta backend:", data);

        const sessionId = data?.data?.sessionId;

        if (!sessionId) {
            alert("❌ Error iniciando pago: sessionId no recibido");
            return;
        }

        console.log("Session creada:", sessionId);

        const handler = window.ePayco.checkout.configure({
            sessionId,
            type: "onepage",
            test: true,
        });

        handler.onErrors((e) => console.error("Checkout error:", e));
        handler.open();
    };

    return (
        <div
            className="position-fixed top-50 start-50 translate-middle w-100"
            style={{ maxWidth: "500px" }}
        >
            <div className="card shadow p-4 w-100">
                <h3 className="text-center mb-4 fw-bold">
                    INFORMACIÓN DEL ESTUDIANTE PARA EL PAGO
                </h3>

                <form onSubmit={handleSubmit}>

                    {/* FILA 1 */}
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Referencia*</label>
                            <input
                                className="form-control"
                                name="invoice"
                                value={form.invoice}
                                readOnly
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label">Identificación*</label>
                            <input
                                className="form-control"
                                name="docNumber"
                                value={form.docNumber}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* FILA 2 */}
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Tipo de identificación*</label>
                            <select
                                className="form-select"
                                name="docType"
                                value={form.docType}
                                onChange={handleChange}
                                required
                            >
                                <option value="CC">Cédula</option>
                                <option value="TI">Tarjeta de identidad</option>
                            </select>
                        </div>

                        <div className="col-6">
                            <label className="form-label">Nombres*</label>
                            <input
                                className="form-control"
                                name="firstName"
                                value={form.firstName}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* FILA 3 */}
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Apellidos*</label>
                            <input
                                className="form-control"
                                name="lastName"
                                value={form.lastName}
                                readOnly
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label">Teléfono*</label>
                            <input
                                className="form-control"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* FILA 4 */}
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Ciudad*</label>
                            <input
                                className="form-control"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label">Departamento*</label>
                            <input
                                className="form-control"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* FILA 5 */}
                    <div className="row mb-3">
                        <div className="col-6">
                            <label className="form-label">Dirección*</label>
                            <input
                                className="form-control"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-6">
                            <label className="form-label">Valor a pagar*</label>
                            <input
                                className="form-control"
                                name="amount"
                                value={form.amount}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* FILA 6 */}
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico*</label>
                        <input
                            className="form-control"
                            name="email"
                            value={form.email}
                            readOnly
                        />
                    </div>

                    <button className="btn btn-primary btn-lg w-100 mt-3">
                        PAGAR AHORA
                    </button>
                </form>
            </div>
        </div>
    );
}
