// Initialize the map
const map = L.map('map').setView([40.7128, -74.0060], 12);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample locations data
const locations = [
    {
        id: 1,
        name: "Central Park",
        lat: 40.7812,
        lng: -73.9665,
        category: "park",
        description: "A large public park in Manhattan with walking paths and lakes.",
        image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=500&q=60"
    },
    {
        id: 2,
        name: "Metropolitan Museum of Art",
        lat: 40.7794,
        lng: -73.9632,
        category: "museum",
        description: "One of the world's largest art museums.",
        image: "https://images.unsplash.com/photo-1596383526467-59579c5e6a89?w=500&q=60"
    },
    {
        id: 3,
        name: "Statue of Liberty",
        lat: 40.6892,
        lng: -74.0445,
        category: "landmark",
        description: "Iconic statue in New York Harbor.",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=500&q=60"
    },
    {
        id: 4,
        name: "Empire State Building",
        lat: 40.7484,
        lng: -73.9857,
        category: "landmark",
        description: "Famous skyscraper with observation decks.",
        image: "https://images.unsplash.com/photo-1502104034360-73176bb1e92e?w=500&q=60"
    },
    {
        id: 5,
        name: "Brooklyn Bridge",
        lat: 40.7061,
        lng: -73.9969,
        category: "landmark",
        description: Historic bridge connecting Manhattan and Brooklyn.",
        image: "https://images.unsplash.com/photo-1508004680779-013ba5954e72?w=500&q=60"
    }
];

// Store all markers
let allMarkers = [];

// Create custom icons
function createCustomIcon(category) {
    const colors = {
        landmark: 'red',
        museum: 'blue',
        park: 'green',
        restaurant: 'orange'
    };
    
    return L.divIcon({
        html: `<div style="background-color: ${colors[category] || 'gray'}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${category.charAt(0).toUpperCase()}</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// Add markers to map
function addMarkersToMap(locationsArray) {
    // Clear existing markers
    allMarkers.forEach(marker => map.removeLayer(marker));
    allMarkers = [];
    
    locationsArray.forEach(location => {
        const marker = L.marker([location.lat, location.lng], {
            icon: createCustomIcon(location.category)
        });
        
        // Create popup content
        const popupContent = `
            <div style="max-width: 250px;">
                <h3 style="margin: 0 0 5px 0; color: #2c3e50;">${location.name}</h3>
                <span style="background: ${getCategoryColor(location.category)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${location.category}</span>
                ${location.image ? `<img src="${location.image}" alt="${location.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px; margin: 8px 0;">` : ''}
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #555;">${location.description}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event
        marker.on('click', function() {
            map.setView([location.lat, location.lng], 15, {
                animate: true,
                duration: 1
            });
        });
        
        marker.addTo(map);
        allMarkers.push(marker);
    });
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        landmark: '#e74c3c',
        museum: '#3498db',
        park: '#27ae60',
        restaurant: '#f39c12'
    };
    return colors[category] || '#95a5a6';
}

// Populate location list
function populateLocationList(locationsArray) {
    const container = document.getElementById('locations-container');
    container.innerHTML = '';
    
    locationsArray.forEach(location => {
        const item = document.createElement('li');
        item.className = 'location-item';
        item.innerHTML = `
            <div class="location-name">${location.name} 
                <span class="location-category">${location.category}</span>
            </div>
            <div class="location-description">${location.description}</div>
        `;
        
        item.addEventListener('click', () => {
            map.setView([location.lat, location.lng], 15, {
                animate: true,
                duration: 1
            });
            
            // Find and open the marker's popup
            allMarkers.forEach(marker => {
                const latLng = marker.getLatLng();
                if (latLng.lat === location.lat && latLng.lng === location.lng) {
                    marker.openPopup();
                }
            });
        });
        
        container.appendChild(item);
    });
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    
    let results = locations;
    
    // Filter by category
    if (category !== 'all') {
        results = results.filter(location => location.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        results = results.filter(location => 
            location.name.toLowerCase().includes(searchTerm) ||
            location.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update map and list
    addMarkersToMap(results);
    populateLocationList(results);
    
    // Adjust map view to show all results
    if (results.length > 0) {
        const group = new L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Initialize the application
function initApp() {
    // Add initial markers
    addMarkersToMap(locations);
    populateLocationList(locations);
    
    // Set up event listeners
    document.getElementById('search-btn').addEventListener('click', performSearch);
    
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    document.getElementById('category-filter').addEventListener('change', performSearch);
    
    // Current location button
    document.getElementById('current-location-btn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    map.setView([lat, lng], 15, {
                        animate: true,
                        duration: 1
                    });
                    
                    // Add temporary marker
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: '<div style="background-color: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map);
                    
                    marker.bindPopup('You are here!').openPopup();
                    
                    // Remove after 5 seconds
                    setTimeout(() => {
                        map.removeLayer(marker);
                    }, 5000);
                },
                function(error) {
                    alert('Could not get your location. Please check your browser permissions.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
    
    console.log('Map application initialized successfully!');
    console.log('Try searching for: "central", "museum", or "statue"');
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initApp);
