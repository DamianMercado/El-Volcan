function marcarEntregado(boton) {
    const pedido = boton.closest('.pedido');
    const estado = pedido.querySelector('.estado');
    estado.textContent = 'Entregado';
    estado.classList.add('entregado');
    boton.textContent = 'Entregado';
    boton.disabled = true;

    agregarAlHistorial(pedido);
}

function agregarAlHistorial(pedido) {
    const historial = document.getElementById('vista-historial');
    const item = pedido.cloneNode(true);
    item.classList.add('historial');

    const boton = item.querySelector('.btn-entregar');
    if (boton) {
        boton.remove();
    }

    const fecha = document.createElement('p');
    fecha.classList.add('fecha');
    const hoy = new Date().toLocaleDateString('es-CL');
    fecha.textContent = `Entregado el ${hoy}`;
    item.appendChild(fecha);

    historial.insertBefore(item, historial.querySelector('h2').nextSibling);
}

function mostrarVista(vista) {
    const vistaPendientes = document.getElementById('vista-pendientes');
    const vistaHistorial = document.getElementById('vista-historial');
    const tabPendientes = document.getElementById('tab-pendientes');
    const tabHistorial = document.getElementById('tab-historial');

    const esHistorial = vista === 'historial';

    vistaPendientes.hidden = esHistorial;
    vistaHistorial.hidden = !esHistorial;
    tabPendientes.classList.toggle('active', !esHistorial);
    tabHistorial.classList.toggle('active', esHistorial);
}
