const formularioContactos = document.querySelector('#contacto'),
    listadoContactos = document.querySelector('#listado-contactos tbody');
    inputBuscador = document.querySelector('#buscar');
eventListeners();

function eventListeners() {
    //cuando el formulario de crear o editar se ejecuta
    formularioContactos.addEventListener('submit', leerFormulario);

    //listener para el boton eliminar
    if (listadoContactos) {
        listadoContactos.addEventListener('click', eliminarContacto);
    }
    //buscador
    inputBuscador.addEventListener('input', buscarContactos);
    //numero de contactos
    numeroContactos();
}

function leerFormulario(e) {
    e.preventDefault();

    //leer los datos de los inputs
    const nombre = document.querySelector('#nombre').value,
        empresa = document.querySelector('#empresa').value,
        telefono = document.querySelector('#telefono').value,
        accion = document.querySelector('#accion').value;
    if (nombre === '' || empresa === '' || telefono === '') {
        //2 parametros texto y clase
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
    } else {
        //pasa la validacion, crear llamado  a Ajax
        const infoContacto = new FormData();
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);
        // console.log(...infoContacto);

        if (accion === 'crear') {
            //creamos un nuevo contacto
            insertarBD(infoContacto);
        } else {
            //editar el contacto
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegistro(infoContacto);

        }
    }
}
//Insertar en la base de datos via Ajax
function insertarBD(datos) {
    //llamado a ajax

    //crear el objeto
    const xhr = new XMLHttpRequest();
    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-contacto.php', true);
    //pasar los datos
    xhr.onload = function () {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //leemos la respuesta de php
            const respuesta = JSON.parse(xhr.responseText);
            //console.log(respuesta.empresa); Inserta un nuevo elemento a la tabla
            const nuevoContacto = document.createElement('tr');
            nuevoContacto.innerHTML = `
                        <td>${respuesta.datos.nombre}</td>
                        <td>${respuesta.datos.empresa}</td>
                        <td>${respuesta.datos.telefono}</td>
            `;
            // crear contenedor para los botones
            const contenedorAcciones = document.createElement('td');
            //crear el icono de Editar
            const iconoEditar = document.createElement('i');
            iconoEditar.classList.add('fas', 'fa-pen-square');
            //crear el enlacer para editar
            const btnEditar = document.createElement('a');
            btnEditar.appendChild(iconoEditar);
            btnEditar.href = `editar.php?id=${respuesta.datos.id_insertado}`;
            btnEditar.classList.add('btn', 'btn-editar');
            //agregarlo al padre
            contenedorAcciones.appendChild(btnEditar);

            //crear icono eliminar
            const iconoEliminar = document.createElement('i');
            iconoEliminar.classList.add('fas', 'fa-trash-alt');
            //crear el boton de eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.appendChild(iconoEliminar);
            btnEliminar.setAttribute('data-id', respuesta.datos.id_insertado);
            btnEliminar.classList.add('btn', 'btn-borrar');
            //agregar al padre
            contenedorAcciones.appendChild(btnEliminar);
            //agregar el td a tr
            nuevoContacto.appendChild(contenedorAcciones);
            //agregar a contactos
            listadoContactos.appendChild(nuevoContacto);

            //resetear el formulario
            document.querySelector('form').reset();

            //mostrar notificacion de registro
            mostrarNotificacion('Contacto Creado Correctamente', 'correcto');
            //actualizar el numero
            numeroContactos();

        }

    }
    //enviar los datos
    xhr.send(datos);

}
//actualiza las modificaciones

function actualizarRegistro(datos) {
    // crear el objeto
    const xhr = new XMLHttpRequest();

    // abrir la conexión
    xhr.open('POST', 'inc/modelos/modelo-contacto.php', true);

    // leer la respuesta
    xhr.onload = function() {
         if(this.status === 200) {
              const respuesta = JSON.parse(xhr.responseText);

              if(respuesta.respuesta === 'correcto'){
                   // mostrar notificación de Correcto
                   mostrarNotificacion('Contacto Editado Correctamente', 'correcto');
              } else {
                   // hubo un error
                   mostrarNotificacion('Hubo un error...', 'error');
              }
              // Después de 3 segundos redireccionar
              setTimeout(() => {
                  window.location.href = 'index.php';
              }, 4000);
         }
    }

    // enviar la petición
    xhr.send(datos);
}

//eliminar el contacto
function eliminarContacto(e) {
    // console.log(e.target);
    // console.log(e.target.parentElement.classList.contains('btn-borrar'));
    if (e.target.parentElement.classList.contains('btn-borrar')) {
        //tomar id
        const id = e.target.parentElement.getAttribute('data-id');
        //console.log(id);
        //preguntar al usuario si esra seguro
        const respuesta = confirm('¿Estás seguro (a) ?');
        // if(respuesta) {console.log('Siii estoy seguro');} else{console.log('Dejame pensarlo más'); }
        if (respuesta) {
            //llamado a ajax
            //crear objeto
            const xhr = new XMLHttpRequest();
            //abrir conexion
            xhr.open('GET', `inc/modelos/modelo-contacto.php?id=${id}&accion=borrar`, true);

            //leer la respusta
            xhr.onload = function () {
                if (this.status === 200) {
                    const resultado = JSON.parse(xhr.responseText);

                    if (resultado.respuesta === 'correcto') {
                        //eliminar el registro del dom
                        // console.log(e.target.parentElement.parentElement.parentElement);
                        e.target.parentElement.parentElement.parentElement.remove();

                        //mostrar notificacion
                        mostrarNotificacion('Contacto eliminado', 'correcto');
                          //actualizar el numero
                        numeroContactos();
                    } else {
                        //Mostramos ina notificacion
                        mostrarNotificacion('Hubo un error...', 'error');
                    }
                }
            }

            //enviar la peticion
            xhr.send();
        }


    }

}
//notificacion en pantalla

function mostrarNotificacion(mensaje, clase) {
    const notificacion = document.createElement('div'); //crea un div
    notificacion.classList.add(clase, 'notificacion', 'sombra'); //agrega clase
    notificacion.textContent = mensaje; //agrega texto

    //formulario
    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));

    //Ocultar y mostrar la notificacion

    setTimeout(() => {
        notificacion.classList.add('visible');
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }, 100);

}
//buscador de registros
function buscarContactos(e) {
    //console.log(e.target.value);
    const expresion = new RegExp(e.target.value, "i"),
            registros = document.querySelectorAll('tbody tr');

            registros.forEach(registro => {
                registro.style.display = 'none';
               // console.log(registro.childNodes[1]);
                //console.log(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1);
                
                if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
                    registro.style.display = 'table-row';
                }
                numeroContactos();
            })

}
//muestra el numero de contactos
function numeroContactos() {
    const totalContactos = document.querySelectorAll('tbody tr'),
         contenedorNumero = document.querySelector('.total-contactos span');
 
    let total=0;
    totalContactos.forEach(contacto => {
        if(contacto.style.display === '' || contacto.style.display === 'table-row'){
             total++;
        }
   });
  // console.log(total);
   contenedorNumero.textContent = total;
}