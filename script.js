// Initialize map
const map = L.map('map').setView([53.3498, -6.2603], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load POIs and travel times from JSON
fetch('dublin_poi_with_travel_times.json')
    .then(response => response.json())
    .then(data => {
        window.pois = data;
        window.poiMap = {};
        data.forEach(poi => { window.poiMap[poi.name] = poi; });
        addPoiMarkers();
    });

function addPoiMarkers() {
    window.pois.forEach(poi => {
        const marker = L.marker([poi.coordinates.lat, poi.coordinates.lng], {
            icon: L.divIcon({
                className: 'poi-label',
                html: `<div>${poi.name}</div>`,
                iconAnchor: [0, 9]
            })
        }).addTo(map);
        marker.on('click', () => {
            showTravelTimes(poi.name);
            showPoiDetails(poi.name);
        });
    });
}

function showTravelTimes(selectedPoi) {
    if (window.travelLines) window.travelLines.forEach(l => map.removeLayer(l));
    window.travelLines = [];
    if (window.travelLabels) window.travelLabels.forEach(l => map.removeLayer(l));
    window.travelLabels = [];

    const fromPoi = window.poiMap[selectedPoi];
    if (!fromPoi) return;
    const travelTimes = fromPoi.travel_times || {};
    for (const dest in travelTimes) {
        const toPoi = window.poiMap[dest];
        if (toPoi) {
            const polyline = L.polyline([
                [fromPoi.coordinates.lat, fromPoi.coordinates.lng],
                [toPoi.coordinates.lat, toPoi.coordinates.lng]
            ], { color: '#0074D9', weight: 3, opacity: 0.7, dashArray: '5, 10' }).addTo(map);
            window.travelLines.push(polyline);
            // Find available modes
            const modes = Object.keys(travelTimes[dest]);
            let labelHtml = '';
            modes.forEach(mode => {
                let icon = mode === 'taxi' ? '🚕' : mode === 'public_transport' ? '🚍' : mode === 'walking' ? '🚶' : mode === 'tour_bus' ? '🚌' : '';
                labelHtml += `<span class='icon-time'>${icon} ${travelTimes[dest][mode]}</span><br>`;
            });
            const midLat = (fromPoi.coordinates.lat + toPoi.coordinates.lat) / 2;
            const midLng = (fromPoi.coordinates.lng + toPoi.coordinates.lng) / 2;
            const label = L.marker([midLat, midLng], {
                icon: L.divIcon({
                    className: 'travel-label',
                    html: `<div>${labelHtml}</div>`
                }),
                interactive: false
            }).addTo(map);
            window.travelLabels.push(label);
        }
    }
}

function showPoiDetails(poiName) {
    const poi = window.poiMap[poiName];
    if (!poi) return;
    const detailsPane = document.getElementById('poi-details');
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.coordinates.lat + ',' + poi.coordinates.lng)}`;
    detailsPane.innerHTML = `
        <div class="details-content">
            <h3>${poi.name}</h3>
            <p>${poi.description || ''}</p>
            <p>Latitude: ${poi.coordinates.lat.toFixed(4)}, Longitude: ${poi.coordinates.lng.toFixed(4)}</p>
            <a href="${gmapsUrl}" target="_blank" rel="noopener" class="gmaps-link">Open in Google Maps</a>
        </div>
    `;
    detailsPane.style.display = 'block';
}
