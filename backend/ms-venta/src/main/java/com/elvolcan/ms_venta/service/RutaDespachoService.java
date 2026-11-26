package com.elvolcan.ms_venta.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class RutaDespachoService {

    private static final Logger log = LoggerFactory.getLogger(RutaDespachoService.class);
    private static final String USER_AGENT = "ElVolcanGasApp/1.0 (contacto@el-volcan.com)";
    private static final int MINUTOS_PREPARACION_PLANTA = 10;
    private static final double VELOCIDAD_URBANA_KMH = 28.0;

    private record Planta(String nombre, double lat, double lon) {}

    private static final List<Planta> PLANTAS = List.of(
            new Planta("Puente Alto", -33.6117, -70.5758),
            new Planta("La Florida", -33.5228, -70.5983),
            new Planta("Santiago", -33.4489, -70.6693),
            new Planta("Chillán", -36.6066, -72.1034)
    );

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public RutaDespachoService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    public Map<String, Object> calcularDatosEntrega(String direccion, String comuna, boolean enRuta) {
        Map<String, Object> resultado = new LinkedHashMap<>();

        String dirLimpia = limpiarDireccionParaGeocoding(direccion);
        String comunaLimpia = comuna != null ? comuna.trim() : "";

        String direccionCompleta = dirLimpia;
        if (!comunaLimpia.isEmpty() && !normalizarTexto(dirLimpia).contains(normalizarTexto(comunaLimpia))) {
            direccionCompleta = dirLimpia.isEmpty() ? comunaLimpia : dirLimpia + ", " + comunaLimpia;
        }
        resultado.put("direccion_entrega", direccionCompleta);

        double[] destino = geocodificarDireccion(dirLimpia, comunaLimpia);
        Planta planta = seleccionarPlanta(comunaLimpia, destino);
        resultado.put("planta", planta.nombre());
        resultado.put("origen_planta", Map.of(
                "type", "Point",
                "coordinates", List.of(planta.lon(), planta.lat())
        ));

        if (destino == null) {
            log.warn("No se pudo geocodificar la dirección '{}' (comuna '{}')", direccion, comuna);
            return resultado;
        }

        double latDestino = destino[0];
        double lonDestino = destino[1];
        resultado.put("ubicacion", Map.of(
                "type", "Point",
                "coordinates", List.of(lonDestino, latDestino)
        ));

        double[] rutaOsrm = consultarRutaOsrm(planta.lat(), planta.lon(), latDestino, lonDestino);
        double distanciaKm;
        int minutosConduccion;
        String fuente;

        if (rutaOsrm != null) {
            distanciaKm = redondearUnDecimal(Math.max(0.1, rutaOsrm[0] / 1000.0));
            minutosConduccion = Math.max(1, (int) Math.ceil(rutaOsrm[1] / 60.0));
            fuente = "OSRM + Nominatim (OpenStreetMap)";
        } else {
            double haversineKm = calcularHaversineKm(planta.lat(), planta.lon(), latDestino, lonDestino) * 1.25;
            distanciaKm = redondearUnDecimal(Math.max(0.2, haversineKm));
            minutosConduccion = Math.max(2, (int) Math.ceil((distanciaKm / VELOCIDAD_URBANA_KMH) * 60.0));
            fuente = "Haversine + Nominatim (OpenStreetMap)";
        }

        int tiempoEstimado = enRuta ? minutosConduccion : (minutosConduccion + MINUTOS_PREPARACION_PLANTA);
        resultado.put("distancia_km", distanciaKm);
        resultado.put("tiempo_ruta_min", minutosConduccion);
        resultado.put("tiempo_estimado_min", tiempoEstimado);
        resultado.put("fuente_calculo", fuente);

        log.info("Ruta calculada [{} -> {}]: {} km, conducción {} min, estimado {} min ({})",
                planta.nombre(), direccionCompleta, distanciaKm, minutosConduccion, tiempoEstimado, fuente);

        return resultado;
    }

    private double[] geocodificarDireccion(String dirLimpia, String comunaLimpia) {
        if (dirLimpia != null && !dirLimpia.isBlank()) {
            String consulta = (!comunaLimpia.isBlank()
                    && !normalizarTexto(dirLimpia).contains(normalizarTexto(comunaLimpia)))
                    ? dirLimpia + ", " + comunaLimpia + ", Chile"
                    : dirLimpia + ", Chile";
            double[] coords = consultarNominatim(consulta);
            if (coords != null) {
                return coords;
            }
        }

        if (comunaLimpia != null && !comunaLimpia.isBlank()) {
            return consultarNominatim(comunaLimpia + ", Chile");
        }
        return null;
    }

    private double[] consultarNominatim(String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cl&q=" + encoded;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 || response.body() == null || response.body().isBlank()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (root.isArray() && !root.isEmpty()) {
                JsonNode primero = root.get(0);
                double lat = primero.path("lat").asDouble(Double.NaN);
                double lon = primero.path("lon").asDouble(Double.NaN);
                if (!Double.isNaN(lat) && !Double.isNaN(lon)) {
                    return new double[]{lat, lon};
                }
            }
        } catch (Exception e) {
            log.warn("Error consultando Nominatim para '{}': {}", query, e.getMessage());
        }
        return null;
    }

    private double[] consultarRutaOsrm(double latOrigen, double lonOrigen, double latDestino, double lonDestino) {
        try {
            String url = String.format(
                    Locale.US,
                    "https://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false",
                    lonOrigen, latOrigen, lonDestino, latDestino
            );
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 || response.body() == null || response.body().isBlank()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode routes = root.path("routes");
            if (routes.isArray() && !routes.isEmpty()) {
                JsonNode ruta = routes.get(0);
                double distance = ruta.path("distance").asDouble(Double.NaN);
                double duration = ruta.path("duration").asDouble(Double.NaN);
                if (!Double.isNaN(distance) && !Double.isNaN(duration) && distance >= 0 && duration >= 0) {
                    return new double[]{distance, duration};
                }
            }
        } catch (Exception e) {
            log.warn("Error consultando OSRM: {}", e.getMessage());
        }
        return null;
    }

    private Planta seleccionarPlanta(String comuna, double[] destino) {
        String comunaNorm = normalizarTexto(comuna);
        for (Planta p : PLANTAS) {
            if (!comunaNorm.isEmpty() && comunaNorm.contains(normalizarTexto(p.nombre()))) {
                return p;
            }
        }
        if (destino != null) {
            Planta masCercana = PLANTAS.get(0);
            double menorDist = Double.MAX_VALUE;
            for (Planta p : PLANTAS) {
                double d = calcularHaversineKm(p.lat(), p.lon(), destino[0], destino[1]);
                if (d < menorDist) {
                    menorDist = d;
                    masCercana = p;
                }
            }
            return masCercana;
        }
        return PLANTAS.get(0);
    }

    private String limpiarDireccionParaGeocoding(String direccion) {
        if (direccion == null) return "";
        return direccion
                .replace("#", "")
                .replaceAll("(?i),?\\s*(depto|departamento|dpto|block|oficina|piso)\\s*[\\w-]+", "")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private String normalizarTexto(String texto) {
        if (texto == null) return "";
        String sinTildes = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return sinTildes.toLowerCase(Locale.ROOT).trim();
    }

    private double calcularHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double radioTierraKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radioTierraKm * c;
    }

    private double redondearUnDecimal(double valor) {
        return Math.round(valor * 10.0) / 10.0;
    }
}
