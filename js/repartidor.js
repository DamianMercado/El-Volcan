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
        pedido.marcador.off('click');
    }

    const lat = parseFloat(pedido.dataset.lat);
    const lng = parseFloat(pedido.dataset.lng);
    if (rutaActivaLatLng && rutaActivaLatLng.lat === lat && rutaActivaLatLng.lng === lng) {
        limpiarRuta();
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

let mapaGlobal = null;
let repartidorLatLng = null;
let controlRuta = null;
let rutaActivaLatLng = null;

async function geocodificarRepartidor() {
    const perfil = document.querySelector('.perfil .nombre');
    const comuna = perfil?.dataset.comuna;
    const provincia = perfil?.dataset.provincia;
    const region = perfil?.dataset.region;
    if (!comuna) return null;

    const consulta = [comuna, provincia, region, 'Chile'].filter(Boolean).join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`;

    try {
        const respuesta = await fetch(url, { headers: { 'Accept-Language': 'es' } });
        const datos = await respuesta.json();
        if (datos && datos.length) {
            return { lat: parseFloat(datos[0].lat), lng: parseFloat(datos[0].lon), nombre: consulta };
        }
    } catch (error) {
        console.error('No se pudo geocodificar la ubicación del repartidor', error);
    }
    return null;
}

function limpiarRuta() {
    if (controlRuta && mapaGlobal) {
        mapaGlobal.removeControl(controlRuta);
    }
    controlRuta = null;
    rutaActivaLatLng = null;
}

function trazarRuta(lat, lng) {
    if (!mapaGlobal || !repartidorLatLng || typeof L.Routing === 'undefined') return;

    limpiarRuta();

    controlRuta = L.Routing.control({
        waypoints: [repartidorLatLng, L.latLng(lat, lng)],
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        lineOptions: { styles: [{ color: '#2358b9', weight: 5, opacity: 0.85 }] },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null
    }).addTo(mapaGlobal);
    rutaActivaLatLng = { lat, lng };
}

async function initMapa() {
    const contenedor = document.getElementById('mapa');
    if (!contenedor || typeof L === 'undefined') return;

    const mapa = L.map('mapa').setView([-33.445, -70.66], 14);
    mapaGlobal = mapa;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(mapa);

    const puntos = [];

    const ubicacionRepartidor = await geocodificarRepartidor();
    if (ubicacionRepartidor) {
        repartidorLatLng = L.latLng(ubicacionRepartidor.lat, ubicacionRepartidor.lng);
        L.marker(repartidorLatLng, { icon: crearIcono('pin-repartidor') })
            .addTo(mapa)
            .bindPopup(`<strong>Tú (Repartidor)</strong><br>${ubicacionRepartidor.nombre}`);
        puntos.push([ubicacionRepartidor.lat, ubicacionRepartidor.lng]);
    }

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

        if (!entregado) {
            marcador.on('click', () => trazarRuta(lat, lng));
        }

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
