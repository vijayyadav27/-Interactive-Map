// API Configuration
const OPENCAGE_API_KEY = '8ec50afc35a642eebe1d88948b15f93a';
const BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Initialize the map
const map = L.map('map').setView([40.7128, -74.0060], 12);

// Add tile layer (OpenStreetMap - no API key required)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Store markers
let markers = [];
let currentLocationMarker = null;

// Sample fallback locations
const fallbackLocations = [
    {
        id: 1,
        name: "Central Park, New York",
        lat: 40.7812,
        lng: -73.9665,
        category: "park",
        description: "A large public park in Manhattan with walking paths and lakes."
    },
    {
        id: 2,
        name: "Times Square, New York",
        lat: 40.7580,
        lng: -73.9855,
        category: "landmark",
        description: "Famous commercial intersection and entertainment hub."
    },
    {
        id: 3,
        name: "Brooklyn Bridge, New York",
        lat: 40.7061,
        lng: -73.9969,
        category: "landmark",
        description: "Historic bridge connecting Manhattan and Brooklyn."
    },
    {
        id: 4,
        name: "Statue of Liberty, New York",
        lat: 40.6892,
        lng: -74.0445,
        category: "landmark",
        description: "Iconic statue in New York Harbor."
    },
    {
        id: 5,
        name: "Empire State Building, New York",
        lat: 40.7484,
        lng: -73.9857,
        category: "landmark",
        description: "Famous skyscraper with observation decks."
    }
];

// Hide API setup section since we have the key
document.addEventListener('DOMContentLoaded', function() {
    const apiSetupSection = document.querySelector('.api-setup');
    if (apiSetupSection) {
        apiSetupSection.style.display = 'none';
    }
});

