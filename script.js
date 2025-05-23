// List of POIs in Dublin
const pois = [
    { name: "Trinity College", lat: 53.3438, lng: -6.2546 },
    { name: "Guinness Storehouse", lat: 53.3419, lng: -6.2869 },
    { name: "Dublin Castle", lat: 53.3431, lng: -6.2675 },
    { name: "Phoenix Park", lat: 53.3550, lng: -6.3290 },
    { name: "St. Stephen's Green", lat: 53.3372, lng: -6.2591 }
];

// Dummy travel times in minutes (public transport, taxi)
const travelTimes = {
    "Trinity College": {
        "Guinness Storehouse": { public: 18, taxi: 10 },
        "Dublin Castle": { public: 10, taxi: 5 },
        "Phoenix Park": { public: 30, taxi: 18 },
        "St. Stephen's Green": { public: 8, taxi: 4 }
    },
    "Guinness Storehouse": {
        "Trinity College": { public: 18, taxi: 10 },
        "Dublin Castle": { public: 12, taxi: 7 },
        "Phoenix Park": { public: 20, taxi: 12 },
        "St. Stephen's Green": { public: 22, taxi: 13 }
    },
    "Dublin Castle": {
        "Trinity College": { public: 10, taxi: 5 },
        "Guinness Storehouse": { public: 12, taxi: 7 },
        "Phoenix Park": { public: 28, taxi: 16 },
        "St. Stephen's Green": { public: 7, taxi: 3 }
    },
    "Phoenix Park": {
        "Trinity College": { public: 30, taxi: 18 },
        "Guinness Storehouse": { public: 20, taxi: 12 },
        "Dublin Castle": { public: 28, taxi: 16 },
        "St. Stephen's Green": { public: 32, taxi: 20 }
    },
    "St. Stephen's Green": {
        "Trinity College": { public: 8, taxi: 4 },
        "Guinness Storehouse": { public: 22, taxi: 13 },
        "Dublin Castle": { public: 7, taxi: 3 },
        "Phoenix Park": { public: 32, taxi: 20 }
    }
};

// Initialize map
const map = L.map('map').setView([53.3498, -6.2603], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add POI markers
pois.forEach(poi => {
    const marker = L.marker([poi.lat, poi.lng], {
        icon: L.divIcon({
            className: 'poi-label',
            html: `<div>${poi.name}</div>`,
            iconAnchor: [0, 9] // anchor at left edge, vertically centered
        })
    }).addTo(map);
    marker.on('click', () => {
        showTravelTimes(poi.name);
        showPoiDetails(poi.name);
    });
});

function showTravelTimes(selectedPoi) {
    // Remove existing polylines and labels
    if (window.travelLines) {
        window.travelLines.forEach(l => map.removeLayer(l));
    }
    window.travelLines = [];
    if (window.travelLabels) {
        window.travelLabels.forEach(l => map.removeLayer(l));
    }
    window.travelLabels = [];

    // Draw lines and labels to other POIs
    const fromPoi = pois.find(p => p.name === selectedPoi);
    window.travelLines = [];
    window.travelLabels = [];
    for (const dest in travelTimes[selectedPoi]) {
        const toPoi = pois.find(p => p.name === dest);
        if (toPoi) {
            // Draw line
            const polyline = L.polyline([
                [fromPoi.lat, fromPoi.lng],
                [toPoi.lat, toPoi.lng]
            ], { color: '#0074D9', weight: 3, opacity: 0.7, dashArray: '5, 10' }).addTo(map);
            window.travelLines.push(polyline);
            // Add label at midpoint with icons and much smaller text
            const midLat = (fromPoi.lat + toPoi.lat) / 2;
            const midLng = (fromPoi.lng + toPoi.lng) / 2;
            const label = L.marker([midLat, midLng], {
                icon: L.divIcon({
                    className: 'travel-label',
                    html: `<div><span class='icon-time'>🚍 ${travelTimes[selectedPoi][dest].public}</span><br><span class='icon-time'>🚕 ${travelTimes[selectedPoi][dest].taxi}</span></div>`
                }),
                interactive: false
            }).addTo(map);
            window.travelLabels.push(label);
        }
    }
}

function showPoiDetails(poiName) {
    const poi = pois.find(p => p.name === poiName);
    if (!poi) return;
    const detailsPane = document.getElementById('poi-details');
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.lat + ',' + poi.lng)}`;
    detailsPane.innerHTML = `
        <div class="details-content">
            <h3>${poi.name}</h3>
            <p>Latitude: ${poi.lat.toFixed(4)}, Longitude: ${poi.lng.toFixed(4)}</p>
            <a href="${gmapsUrl}" target="_blank" rel="noopener" class="gmaps-link">Open in Google Maps</a>
        </div>
    `;
    detailsPane.style.display = 'block';
}
