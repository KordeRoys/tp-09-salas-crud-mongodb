//TP 9 Estas son validaciones para cuando usamos PUT y PATCH
function validarReemplazoReserva(req, res, next) {
    const datos = req.body;
    const permitidos = [
        "estudiante",
        "email",
        "sala",
        "fecha",
        "turno",
        "personas",
        "estado",
    ];
    for (const campo of Object.keys(datos)) {
        if (!permitidos.includes(campo)) {
            return res
                .status(400)
                .json({ error: "El campo " + campo + " no se puede modificar." });
        }
    }
    if (typeof datos.estado !== "string" || !["pendiente", "confirmada"].includes(datos.estado)) {
        return res.status(400).json({ error: "El estado debe ser 'pendiente', 'confirmada' o 'cancelada'." });
    }
    req.cambiosValidos = req.reservaValidada;
    req.cambiosValidos.estado = datos.estado;
    next();
}

function validarActualizacionReserva(req, res, next) {
    const datos = req.body;
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        return res.status(400).json({ error: "Enviá un objeto JSON." });
    }
    for (const campo of Object.keys(datos)) {
        if (campo !== "personas" && campo !== "estado") {
            return res
                .status(400)
                .json({ error: "Solo se puede cambiar persona o estado." });
        }
    }
    if (datos.persona === undefined && datos.estado === undefined) {
        return res.status(400).json({ error: "Agregue personas y estado." });
    }

    req.cambiosValidos = cambios;
    next();
}
module.exports = { validarReemplazoReserva, validarActualizacionReserva }; //Esto se exporta a rutas/productos-api