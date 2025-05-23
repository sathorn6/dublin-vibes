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
    const marker = L.marker([poi.lat, poi.lng]).addTo(map);
    marker.bindPopup(`<b>${poi.name}</b>`);
    marker.on('click', () => showTravelTimes(poi.name));
});

function showTravelTimes(selectedPoi) {
    const infoDiv = document.getElementById('info');
    let html = `<h2>${selectedPoi}</h2><table><tr><th>Destination</th><th>Public Transport (min)</th><th>Taxi (min)</th></tr>`;
    for (const dest in travelTimes[selectedPoi]) {
        html += `<tr><td>${dest}</td><td>${travelTimes[selectedPoi][dest].public}</td><td>${travelTimes[selectedPoi][dest].taxi}</td></tr>`;
    }
    html += '</table>';
    infoDiv.innerHTML = html;
}
