const express = require("express");
const { validarDatosReserva } = require("../middleware/reservas");

const {
  validarReemplazoReserva,
  validarActualizacionReserva
} = require("../middleware/cambios-reservas");
function crearRouterReservasApi(controlador) {
  const router = express.Router();
  router.get("/", controlador.listarApi); //La ruta raiz seria http://localhost:3000/api/reservas y se puede probar en Postman con GET
  router.get("/:id", controlador.obtenerApi); //http://localhost:3000/reservas/ID_RECIBIDO (reemplazar con el id) en Postman con body en none
  router.post("/", validarDatosReserva, controlador.crearApi); //PROBAR AGREGAR EN POSTMAN http://localhost:3000/api/reservas con POST, ir a body y agregar en formato JSON la nueva reserva
  //PUT Reemplazar
  router.put("/:id", validarDatosReserva, validarReemplazoReserva, controlador.reemplazarApi);
  //PATCH Actualizar
  router.patch("/:id",validarActualizacionReserva, controlador.actualizarApi); //actualizarApi,reemplazarApi y eliminar vienen de las funciones del controlador/reservas
  router.delete("/:id", controlador.eliminarApi);
  return router;
}
module.exports = { crearRouterReservasApi }; //Esto se exporta a app.js para ser usado en la ruta /api/reservas, y se le pasa el controlador de reservas que contiene las funciones listarApi, obtenerApi y crearApi.
