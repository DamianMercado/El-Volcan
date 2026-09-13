function marcarEntregado(boton) {
    const pedido = boton.closest('.pedido');
    const estado = pedido.querySelector('.estado');
    estado.textContent = 'Entregado';
    estado.classList.add('entregado');
    pedido.classList.add('entregado');
    boton.textContent = 'Entregado';
    boton.disabled = true;

    if (pedido.marcador) {
        pedido.marcador.setIcon(crearIcono('pin-entregado'));
    }

    agregarAlHistorial(pedido);
}

function crearIcono(clase) {
    return L.divIcon({
        className: `pin ${clase}`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -22]
    });
}

function initMapa() {
    const contenedor = document.getElementById('mapa');
    if (!contenedor || typeof L === 'undefined') return;

    const mapa = L.map('mapa').setView([-33.445, -70.66], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    const puntos = [];

    document.querySelectorAll('#vista-pendientes .pedido').forEach(pedido => {
        const lat = parseFloat(pedido.dataset.lat);
        const lng = parseFloat(pedido.dataset.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const titulo = pedido.querySelector('h3').textContent;
        const parrafos = Array.from(pedido.querySelectorAll('p'));
        const cliente = parrafos.find(p => p.textContent.includes('Cliente'));
        const direccion = parrafos.find(p => p.textContent.includes('Direccion'));
        const entregado = pedido.classList.contains('entregado');

        const marcador = L.marker([lat, lng], {
            icon: crearIcono(entregado ? 'pin-entregado' : 'pin-pendiente')
        }).addTo(mapa);

        marcador.bindPopup(
            `<strong>${titulo}</strong><br>${cliente ? cliente.textContent : ''}<br>${direccion ? direccion.textContent : ''}`
        );

        pedido.marcador = marcador;
        puntos.push([lat, lng]);
    });

    if (puntos.length) {
        mapa.fitBounds(puntos, { padding: [30, 30] });
    }
}

document.addEventListener('DOMContentLoaded', initMapa);

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