// Create custom marker icon
function createCustomIcon(category, isCurrentLocation = false) {
    const colors = {
        landmark: '#e74c3c',
        park: '#27ae60',
        museum: '#3498db',
        restaurant: '#f39c12',
        current: '#9b59b6',
        searched: '#667eea'
    };
    
    const color = isCurrentLocation ? colors.current : colors[category] || colors.searched;
    const emoji = isCurrentLocation ? '📍' : 
                 category === 'landmark' ? '🏛️' :
                 category === 'park' ? '🌳' :
                 category === 'museum' ? '🏛️' :
                 category === 'restaurant' ? '🍽️' : '📌';
    
    return L.divIcon({
        html: `
            <div style="
                background-color: ${color};
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
            ">${emoji}</div>
        `,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// Geocoding function - Convert address to coordinates
async function geocodeAddress(address) {
    try {
        console.log(`🔍 Geocoding: ${address}`);
        
        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&limit=1&no_annotations=1`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const { lat, lng } = result.geometry;
            const locationName = result.formatted;
            
            console.log(`📍 Found: ${locationName} at ${lat}, ${lng}`);
            
            return {
                lat: lat,
                lng: lng,
                name: locationName,
                address: result.formatted,
                success: true
            };
        } else {
            throw new Error('No results found for this address. Try a more specific search.');
        }
        
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

// Reverse geocoding function - Convert coordinates to address
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `${BASE_URL}?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&limit=1`
        );
        
        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                address: result.formatted,
                components: result.components,
                success: true
            };
        } else {
            throw new Error('No address found');
        }
        
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return {
            address: 'Address not available',
            success: false
        };
    }
}

// Add marker to map
function addMarker(location, isCurrentLocation = false, isSearched = false) {
    const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(location.category, isCurrentLocation)
    }).addTo(map);
    
    // Get address for popup
    reverseGeocode(location.lat, location.lng).then(addressInfo => {
        const popupContent = `
            <div style="min-width: 280px; max-width: 300px;">
                <h3 style="margin: 0 0 12px 0; color: #2c3e50; border-bottom: 2px solid #f0f2f5; padding-bottom: 8px;">
                    ${location.name}
                </h3>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                    <strong style="color: #495057;">📍 Address:</strong><br>
                    <span style="color: #666; font-size: 14px;">${addressInfo.success ? addressInfo.address : 'Address not available'}</span>
                </div>
                ${location.description ? `
                <div style="color: #666; font-size: 14px; margin-bottom: 10px;">
                    <strong>📝 Description:</strong><br>
                    ${location.description}
                </div>
                ` : ''}
                <div style="margin-top: 8px; color: #7f8c8d; font-size: 12px; font-family: monospace;">
                    📍 ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
    });
    
    if (isCurrentLocation) {
        currentLocationMarker = marker;
    } else {
        markers.push(marker);
    }
    
    return marker;
}

// Clear all markers except current location
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Search functionality
async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Please enter a location to search for');
        return;
    }
    
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    // Show loading state
    const searchBtn = document.getElementById('search-btn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span class="btn-icon">⏳</span> Searching...';
    searchBtn.disabled = true;
    
    try {
        const result = await geocodeAddress(searchTerm);
        
        if (result.success) {
            // Clear previous markers (keep current location marker)
            clearMarkers();
            
            // Add new marker for searched location
            const location = {
                name: result.name,
                lat: result.lat,
                lng: result.lng,
                category: 'landmark',
                description: `Searched location: ${searchTerm}`
            };
            
            addMarker(location, false, true);
            
            // Center map on the found location
            map.setView([result.lat, result.lng], 15);
            
            // Update location list
            populateLocationList([location]);
            
            // Update coordinates display
            updateCoordinatesDisplay(result.lat, result.lng);
            
            console.log(`✅ Found and centered on: ${result.name}`);
            
            // Show success message
            showSearchStatus(`Found: ${result.name}`, 'success');
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showSearchStatus(`Search failed: ${error.message}`, 'error');
    } finally {
        // Reset button state
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

// Show search status message
function showSearchStatus(message, type) {
    // Create or update status element
    let statusEl = document.getElementById('search-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'search-status';
        statusEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        document.body.appendChild(statusEl);
    }
    
    statusEl.textContent = message;
    statusEl.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    statusEl.style.color = type === 'success' ? '#155724' : '#721c24';
    statusEl.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

// Get user's current location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    console.log('📍 Getting current location...');
    
    const locationBtn = document.getElementById('current-location-btn');
    const originalText = locationBtn.innerHTML;
    locationBtn.innerHTML = '<span class="btn-icon">⏳</span> Locating...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log(`📍 Current location: ${lat}, ${lng}`);
            
            // Remove previous current location marker
            if (currentLocationMarker) {
                map.removeLayer(currentLocationMarker);
            }
            
            // Get address for current location
            const addressInfo = await reverseGeocode(lat, lng);
            
            const currentLocation = {
                name: 'Your Current Location',
                lat: lat,
                lng: lng,
                category: 'current',
                description: addressInfo.success ? addressInfo.address : 'Your current position'
            };
            
            // Add current location marker
            addMarker(currentLocation, true);
            
            // Center map on current location
            map.setView([lat, lng], 15);
            
            // Update location list
            populateLocationList([currentLocation]);
            
            // Update coordinates display
            updateCoordinatesDisplay(lat, lng);
            
            console.log('✅ Current location marked');
            
            // Show success message
            showSearchStatus('Found your current location!', 'success');
            
            // Reset button
            locationBtn.innerHTML = originalText;
            locationBtn.disabled = false;
        },
        function(error) {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to retrieve your location. ';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
            }
            
            showSearchStatus(errorMessage, 'error');
            
            // Reset button
            locationBtn.innerHTML = originalText;
            locationBtn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Update coordinates display
function updateCoordinatesDisplay(lat, lng) {
    const coordsDisplay = document.querySelector('.coordinates-display');
    if (coordsDisplay) {
        coordsDisplay.innerHTML = `📍 Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

// Populate location list
function populateLocationList(locations) {
    const container = document.getElementById('locations-container');
    const countEl = document.getElementById('locations-count');
    
    container.innerHTML = '';
    countEl.textContent = locations.length;
    
    locations.forEach(location => {
        const li = document.createElement('li');
        li.className = 'location-item';
        li.innerHTML = `
            <div class="location-header">
                <div class="location-name">${location.name}</div>
                <div class="location-category">${location.category}</div>
            </div>
            <div class="location-description">${location.description}</div>
            <div class="location-coords">${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</div>
        `;
        
        li.addEventListener('click', function() {
            map.setView([location.lat, location.lng], 15);
            updateCoordinatesDisplay(location.lat, location.lng);
            
            // Find and open the marker popup
            const allMarkers = [...markers];
            if (currentLocationMarker) allMarkers.push(currentLocationMarker);
            
            allMarkers.forEach(marker => {
                const markerLatLng = marker.getLatLng();
                if (markerLatLng.lat === location.lat && markerLatLng.lng === location.lng) {
                    marker.openPopup();
                }
            });
        });
        
        container.appendChild(li);
    });
}

// Add click event to map for coordinates display
map.on('click', async function(e) {
    const { lat, lng } = e.latlng;
    
    console.log(`🗺️ Map clicked at: ${lat}, ${lng}`);
    updateCoordinatesDisplay(lat, lng);
    
    const addressInfo = await reverseGeocode(lat, lng);
    
    const popup = L.popup()
        .setLatLng([lat, lng])
        .setContent(`
            <div style="min-width: 250px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Clicked Location</h4>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                    <strong>📍 Address:</strong><br>
                    <span style="font-size: 14px; color: #666;">${addressInfo.address}</span>
                </div>
                <div style="color: #888; font-size: 12px; font-family: monospace;">
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </div>
            </div>
        `)
        .openOn(map);
});

// Initialize the application
function initApp() {
    console.log('🚀 Initializing Interactive Map Explorer');
    console.log('✅ API Key loaded: 8ec50afc35a642eebe1d88948b15f93a');
    
    // Hide API setup section
    const apiSetupSection = document.querySelector('.api-setup');
    if (apiSetupSection) {
        apiSetupSection.style.display = 'none';
    }
    
    // Add fallback locations
    fallbackLocations.forEach(location => {
        addMarker(location);
    });
    
    // Populate initial location list
    populateLocationList(fallbackLocations);
    
    // Set up event listeners
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('current-location-btn').addEventListener('click', getCurrentLocation);
    
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Category filter
    document.getElementById('category-filter').addEventListener('change', function() {
        // For demo with fallback locations
        clearMarkers();
        fallbackLocations.forEach(location => {
            if (this.value === 'all' || location.category === this.value) {
                addMarker(location);
            }
        });
    });
    
    // Show welcome message
    setTimeout(() => {
        showSearchStatus('🚀 Ready! Search any location worldwide', 'success');
    }, 1000);
    
    console.log('✅ Interactive Map Explorer initialized with real API');
    console.log('💡 Try searching for: "Eiffel Tower, Paris" or "Sydney Opera House"');
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', initApp);
