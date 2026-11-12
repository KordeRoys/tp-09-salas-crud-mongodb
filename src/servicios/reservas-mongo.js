//* #Este archivo es el servicio de productos, se encarga listar, obtener por id, crear, eliminar, actualizar y reemplazar productos en la base de datos de MongoDB Atlas.

/*El archivo que consulta los productos en MongoDB Atlas usa 
Reserva.find() para listar y Reserva.findById() para buscar por ID.
La conexión se configura en base-datos.js, que obtiene la URI desde
 el .env. El modelo de los productos está en reservas.js. */

const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reservas");

//Esta funcion sirve para representar los datos y usarla en la funcion crearServicioReservasMongo
function representarReserva(documento) {
  return {
    id: documento._id.toString(), //Tomamos el _id. del documento, lo convertimos a texto y lo entregamos como id junto a los campos de Reserva
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}
function comprobarId(id) {
  //comprobarId es una funcion que vamos a utilizar con las demas funciones para verificar si el id es valido, si no lo es lanza un error con un mensaje y un codigo de error
  if (!mongoose.isObjectIdOrHexString(id)) {
    //isObjectIdOrHexString() es un metodo que verifica si el id es un ObjectId válido o una cadena hexadecimal de 24 caracteres. Si no lo es, lanzamos un error con un mensaje y un código de error.
    const error = new Error("Identificador inválido");
    error.codigo = "ID_INVALIDO";
    throw error;
  }
}

// *lean() convierte los documentos de Mongoose en objetos JavaScript simples, lo que permite acceder a sus propiedades directamente sin necesidad de utilizar métodos de Mongoose. Esto es útil para mejorar el rendimiento y simplificar el código al trabajar con los datos obtenidos de la base de datos.

function crearServicioReservasMongo() {
  
  async function listar(sala) {
    const filtro = {};
    if (sala !== undefined) {
      if (typeof sala !== "string" || !sala.trim()) {
        const error = new Error("Sala inválida");
        error.codigo = "FILTRO_INVALIDO";
        throw error;
      }
      filtro.sala = sala.trim();
    }

    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }


  async function contar() {
    return await Reserva.countDocuments({}); //Esta funcion cuenta la cantidad de documentos en la colección reservas y devuelve el resultado. countDocuments() es un metodo de Mongoose que cuenta los documentos que coinciden con el filtro. En este caso, no se aplica ningún filtro, por lo que cuenta todos los documentos de la colección reservas.
  }

  async function obtenerPorId(id) {
    comprobarId(id);
    const documento = await Reserva.findById(id).lean();//lean() es un metodo que devuelve un objeto plano en lugar de un documento de Mongoose, lo que mejora el rendimiento y reduce el consumo de memoria.
    return documento ? representarReserva(documento) : null;
  }

  async function crear(datos) {
    const documento = await Reserva.create({
      //no usa _id, de eso se encarga mongodb
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      //tampoco se agrega el estado
    });
    return representarReserva(documento);
  }

  //TP9 9 NUEVO
  async function reemplazar(id, datos) {
    comprobarId(id);
    const reemplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    }; //tiene el parametro _id(parametro por el cual lo va a encontrar) y id todos los datos que va a reemplazar
    const documento = await Reserva.findOneAndReplace({ _id: id }, reemplazo, {
      //findOneAndReplace es un metodo que ya viene desde mongoose, significa encontrar uno y reemplazar
      runValidators: true, // y el tercer parametro (que esta entre llaves son validaciones)
      returnDocument: "after", //returnDocument: significa que va a retornar el documento despues de ejecutar el findOneAndReplace, con la opcion after(despues)
      upsert: false, //UPSERT: cuando esta en TRUE si NO encuentra ninguno crea uno nuevo, el FALSE no hace nada
    });
    return documento ? representarReserva(documento) : null; // ?Si todo pasa bien devuelve el documento modificado : Si no es null y no va a devolver nada
  }

  async function actualizar(id, datos) {
    //datos va a contener la informacion que queremos actualizar, como por ejemplo el precio o la disponibilidad del producto. Esta funcion permite actualizar solo los campos especificados sin afectar los demás campos del producto.
    comprobarId(id);
    const cambios = {};
    for (const campo of ["sala", "estado"]) {
      //Por cada campo "precio" y "disponible" que se encuentre en el arreglo, si existe en los datos que se pasan como parametro, se agrega al objeto cambios con su valor correspondiente. Esto permite actualizar solo los campos especificados sin afectar los demás campos del producto.
      if (Object.hasOwn(datos, campo)) cambios[campo] = datos[campo]; //Object.hasOwn() es un metodo que verifica si el objeto datos tiene la propiedad campo. Si la tiene, se agrega al objeto cambios con su valor correspondiente.
    }
    if (Object.keys(cambios).length === 0) {
      const error = new Error("Actualización vacía");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
    const documento = await Reserva.findOneAndUpdate(
      { _id: id },
      { $set: cambios },
      { runValidators: true, returnDocument: "after", upsert: false },
    );
    return documento ? representarReserva(documento) : null;
  }

  async function eliminar(id) {
    comprobarId(id); //Compruebo el id
    const resultado = await Reserva.deleteOne({ _id: id }); //deleteOne es un metodo que elimina un documento de la base de datos que coincida con el filtro especificado. En este caso, el filtro es { _id: id }, lo que significa que se eliminará el documento cuyo _id coincida con el id proporcionado. El resultado de la operación se almacena en la constante resultado.
    return resultado.deletedCount === 1; //deletedCount es una propiedad del objeto resultado que indica cuántos documentos fueron eliminados. Si es igual a 1, significa que se eliminó un documento y la función devuelve true; de lo contrario, devuelve false.
  }
  return {
    listar,
    obtenerPorId,
    crear,
    contar,
    reemplazar, //NUEVO*
    actualizar, //NUEVO*
    eliminar, //NUEVO*

  };
}
module.exports = { crearServicioReservasMongo }; //Esta funcion se exporta a index.js
