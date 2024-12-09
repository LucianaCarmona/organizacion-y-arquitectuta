const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// leer el archivo datos
const readData = () => {
    try {
        const data = fs.readFileSync('datos.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer los datos:", error);
        return { citas: [], pacientes: [], medicos: [], consultorios: [] };
    }
};

// guardar los datos al archivo
const saveData = (data) => {
    try {
        fs.writeFileSync('datos.json', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al guardar los datos:", error);
    }
};

// obtener todas las citas
app.get('/citas', (req, res) => {
    const data = readData();
    res.json(data.citas);
});

// agregar una nueva cita
app.post('/citas', (req, res) => {
    const { fecha, hora, duracion, estado, motivo_consulta, paciente_dni, medico_id } = req.body;
    const data = readData();

    // Verificar si el paciente y el médico existen
    const paciente = data.pacientes.find(p => p.dni === paciente_dni);
    const medico = data.medicos.find(m => m.id === medico_id);

    if (!paciente) {
        return res.status(400).send({ mensaje: "Paciente no encontrado" });
    }
    if (!medico) {
        return res.status(400).send({ mensaje: "Médico no encontrado" });
    }

    // Crear la nueva cita
    const nuevaCita = {
        id: data.citas.length + 1,
        fecha,
        hora,
        duracion,
        estado,
        motivo_consulta,
        paciente_dni,
        medico_id
    };

    data.citas.push(nuevaCita);
    saveData(data);

    res.status(201).send({ mensaje: "Cita creada", cita: nuevaCita });
});

app.put('/citas/:idCitas', (req, res) => {
    const idCitas = parseInt(req.params.idCitas);
    const { fecha, hora, duracion, estado, motivo_consulta, paciente_dni, medico_id } = req.body;


    // leer el archivo datos.json con fs.ReadFileSync
    let data;
    try {
        const rawData = fs.readFileSync('datos.json', 'utf-8');
        data = JSON.parse(rawData);
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al leer el archivo de datos" });
    }

    // Verificar que la cita exista con .find
    const citas = data.citas.find(c => c.id === idCitas);
    if (!citas) {
        return res.status(404).send({ mensaje: "Cita no encontrada" });
    }

    // si existe entonces hacer la modificación de la variable
    if (fecha) citas.fecha = fecha;
    if (hora) citas.hora = hora;
    if (duracion) citas.duracion = duracion;
    if (estado) citas.estado = estado;
    if (motivo_consulta) citas.motivo_consulta = motivo_consulta;
    if (paciente_dni) {
        // Verificar si el paciente existe
        const paciente = data.pacientes.find(p => p.dni === paciente_dni);
        if (!paciente) {
            return res.status(400).send({ mensaje: "Paciente no encontrado" });
        }
        citas.paciente_dni = paciente_dni;
    }
    if (medico_id) {
        // Verificar si el médico existe
        const medico = data.medicos.find(m => m.id === medico_id);
        if (!medico) {
            return res.status(400).send({ mensaje: "Médico no encontrado" });
        }
        citas.medico_id = medico_id;
    }


    // una vez hecha la modificacion guardar en el archivo con fs.WriteFileSync
    try {
        fs.writeFileSync('datos.json', JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al guardar los cambios en el archivo de datos" });
    }

    res.send({ mensaje: "Cita actualizada", citas });
});


// obtener los pacientes
app.get('/pacientes', (req, res) => {
    const data = readData();
    res.json(data.pacientes);
});

// agregar un nuevo paciente
app.post('/pacientes', (req, res) => {
    const { id, nombre, apellido, dni, gmail, telefono, domicilio } = req.body;
    const data = readData();

    // Verificar si el paciente ya existe
    const pacienteExistente = data.pacientes.find(p => p.dni === dni);
    if (pacienteExistente) {
        return res.status(400).send({ mensaje: "El paciente ya existe" });
    }

    // Crear y agregar el nuevo paciente
    const nuevoPaciente = { id, nombre, apellido, dni, gmail, telefono, domicilio };
    data.pacientes.push(nuevoPaciente);
    saveData(data);

    res.status(201).send({ mensaje: "Paciente agregado", paciente: nuevoPaciente });
});

// Actualizar datos de un paciente
app.put('/pacientes/:idPaciente', (req, res) => {
    const idPacientes = parseInt(req.params.idPaciente); // Extraer el ID del paciente desde los parámetros
    const { nombre, apellido, dni, gmail, telefono, domicilio } = req.body; // Datos enviados para actualizar

    // Leer el archivo de datos
    let data;
    try {
        const rawData = fs.readFileSync("datos.json", 'utf-8');
        data = JSON.parse(rawData);
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al leer el archivo de datos" });
    }

    // Verificar que el paciente existe
    let pacientes = data.pacientes.find(p => p.id === idPacientes);
    if (!pacientes) {
        return res.status(404).send({ mensaje: "Paciente no encontrado" });
    }

    // Actualizar los campos proporcionados
    if (nombre !== undefined && nombre !== null) {
        pacientes.nombre = nombre;
    }

    if (apellido !== undefined && apellido !== null) {
        pacientes.apellido = apellido;
    }

    if (dni !== undefined && dni !== null) {
        // Verificar si el nuevo DNI ya existe en otro paciente
        const dniExistente = data.pacientes.find(p => p.dni === dni && p.id !== idPacientes);
        if (dniExistente !== undefined && dniExistente !== null) {
            res.status(400).send({ mensaje: "El DNI ya está registrado para otro paciente" });
            return;
        } else {
            pacientes.dni = dni;
        }
    }

    if (gmail !== undefined && gmail !== null) {
        const gmailExistente = data.pacientes.find(p => p.gmail === gmail && p.id !== idPacientes)
        if (gmailExistente !== undefined && gmailExistente !== null) {
            res.status(400).send({ mensaje: "El gmail ya está registrado para otro paciente" });
            return;
        } else {
            pacientes.gmail = gmail;
        }
    }

    if (telefono !== undefined && telefono !== null) {
        pacientes.telefono = telefono;
    }

    if (domicilio !== undefined && domicilio !== null) {
        pacientes.domicilio = domicilio;
    }


    // Guardar los cambios en el archivo de datos
    try {
        fs.writeFileSync("datos.json", JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al guardar los cambios en el archivo de datos" });
    }

    res.send({ mensaje: "Paciente actualizado", pacientes });

});

// obtener los médicos
app.get('/medicos', (req, res) => {
    const data = readData();
    res.json(data.medicos);
});
// agregar un nuevo medicos
app.post('/medicos', (req, res) => {
    const { id, nombre, apellido, especialidad, telefono, correo, disponibilidad } = req.body;
    const data = readData();

    // Verificar si el medico ya existe
    const medicoExistente = data.medicos.find(p => p.id === id);
    if (medicoExistente) {
        return res.status(400).send({ mensaje: "El medico ya existe" });
    }

    // Crear y agregar el nuevo medico
    const nuevoMedico = { id, nombre, apellido, especialidad, telefono, correo, disponibilidad };
    data.medicos.push(nuevoMedico);
    saveData(data);

    res.status(201).send({ mensaje: "Medico agregado", medico: nuevoMedico });
});
// Actualizar datos de un médico
app.put('/medicos/:idMedico', (req, res) => {
    const idMedico = parseInt(req.params.idMedico); // Extraer el ID del médico desde los parámetros
    const { nombre, apellido, especialidad, telefono, gmail } = req.body; // Datos enviados para actualizar

    // Leer el archivo de datos
    let data;
    try {
        const rawData = fs.readFileSync('datos.json', 'utf-8');
        data = JSON.parse(rawData);
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al leer el archivo de datos" });
    }

    // Verificar que el médico existe
    const medico = data.medicos.find(m => m.id === idMedico);
    if (!medico) {
        return res.status(404).send({ mensaje: "Médico no encontrado" });
    }

    // Actualizar los campos proporcionados
    if (nombre) medico.nombre = nombre;
    if (apellido) medico.apellido = apellido;
    if (especialidad) medico.especialidad = especialidad;
    if (telefono) medico.telefono = telefono;
    if (gmail) medico.gmail = gmail;

    // Guardar los cambios en el archivo de datos
    try {
        fs.writeFileSync('datos.json', JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al guardar los cambios en el archivo de datos" });
    }

    // Responder con éxito
    res.send({ mensaje: "Médico actualizado", medico });
});


// obtener los consultorios
app.get('/consultorios', (req, res) => {
    const data = readData();
    res.json(data.consultorios);
});

// agregar un nuevo consultorio
app.post('/consultorios', (req, res) => {
    const { id, nombre, direccion, telefono, descripcion } = req.body;
    const data = readData();

    // Verificar si el consultorio ya existe
    const consultoriosExistente = data.consultorios.find(p => p.id === id);
    if (consultoriosExistente) {
        return res.status(400).send({ mensaje: "El consultorio ya existe" });
    }

    // Crear y agregar el nuevo consultorio
    const nuevoConsultorios = { id, nombre, direccion, telefono, descripcion };
    data.consultorios.push(nuevoConsultorios);
    saveData(data);

    res.status(201).send({ mensaje: "Consultorio agregado", consultorios: nuevoConsultorios });
});

// Actualizar datos de un consultorio
app.put('/consultorios/:idConsultorio', (req, res) => {
    const idConsultorio = parseInt(req.params.idConsultorio); // Extraer el ID del consultorio desde los parámetros
    const { nombre, direccion, telefono, descripcion } = req.body; // Datos enviados para actualizar

    // Leer el archivo de datos
    let data;
    try {
        const rawData = fs.readFileSync('datos.json', 'utf-8');
        data = JSON.parse(rawData);
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al leer el archivo de datos" });
    }

    // Verificar que el consultorio existe
    const consultorio = data.consultorios.find(c => c.id === idConsultorio);
    if (!consultorio) {
        return res.status(404).send({ mensaje: "Consultorio no encontrado" });
    }

    // Actualizar los campos proporcionados
    if (nombre) consultorio.nombre = nombre;
    if (direccion) consultorio.direccion = direccion;
    if (telefono) consultorio.telefono = telefono;
    if (descripcion) consultorio.descripcion = descripcion;

    // Guardar los cambios en el archivo de datos
    try {
        fs.writeFileSync('datos.json', JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        return res.status(500).send({ mensaje: "Error al guardar los cambios en el archivo de datos" });
    }

    // Responder con éxito
    res.send({ mensaje: "Consultorio actualizado", consultorio });
});


// Configuración del servidor
const port = 3001;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
