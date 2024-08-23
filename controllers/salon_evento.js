import SalonEvento from "../models/salon_evento.js";
import CiudadSalonEvento from "../models/ciudad_salon.js";
import DepartamentoSalonEvento from "../models/departamento_salon.js";

const httpSalonEvento = {
  // Obtener todos los salones de evento
  getAll: async (req, res) => {
    try {
      const salonEventos = await SalonEvento.find()
        .populate({
          path: "idCiudSalonEvento",
          populate: { path: "idDepart" },
        })
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");
      res.json(salonEventos);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  // Obtener salon por ID
  getPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const salonEvento = await SalonEvento.findById(id)
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");
      if (!salonEvento)
        return res.status(404).json({ message: "Salon no encontrado" });
      res.json(salonEvento);
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  // Obtener salones por ciudad
  getPorCiudad: async (req, res) => {
    try {
      const { idCiudSalonEvento } = req.params;
      const salonEventos = await SalonEvento.find({ idCiudSalonEvento })
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");
      res.json(salonEventos);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  getSalonesByLocation: async (req, res) => {
    try {
      const { location } = req.params; // `location` puede ser el nombre de la ciudad o departamento
      let filter = {};

      // Buscar por nombre de ciudad
      const ciudadDoc = await CiudadSalonEvento.findOne({
        nombre_ciud: location,
      });

      if (ciudadDoc) {
        // Si se encuentra la ciudad, se filtran los salones por esa ciudad
        filter.idCiudSalonEvento = ciudadDoc._id;
      } else {
        // Si no se encuentra la ciudad, buscar por nombre de departamento
        const departamentoDoc = await DepartamentoSalonEvento.findOne({
          nombre_depart: location,
        });

        if (departamentoDoc) {
          // Obtener todas las ciudades asociadas a ese departamento
          const ciudades = await CiudadSalonEvento.find({
            idDepart: departamentoDoc._id,
          });
          const ciudadIds = ciudades.map((c) => c._id);

          // Filtrar los salones que estén en cualquiera de esas ciudades
          filter.idCiudSalonEvento = { $in: ciudadIds };
        } else {
          // Si no se encuentra ni la ciudad ni el departamento, retornar un array vacío
          return res.status(200).json([]);
        }
      }

      // Filtrar salones basados en el filtro determinado
      const salones = await SalonEvento.find(filter)
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");

      res.status(200).json(salones);
    } catch (error) {
      console.error("Error fetching salones by location:", error);
      res.status(500).json({ message: "Error fetching salones by location" });
    }
  },

  getFilteredSalones: async (req, res) => {
    try {
      const {
        capacidad_sal,
        precio_sal,
        idCiudSalonEvento,
        idAmbienteSalon,
        idEspaciosSalon,
        idServiciosSalon,
      } = req.query;

      let filter = {};

      // Filtrar por capacidad
      if (capacidad_sal) {
        filter.capacidad_sal = { $gte: capacidad_sal };
      }

      // Filtrar por precio
      if (precio_sal) {
        filter.precio_sal = { $lte: precio_sal };
      }

      // Filtrar por ciudad
      if (idCiudSalonEvento) {
        filter.idCiudSalonEvento = idCiudSalonEvento;
      }

      // Filtrar por ambiente
      if (idAmbienteSalon) {
        filter.idAmbienteSalon = { $in: idAmbienteSalon.split(",") }; // Soporte para múltiples valores
      }

      // Filtrar por espacio
      if (idEspaciosSalon) {
        filter.idEspaciosSalon = { $in: idEspaciosSalon.split(",") }; // Soporte para múltiples valores
      }

      // Filtrar por servicio
      if (idServiciosSalon) {
        filter.idServiciosSalon = { $in: idServiciosSalon.split(",") }; // Soporte para múltiples valores
      }

      // Buscar salones basados en los filtros aplicados
      const salones = await SalonEvento.find(filter)
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");

      res.status(200).json(salones);
    } catch (error) {
      console.error("Error fetching filtered salones:", error);
      res.status(500).json({ message: "Error fetching filtered salones" });
    }
  },

  // Registrar un nuevo salon de evento
  registro: async (req, res) => {
    try {
      const {
        nombre_sal,
        descripcion_sal,
        galeria_sal,
        tipo_sal,
        capacidad_sal,
        direccion_sal,
        precio_sal,
        idCiudSalonEvento,
        idContactoSalon,
        idAmbienteSalon,
        idEspaciosSalon,
        idServiciosSalon,
      } = req.body;

      const salonEvento = new SalonEvento({
        nombre_sal,
        descripcion_sal,
        galeria_sal,
        tipo_sal,
        capacidad_sal,
        direccion_sal,
        precio_sal,
        idCiudSalonEvento,
        idContactoSalon,
        idAmbienteSalon,
        idEspaciosSalon,
        idServiciosSalon,
      });

      await salonEvento.save();

      res.json(salonEvento);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  // Actualizar un salon existente
  editar: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre_sal,
        descripcion_sal,
        galeria_sal,
        tipo_sal,
        capacidad_sal,
        direccion_sal,
        precio_sal,
        idCiudSalonEvento,
        idContactoSalon,
        idAmbienteSalon,
        idEspaciosSalon,
        idServiciosSalon,
      } = req.body;

      const salonEvento = await SalonEvento.findByIdAndUpdate(
        id,
        {
          nombre_sal,
          descripcion_sal,
          galeria_sal,
          tipo_sal,
          capacidad_sal,
          direccion_sal,
          precio_sal,
          idCiudSalonEvento,
          idContactoSalon,
          idAmbienteSalon,
          idEspaciosSalon,
          idServiciosSalon,
        },
        { new: true }
      )
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");

      if (!salonEvento)
        return res.status(404).json({ message: "Salon no encontrado" });

      res.json(salonEvento);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  // Activar un evento de salón
  putActivar: async (req, res) => {
    try {
      const { id } = req.params;
      const salonEvento = await SalonEvento.findByIdAndUpdate(
        id,
        { estado: true },
        { new: true }
      )
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");
      if (!salonEvento)
        return res.status(404).json({ message: "Salon no encontrado" });
      res.json(salonEvento);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  // Desactivar un evento de salón
  putInactivar: async (req, res) => {
    try {
      const { id } = req.params;
      const salonEvento = await SalonEvento.findByIdAndUpdate(
        id,
        { estado: false },
        { new: true }
      )
        .populate("idCiudSalonEvento")
        .populate("idContactoSalon")
        .populate("idAmbienteSalon")
        .populate("idEspaciosSalon")
        .populate("idServiciosSalon");
      if (!salonEvento)
        return res.status(404).json({ message: "Salon no encontrado" });
      res.json(salonEvento);
    } catch (error) {
      res.status(500).json({ error });
    }
  },
};

export default httpSalonEvento;
