import { useEffect, useRef, useState } from "react";
import L from "./leafletGlobal"; // debe ir ANTES de leaflet-routing-machine
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// ---------- Funciones de apoyo (iguales a las del JS original) ----------

function crearIcono(clase) {
  return L.divIcon({
    className: `pin ${clase}`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });
}

// Antes leía data-comuna, data-provincia y data-region del header.
// Ahora recibe el objeto "repartidor" con esos datos.
async function geocodificarRepartidor(repartidor) {
  const { comuna, provincia, region } = repartidor;
  if (!comuna) return null;

  const consulta = [comuna, provincia, region, "Chile"].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`;

  try {
    const respuesta = await fetch(url, { headers: { "Accept-Language": "es" } });
    const datos = await respuesta.json();
    if (datos && datos.length) {
      return { lat: parseFloat(datos[0].lat), lng: parseFloat(datos[0].lon), nombre: consulta };
    }
  } catch (error) {
    console.error("No se pudo geocodificar la ubicación del repartidor", error);
  }
  return null;
}

// ---------- Componente ----------
// pedidos:       lista de pedidos de hoy (con lat y lng)
// repartidor:    datos del repartidor (comuna, provincia, region)
// destino:       pedido al que se le está trazando la ruta (o null)
// onSeleccionar: función que se llama al hacer clic en un punto rojo

export function MapaEntregas({ pedidos, repartidor, destino, onSeleccionar }) {
  const contenedorRef = useRef(null); // el <div> donde va el mapa
  const mapaRef = useRef(null);       // reemplaza a "mapaGlobal"
  const capaRef = useRef(null);       // grupo con los marcadores
  const ajustadoRef = useRef(false);  // para hacer fitBounds solo una vez

  // undefined = buscando, null = no se encontró, objeto = ubicación
  // reemplaza a "repartidorLatLng"
  const [ubicacion, setUbicacion] = useState(undefined);

  // 1) Crear el mapa una sola vez  (parte inicial de initMapa)
  useEffect(() => {
    const mapa = L.map(contenedorRef.current).setView([-33.445, -70.66], 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapa);

    capaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    // Al salir de la página se borra el mapa
    return () => {
      mapa.remove();
      mapaRef.current = null;
      capaRef.current = null;
      ajustadoRef.current = false;
    };
  }, []);

  // 2) Buscar la ubicación del repartidor  (geocodificarRepartidor)
  useEffect(() => {
    let cancelado = false;
    geocodificarRepartidor(repartidor).then((pos) => {
      if (!cancelado) setUbicacion(pos);
    });
    return () => {
      cancelado = true;
    };
  }, [repartidor]);

  // 3) Dibujar los marcadores. Se repite cada vez que cambian los pedidos,
  //    así un pedido entregado cambia solo a pin verde (antes: setIcon + off('click'))
  useEffect(() => {
    const mapa = mapaRef.current;
    const capa = capaRef.current;
    if (!mapa || !capa) return;

    capa.clearLayers();
    const puntos = [];

    if (ubicacion) {
      L.marker([ubicacion.lat, ubicacion.lng], { icon: crearIcono("pin-repartidor") })
        .bindPopup(`<strong>Tú (Repartidor)</strong><br>${ubicacion.nombre}`)
        .addTo(capa);
      puntos.push([ubicacion.lat, ubicacion.lng]);
    }

    pedidos.forEach((pedido) => {
      const marcador = L.marker([pedido.lat, pedido.lng], {
        icon: crearIcono(pedido.entregado ? "pin-entregado" : "pin-pendiente"),
      })
        .bindPopup(
          `<strong>Pedido #${pedido.id}</strong><br>Cliente: ${pedido.cliente}<br>Direccion: ${pedido.direccion}`
        )
        .addTo(capa);

      if (!pedido.entregado) {
        marcador.on("click", () => onSeleccionar(pedido));
      }
      puntos.push([pedido.lat, pedido.lng]);
    });

    // Encuadrar el mapa la primera vez (cuando ya se buscó al repartidor)
    if (!ajustadoRef.current && ubicacion !== undefined && puntos.length) {
      mapa.fitBounds(puntos, { padding: [30, 30] });
      ajustadoRef.current = true;
    }
  }, [pedidos, ubicacion, onSeleccionar]);

  // 4) Trazar la ruta hacia el destino  (trazarRuta + limpiarRuta)
  //    Cuando "destino" cambia o pasa a null, React ejecuta el "return"
  //    y la ruta anterior se borra sola.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !ubicacion || !destino || !L.Routing) return;

    const controlRuta = L.Routing.control({
      waypoints: [L.latLng(ubicacion.lat, ubicacion.lng), L.latLng(destino.lat, destino.lng)],
      router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
      lineOptions: { styles: [{ color: "#2358b9", weight: 5, opacity: 0.85 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(mapa);

    return () => {
      if (mapaRef.current === mapa) mapa.removeControl(controlRuta);
    };
  }, [destino, ubicacion]);

  return <div ref={contenedorRef} id="mapa" className="mapa"></div>;
}
