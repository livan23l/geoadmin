import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css'; // Asegúrate de tener este archivo o elimina esta línea si no lo usas

// Iconos personalizados
const iconos = {
  regado: L.divIcon({ className: 'punto verde' }),
  reciente: L.divIcon({ className: 'punto amarillo' }),
  noRegado: L.divIcon({ className: 'punto rojo' }),
};

const estados = ['regado', 'reciente', 'noRegado'];

function PuntoRiego({ punto, onRemove }) {
  return (
    <Marker
      position={punto.pos}
      icon={iconos[punto.estado]}
      eventHandlers={{ contextmenu: () => onRemove(punto.id) }}
    >
      <Popup>
        Estado: {punto.estado}
        <br />
        (Click derecho para eliminar)
      </Popup>
    </Marker>
  );
}

function ManejadorClick({ onAdd }) {
  useMapEvents({
    click(e) {
      const nuevoPunto = {
        id: Date.now(),
        pos: [e.latlng.lat, e.latlng.lng],
        estado: estados[Math.floor(Math.random() * estados.length)],
      };
      onAdd(nuevoPunto);
    },
  });
  return null;
}

function MapaRiego() {
  const [puntos, setPuntos] = useState([]);

  const agregarPunto = (p) => setPuntos([...puntos, p]);
  const quitarPunto = (id) => setPuntos(puntos.filter(p => p.id !== id));

  return (
    <div className="h-screen w-screen">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={[[0, 0], [1000, 1000]]}
        style={{ height: '100vh', width: '100vw' }}
      >
        <ImageOverlay url="/mapa.jpeg" bounds={[[0, 0], [1000, 1000]]} />
        <ManejadorClick onAdd={agregarPunto} />
        {puntos.map(p => (
          <PuntoRiego key={p.id} punto={p} onRemove={quitarPunto} />
        ))}
      </MapContainer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MapaRiego />);
