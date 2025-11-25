// Initialize the map
const map = L.map('map').setView([40.7128, -74.0060], 12); // Default to New York

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Sample locations data
const locations = [
    {
        id: 1,
        name: "Central Park",
        lat: 40.7812,
        lng: -73.9665,
        category: "park",
        description: "A large public park in the heart of Manhattan, featuring walking paths, lakes, and recreational facilities.",
        image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 2,
        name: "Metropolitan Museum of Art",
        lat: 40.7794,
        lng: -73.9632,
        category: "museum",
        description: "One of the world's largest and finest art museums with collections spanning 5,000 years of world culture.",
        image: "https://images.unsplash.com/photo-1596383526467-59579c5e6a89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 3,
        name: "Statue of Liberty",
        lat: 40.6892,
        lng: -74.0445,
        category: "landmark",
        description: "A colossal neoclassical sculpture on Liberty Island in New York Harbor, a gift from France to the United States.",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 4,
        name: "Empire State Building",
        lat: 40.7484,
        lng: -73.9857,
        category: "landmark",
        description: "A 102-story Art Deco skyscraper in Midtown Manhattan, offering observation decks with panoramic city views.",
        image: "https://images.unsplash.com/photo-1502104034360-73176bb1e92e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 5,
        name: "Brooklyn Bridge",
        lat: 40.7061,
        lng: -73.9969,
        category: "landmark",
        description: "A hybrid cable-stayed/suspension bridge connecting Manhattan and Brooklyn, offering stunning views of the city skyline.",
        image: "https://images.unsplash.com/photo-1508004680779-013ba5954e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 6,
        name: "American Museum of Natural History",
        lat: 40.7813,
        lng: -73.9740,
        category: "museum",
        description: "One of the largest natural history museums in the world, featuring exhibits on human cultures, the natural world, and the universe.",
        image: "https://images.unsplash.com/photo-1580651315532-97c1b95c687a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: 7,
        name: "High Line",
        lat: 40.7480,
        lng: -74.0048,
        category: "park",
        description: "A 1.45-mile-long elevated linear park built on a former New York Central Railroad spur on the west side of Manhattan.",
        image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
];

// Create custom icons for different categories
const iconColors = {
    landmark: 'red',
    museum: 'blue',
    park: 'green',
    restaurant: 'orange'
};

// Create marker cluster group
const markers = L.markerClusterGroup();

// Function to create custom icon
function createCustomIcon(category) {
    return L.divIcon({
        html: `<div style="background-color: ${iconColors[category]}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${category.charAt(0).toUpperCase()}</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// Add markers to the map
locations.forEach(location => {
    const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(location.category)
    });
    
    // Create popup content
    const popupContent = `
        <div class="popup-content">
            <div class="popup-title">${location.name}</div>
            <span class="popup-category">${location.category}</span>
            ${location.image ? `<img src="${location.image}" alt="${location.name}" class="popup-image">` : ''}
            <p class="popup-description">${location.description}</p>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Add animation on click
    marker.on('click', function() {
        // Animate marker
        marker.setZIndexOffset(1000);
        
        // Center map on marker with smooth animation
        map.flyTo([location.lat, location.lng], 15, {
            duration: 1
        });
    });
    
    markers.addLayer(marker);
});

// Add markers to the map
map.addLayer(markers);

// Populate location list
function populateLocationList(filteredLocations = locations) {
    const locationsContainer = document.getElementById('locations-container');
    locationsContainer.innerHTML = '';
    
    filteredLocations.forEach(location => {
        const listItem = document.createElement('li');
        listItem.className = 'location-item';
        listItem.innerHTML = `
            <div class="location-name">${location.name} <span class="location-category">${location.category}</span></div>
            <div class="location-description">${location.description}</div>
        `;
        
        listItem.addEventListener('click', () => {
            map.flyTo([location.lat, location.lng], 15, {
                duration: 1
            });
            
            // Open the popup for this location
            markers.getLayers().forEach(marker => {
                if (marker.getLatLng().lat === location.lat && marker.getLatLng().lng === location.lng) {
                    marker.openPopup();
                }
            });
        });
        
        locationsContainer.appendChild(listItem);
    });
}

// Initial population of location list
populateLocationList();

// Search functionality
document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filteredLocations = locations;
    
    // Apply search filter
    if (searchTerm) {
        filteredLocations = filteredLocations.filter(location => 
            location.name.toLowerCase().includes(searchTerm) || 
            location.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredLocations = filteredLocations.filter(location => location.category === categoryFilter);
    }
    
    // Update location list
    populateLocationList(filteredLocations);
    
    // Show/hide markers based on filters
    markers.clearLayers();
    
    filteredLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng], {
            icon: createCustomIcon(location.category)
        });
        
        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">${location.name}</div>
                <span class="popup-category">${location.category}</span>
                ${location.image ? `<img src="${location.image}" alt="${location.name}" class="popup-image">` : ''}
                <p class="popup-description">${location.description}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('click', function() {
            marker.setZIndexOffset(1000);
            map.flyTo([location.lat, location.lng], 15, {
                duration: 1
            });
        });
        
        markers.addLayer(marker);
    });
    
    map.addLayer(markers);
    
    // If there are filtered results, adjust map view to show them
    if (filteredLocations.length > 0) {
        const group = new L.featureGroup(markers.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Category filter functionality
document.getElementById('category-filter').addEventListener('change', performSearch);

// Current location functionality
document.getElementById('current-location-btn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                map.flyTo([lat, lng], 15, {
                    duration: 1
                });
                
                // Add a marker for current location
                const currentLocationMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: '<div style="background-color: #e74c3c; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
                        className: 'current-location-marker',
                        iconSize: [25, 25],
                        iconAnchor: [12, 12]
                    })
                }).addTo(map);
                
                currentLocationMarker.bindPopup('You are here!').openPopup();
                
                // Remove the marker after 5 seconds
                setTimeout(() => {
                    map.removeLayer(currentLocationMarker);
                }, 5000);
            },
            function(error) {
                alert('Unable to retrieve your location. Please ensure location services are enabled.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
