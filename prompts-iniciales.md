# Prompts iniciales del proyecto

Listado de prompts utilizados para realizar el proyecto.

---

## 01 - MD Ticket principal

Escribe en el fichero `TICKET-ADD-CANDIDATE.md`, usando formato Markdown, el siguiente contenido sin alterar nada, sólo añadiendo los títulos y estructura oportunos:

Añadir Candidato al Sistema

Como reclutador,

Quiero tener la capacidad de añadir candidatos al sistema ATS,

Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.

Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.

Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.

Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.

Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.

Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.

Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.

Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.

Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

Tareas Técnicas:

Implementar la interfaz de usuario para el formulario de añadir candidato.

Desarrollar el backend necesario para procesar la información ingresada en el formulario.

Asegurar la seguridad y privacidad de los datos del candidato.

---

## 02 - Enrich US

```text
/ai-specs/enrich-us @ai-specs/ai-specs/changes/TICKET-ADD-CANDIDATE.md
```

---

## 03 - Plan backend

```text
/ai-specs/plan-backend-ticket @ai-specs/ai-specs/changes/TICKET-ADD-CANDIDATE.md
```

---

## 04 - Develop backend

```text
/ai-specs/develop-backend @ai-specs/ai-specs/changes/TICKET-ADD-CANDIDATE_backend.md
```

---

## 05 - Plan frontend

```text
/ai-specs/plan-frontend-ticket @ai-specs/ai-specs/changes/TICKET-ADD-CANDIDATE.md
```

---

## 06 - Develop frontend

```text
/ai-specs/develop-frontend @ai-specs/ai-specs/changes/TICKET-ADD-CANDIDATE_frontend.md
```

---

## Error al guardar candidato en Docker

En la URL `http://localhost:3000/candidates/new`, al pulsar el botón "Guardar candidato" obtenemos estos logs de error:

```text
POST http://localhost:3010/api/candidates 500 (Internal Server Error)
dispatchXhrRequest @ xhr.js:178
xhr @ xhr.js:13
dispatchRequest @ dispatchRequest.js:43
_request @ Axios.js:168
request @ Axios.js:40
httpMethod @ Axios.js:202
wrap @ bind.js:12
createCandidate @ candidateService.ts:81
handleSubmit @ AddCandidateForm.tsx:165
callCallback @ react-dom.development.js:3724
invokeGuardedCallbackDev @ react-dom.development.js:3768
invokeGuardedCallback @ react-dom.development.js:3825
invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:3839
executeDispatch @ react-dom.development.js:7982
processDispatchQueueItemsInOrder @ react-dom.development.js:8008
processDispatchQueue @ react-dom.development.js:8019
dispatchEventsForPlugins @ react-dom.development.js:8028
(anonymous) @ react-dom.development.js:8188
batchedUpdates$1 @ react-dom.development.js:22611
batchedUpdates @ react-dom.development.js:3572
dispatchEventForPluginEventSystem @ react-dom.development.js:8187
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ react-dom.development.js:5694
dispatchEvent @ react-dom.development.js:5688
dispatchDiscreteEvent @ react-dom.development.js:5665
```

Creo que es por un tema de persistencia en Docker que al reiniciar el proyecto se eliminan las tablas de PostgreSQL.

¿Cómo lo podemos solventar?
