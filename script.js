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
    window.poiMarkers = [];
    window.pois.forEach(poi => {
        // Use createPoiLabel for initial label (no travel times)
        const labelDiv = createPoiLabel(poi, []);
        labelDiv.id = `poi-label-${encodeURIComponent(poi.name)}`;
        const marker = L.marker([poi.coordinates.lat, poi.coordinates.lng], {
            icon: L.divIcon({
                className: 'poi-label',
                html: labelDiv.outerHTML,
                iconAnchor: [0, 9]
            })
        }).addTo(map);
        marker.poiName = poi.name;
        marker.on('click', () => {
            showTravelTimes(poi.name);
            showPoiDetails(poi.name);
        });
        window.poiMarkers.push(marker);
    });
}

function createPoiLabel(poi, travelTimes) {
  // Create the main container
  const container = document.createElement('div');
  container.className = 'poi-label-content';

  // Add the location dot
  const dot = document.createElement('div');
  dot.className = 'poi-location-dot';
  container.appendChild(dot);

  // Add the POI name
  const title = document.createElement('div');
  title.className = 'poi-title';
  title.textContent = poi.name;
  container.appendChild(title);

  // Add travel times below the name
  if (travelTimes && travelTimes.length > 0) {
    const travelTimesContainer = document.createElement('div');
    travelTimesContainer.className = 'travel-times-mini';
    travelTimes.forEach(tt => {
      const row = document.createElement('div');
      row.className = 'travel-times-mini-col';
      if (tt.icon) {
        const icon = document.createElement('span');
        icon.className = 'icon-time-mini';
        icon.innerHTML = tt.icon;
        row.appendChild(icon);
      }
      const time = document.createElement('span');
      time.className = 'icon-time-mini';
      time.textContent = tt.time;
      row.appendChild(time);
      travelTimesContainer.appendChild(row);
    });
    container.appendChild(travelTimesContainer);
  }

  return container;
}

function showTravelTimes(selectedPoi) {
    // Remove previous travel time info from POI labels
    window.poiMarkers.forEach(marker => {
        const labelDiv = document.getElementById(`poi-label-${encodeURIComponent(marker.poiName)}`);
        if (labelDiv) {
            // Rebuild the label with only the dot and name
            labelDiv.innerHTML = '';
            const dot = document.createElement('div');
            dot.className = 'poi-location-dot';
            labelDiv.appendChild(dot);
            const title = document.createElement('div');
            title.className = 'poi-title';
            title.textContent = marker.poiName;
            labelDiv.appendChild(title);
            // Force Leaflet to redraw the icon
            marker.setIcon(L.divIcon({
                className: 'poi-label',
                html: labelDiv.outerHTML,
                iconAnchor: [0, 9]
            }));
        }
    });

    const fromPoi = window.poiMap[selectedPoi];
    if (!fromPoi) return;
    const travelTimes = fromPoi.travel_times || {};
    for (const dest in travelTimes) {
        const toPoi = window.poiMap[dest];
        if (toPoi) {
            const marker = window.poiMarkers.find(m => m.poiName === dest);
            if (marker) {
                const labelDiv = document.createElement('div');
                labelDiv.className = 'poi-label-content';
                labelDiv.id = `poi-label-${encodeURIComponent(dest)}`;
                // dot
                const dot = document.createElement('div');
                dot.className = 'poi-location-dot';
                labelDiv.appendChild(dot);
                // title
                const title = document.createElement('div');
                title.className = 'poi-title';
                title.textContent = dest;
                labelDiv.appendChild(title);
                // travel times
                const travelTimesContainer = document.createElement('div');
                travelTimesContainer.className = 'travel-times-mini';
                const modes = Object.keys(travelTimes[dest]);
                modes.forEach(mode => {
                    const row = document.createElement('div');
                    row.className = 'travel-times-mini-col';
                    let icon = mode === 'taxi' ? '🚕' : mode === 'public_transport' ? '🚍' : mode === 'walking' ? '🚶' : mode === 'tour_bus' ? '🚌' : '';
                    if (icon) {
                      const iconSpan = document.createElement('span');
                      iconSpan.className = 'icon-time-mini';
                      iconSpan.innerHTML = icon;
                      row.appendChild(iconSpan);
                    }
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'icon-time-mini';
                    timeSpan.textContent = travelTimes[dest][mode];
                    row.appendChild(timeSpan);
                    travelTimesContainer.appendChild(row);
                });
                labelDiv.appendChild(travelTimesContainer);
                // Force Leaflet to redraw the icon
                marker.setIcon(L.divIcon({
                    className: 'poi-label',
                    html: labelDiv.outerHTML,
                    iconAnchor: [0, 9]
                }));
            }
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
