document.addEventListener('DOMContentLoaded', function() {
    // Selecciona los elementos del DOM que se van a manipular.
    const registroForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');
    const mostrarLoginLink = document.getElementById('mostrar-login');
    const mostrarRegistroLink = document.getElementById('mostrar-registro');
    const registroMensaje = document.getElementById('registro-mensaje');
    const loginMensaje = document.getElementById('login-mensaje');
    const authContainer = document.getElementById('auth-container');
    const calendarioContenido = document.querySelector('.contenido-libro');
    const areaNotas = document.getElementById('area-notas');
    const guardarNotaBtn = document.getElementById('guardar-nota-btn');
    const mostrarFechaTitulo = document.getElementById('mostrar-fecha');
    const mensajeNotaDiv = document.getElementById('mensaje-nota');
    const colorBotonesContainer = document.querySelector('.color-botones-container');
    const colorBotones = document.querySelectorAll('.color-boton');
    let notaColor = 'base'; // Color por defecto para las notas
    let usuarioId = null;
    let fechaSeleccionada = new Date();

    function formatearFecha(date) {
        // Toma un objeto Date y lo formatea como AAAA-MM-DD.
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function verificarSesion() {
        // Realiza una petición al servidor para verificar la sesión del usuario.
        fetch('php/verificar_sesion.php')
        .then(response => response.json())
        .then(data => {
            if (data.usuario_id) {
                // Si hay sesión, muestra el calendario.
                usuarioId = data.usuario_id;
                mostrarCalendario();
            } else {
                // Si no hay sesión, muestra los formularios de autenticación.
                authContainer.style.display = 'block';
                calendarioContenido.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error al verificar la sesión:', error);
            authContainer.style.display = 'block';
            calendarioContenido.style.display = 'none';
        });
    }

    function mostrarCalendario() {
        // Oculta los formularios de autenticación y muestra el calendario.
        authContainer.style.display = 'none';
        calendarioContenido.style.display = 'flex';
        iniciarCalendario();
        cargarNota(formatearFecha(fechaSeleccionada));
    }

    function cargarNota(fecha) {
        // Carga la nota del usuario para una fecha específica.
        if (!usuarioId) return;
        fetch(`php/cargar_notas.php?usuario_id=${usuarioId}&fecha=${fecha}`)
        .then(response => response.json())
        .then(data => {
            areaNotas.value = (data.tipo === 'success' && data.nota) ? data.nota : '';
            mostrarFechaTitulo.textContent = new Date(fecha).toLocaleDateString();
        })
        .catch(error => {
            console.error('Error al cargar la nota:', error);
            mensajeNotaDiv.textContent = 'Error al cargar la nota.';
            mensajeNotaDiv.className = 'error';
        });
    }

    function guardarNota() {
        // Guarda la nota del usuario para la fecha seleccionada.
        if (!usuarioId) return;
        const nota = areaNotas.value.trim();
        const fecha = formatearFecha(fechaSeleccionada);
        const colorParaGuardar = notaColor === 'base' ? 'base' : notaColor;
        const botonGuardar = document.getElementById('guardar-nota-btn');
        const textoOriginalBoton = botonGuardar.textContent;

        // Función para revertir el estado del botón
        function revertirBoton() {
            botonGuardar.textContent = textoOriginalBoton;
            botonGuardar.classList.remove('guardado'); // Elimina la clase de "guardado" si la tiene
        }

        // Si se selecciona "Borrar" y no hay nota, intentar eliminar el color
        if (notaColor === 'base' && nota === '') {
            botonGuardar.textContent = 'Borrando...';
            fetch('php/eliminar_color_nota.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `usuario_id=${usuarioId}&fecha=${fecha}`
            })
            .then(response => response.json())
            .then(data => {
                botonGuardar.textContent = data.mensaje.includes('eliminada') ? 'Borrado!' : 'Error!';
                if (data.tipo === 'success' && data.mensaje.includes('eliminada')) {
                    botonGuardar.classList.add('guardado'); // Puedes añadir una clase para un estilo visual
                    cargarNota(fecha); // Recargar la nota para actualizar la visualización
                }
                setTimeout(revertirBoton, 1500); // Revertir después de 1.5 segundos
            })
            .catch(error => {
                botonGuardar.textContent = 'Error!';
                console.error('Error:', error);
                setTimeout(revertirBoton, 1500);
            });
        } else {
            botonGuardar.textContent = 'Guardando...';
            fetch('php/guardar_nota.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `usuario_id=${usuarioId}&fecha=${fecha}&nota=${nota}&color=${colorParaGuardar}`
            })
            .then(response => response.json())
            .then(data => {
                botonGuardar.textContent = data.mensaje.includes('guardada') || data.mensaje.includes('actualizada') ? 'Guardado!' : 'Error!';
                if (data.tipo === 'success') {
                    botonGuardar.classList.add('guardado'); // Puedes añadir una clase para un estilo visual
                }
                setTimeout(revertirBoton, 1500); // Revertir después de 1.5 segundos
            })
            .catch(error => {
                botonGuardar.textContent = 'Error!';
                console.error('Error:', error);
                setTimeout(revertirBoton, 1500);
            });
        }
    }

    areaNotas.addEventListener('blur', guardarNota); // Guarda la nota al perder el foco.
    guardarNotaBtn.addEventListener('click', guardarNota); // Guarda la nota al hacer clic en el botón.

    colorBotonesContainer.addEventListener('click', function(event) {
        // Maneja el clic en los botones de color.
        if (event.target.classList.contains('color-boton')) {
            const nuevoColor = event.target.dataset.color;
            notaColor = nuevoColor;

            // Obtener el elemento del día seleccionado y cambiar su clase
            const diaSeleccionado = document.querySelector('.fechas div.seleccionado');
            if (diaSeleccionado) {
                const fechaSeleccionadaFormateada = formatearFecha(fechaSeleccionada);
                const hoy = new Date();
                const hoyFormateado = formatearFecha(hoy);

                // Remover las clases de color anteriores
                diaSeleccionado.classList.remove('fecha-nota-azul', 'fecha-nota-verde', 'fecha-nota-rojo');
                // Añadir la nueva clase de color si no es 'base'
                if (notaColor !== 'base') {
                    diaSeleccionado.classList.add('fecha-nota-' + notaColor);
                }
                // Mantener la clase 'hoy' si corresponde
                if (fechaSeleccionadaFormateada === hoyFormateado) {
                    diaSeleccionado.classList.add('hoy');
                }
                // Guardar la nota con el color actualizado inmediatamente
                guardarNota();
            }
        }
    });

    registroForm.addEventListener('submit', function(e) {
        // Maneja el envío del formulario de registro.
        e.preventDefault();
        const formData = new FormData(registroForm);

        fetch('php/registro.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            registroMensaje.textContent = data.mensaje;
            registroMensaje.className = data.tipo;
            if (data.tipo === 'success') {
                const loginData = new FormData();
                loginData.append('nombre_usuario', registroForm.elements.nombre_usuario.value);
                loginData.append('contrasena', registroForm.elements.contrasena.value);

                fetch('php/login.php', {
                    method: 'POST',
                    body: loginData
                })
                .then(response => response.json())
                .then(loginData => {
                    if (loginData.tipo === 'success' && loginData.usuario_id) {
                        usuarioId = loginData.usuario_id;
                        mostrarCalendario();
                        registroForm.style.display = 'none';
                        authContainer.style.display = 'none';
                    } else {
                        registroMensaje.textContent = 'Registro exitoso. Por favor, inicia sesión.';
                        loginForm.style.display = 'block';
                        registroForm.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error al intentar iniciar sesión tras el registro:', error);
                    registroMensaje.textContent = 'Registro exitoso, pero hubo un error al iniciar sesión.';
                    loginForm.style.display = 'block';
                    registroForm.style.display = 'none';
                });
            }
        })
        .catch(error => {
            registroMensaje.textContent = 'Error de red al registrar.';
            registroMensaje.className = 'error';
            console.error('Error:', error);
        });
    });

    loginForm.addEventListener('submit', function(e) {
        // Maneja el envío del formulario de inicio de sesión.
        e.preventDefault();
        const formData = new FormData(loginForm);

        fetch('php/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.tipo === 'success' && data.usuario_id) {
                usuarioId = data.usuario_id;
                mostrarCalendario();
                loginForm.style.display = 'none';
                authContainer.style.display = 'none';
            } else {
                loginMensaje.textContent = data.mensaje;
                loginMensaje.className = data.tipo;
            }
        })
        .catch(error => {
            loginMensaje.textContent = 'Error de red al iniciar sesión.';
            loginMensaje.className = 'error';
            console.error('Error:', error);
        });
    });

    mostrarLoginLink.addEventListener('click', function(e) {
        // Maneja el clic en el enlace para mostrar el formulario de inicio de sesión.
        e.preventDefault();
        registroForm.style.display = 'none';
        loginForm.style.display = 'block';
        registroMensaje.textContent = '';
        loginMensaje.textContent = '';
    });

    mostrarRegistroLink.addEventListener('click', function(e) {
        // Maneja el clic en el enlace para mostrar el formulario de registro.
        e.preventDefault();
        loginForm.style.display = 'none';
        registroForm.style.display = 'block';
        registroMensaje.textContent = '';
        loginMensaje.textContent = '';
    });

    const anoElement = document.getElementById('cabecera-ano');
    const mesElement = document.getElementById('mes');
    const fechasElement = document.querySelector('.fechas');
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombresDiasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]; // Para la cabecera
    let fechaActualCalendario = new Date();
    let mesActualCalendario = fechaActualCalendario.getMonth();
    let anoActualCalendario = fechaActualCalendario.getFullYear();

    function iniciarCalendario() {
        // Inicializa el calendario mostrando el año y mes actual.
        anoElement.textContent = anoActualCalendario;
        mesElement.textContent = nombresMeses[mesActualCalendario];
        generarCalendario(anoActualCalendario, mesActualCalendario);
        actualizarCabeceraDias(); // Actualizar la cabecera de los días
    }

    function actualizarCabeceraDias() {
        // Actualiza la cabecera del calendario con los nombres de los días de la semana.
        const diasElement = document.querySelector('.dias');
        diasElement.innerHTML = '';
        nombresDiasSemana.forEach(dia => {
            const div = document.createElement('div');
            div.textContent = dia;
            diasElement.appendChild(div);
        });
    }

    function generarCalendario(ano, mes) {
        // Genera los días del calendario para un año y mes específicos.
        fechasElement.innerHTML = '';
        const primerDiaSemana = new Date(ano, mes, 1).getDay();
        const primerDiaSemanaAjustado = (primerDiaSemana === 0) ? 6 : primerDiaSemana - 1;
        const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
        const hoy = new Date();
        const hoyFormateado = formatearFecha(hoy);

        for (let i = 0; i < primerDiaSemanaAjustado; i++) {
            const diaVacio = document.createElement('div');
            fechasElement.appendChild(diaVacio);
        }

        for (let i = 1; i <= ultimoDiaMes; i++) {
            const diaDiv = document.createElement('div');
            diaDiv.textContent = i;
            const fechaActual = new Date(ano, mes, i);
            const fechaFormateada = formatearFecha(fechaActual);

            diaDiv.addEventListener('click', function() {
                // Maneja el clic en un día del calendario.
                fechaSeleccionada = fechaActual;
                cargarNota(fechaFormateada);
                document.querySelectorAll('.fechas div').forEach(div => div.classList.remove('seleccionado'));
                diaDiv.classList.add('seleccionado');
                if (fechaFormateada === hoyFormateado) {
                    diaDiv.classList.add('hoy');
                }
            });

            // Verificar y aplicar la clase 'hoy'
            if (fechaFormateada === hoyFormateado) {
                diaDiv.classList.add('hoy');
            }

            // Aquí deberías verificar si hay una nota para este día y aplicar el color
            fetch(`php/cargar_notas.php?usuario_id=${usuarioId}&fecha=${fechaFormateada}`)
            .then(response => response.json())
            .then(data => {
                if (data.tipo === 'success' && data.color && data.color !== 'base') {
                    diaDiv.classList.add('fecha-nota-' + data.color);
                    // Asegurarse de que 'hoy' se mantenga si corresponde
                    if (fechaFormateada === hoyFormateado) {
                        diaDiv.classList.add('hoy');
                    }
                }
            });

            fechasElement.appendChild(diaDiv);
        }
    }

    document.getElementById('prev-mes').addEventListener('click', function() {
        // Maneja el clic en el botón para ir al mes anterior.
        mesActualCalendario--;
        if (mesActualCalendario < 0) {
            mesActualCalendario = 11;
            anoActualCalendario--;
        }
        iniciarCalendario();
    });

    document.getElementById('next-mes').addEventListener('click', function() {
        // Maneja el clic en el botón para ir al mes siguiente.
        mesActualCalendario++;
        if (mesActualCalendario > 11) {
            mesActualCalendario = 0;
            anoActualCalendario++;
        }
        iniciarCalendario();
    });

    verificarSesion(); // Verifica la sesión al cargar la página.
});