/**
 * Local Places Explorer - Frontend JavaScript
 */

// State
let map;
let sessionId = null;
let markers = [];

// Category colors for map markers
const CATEGORY_COLORS = {
  cafe: '#8B4513',
  restaurant: '#FF6347',
  park: '#228B22',
  bookstore: '#4B0082',
  gym: '#FF8C00',
  grocery: '#32CD32'
};

// Icon HTML generator
function getMarkerIcon(category) {
  const color = CATEGORY_COLORS[category] || '#666';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

/**
 * Initialize the map
 */
function initMap() {
  map = L.map('map').setView([39.8283, -98.5795], 4); // Center of US

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  console.log('Map initialized');
}

/**
 * Load and display all places
 */
async function loadPlaces() {
  try {
    console.log('Fetching places from /api/places...');
    const response = await fetch('/api/places');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const places = await response.json();
    console.log(`Loaded ${places.length} places`);

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add markers for each place
    places.forEach(place => {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: getMarkerIcon(place.category)
      }).addTo(map);

      // Create popup content
      const stars = '★'.repeat(Math.round(place.rating));
      const price = '$'.repeat(place.price_level || 1);

      let popupContent = `
        <div class="place-popup">
          <h3>${place.name}</h3>
          <p class="category">${place.category.toUpperCase()}</p>
          <p class="rating">${place.rating}/5 ${stars}</p>
          <p class="price">${price}</p>
      `;

      if (place.address) {
        popupContent += `<p class="address">📍 ${place.address}</p>`;
      }

      if (place.description) {
        popupContent += `<p class="description">${place.description}</p>`;
      }

      if (place.hours) {
        popupContent += `<p class="hours">🕒 ${place.hours}</p>`;
      }

      if (place.amenities && place.amenities.length > 0) {
        popupContent += `<p class="amenities"><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>`;
      }

      popupContent += `</div>`;

      marker.bindPopup(popupContent);
      markers.push(marker);
    });

    // Hide loading overlay
    document.getElementById('loadingOverlay').style.display = 'none';

    console.log('Places loaded successfully');
  } catch (error) {
    console.error('Error loading places:', error);
    document.getElementById('loadingOverlay').innerHTML = `
      <div class="error">
        <p>Failed to load places</p>
        <p style="font-size: 0.9em; color: #999;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 1em; padding: 0.5em 1em; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

/**
 * Add a message to the chat
 */
function addMessage(text, isUser = false) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  // Convert newlines to <br> and wrap in <p>
  const lines = text.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    contentDiv.appendChild(p);
  });

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Send a message to the chatbot
 */
async function sendMessage(message) {
  const typingIndicator = document.getElementById('typingIndicator');
  const sendButton = document.getElementById('sendButton');
  const messageInput = document.getElementById('messageInput');

  try {
    // Disable input
    sendButton.disabled = true;
    messageInput.disabled = true;

    // Show typing indicator
    typingIndicator.style.display = 'flex';

    // Send request
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        sessionId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Request failed');
    }

    const data = await response.json();

    // Update session ID
    sessionId = data.sessionId;

    // Add bot response
    addMessage(data.response, false);

  } catch (error) {
    console.error('Chat error:', error);
    addMessage(`Sorry, I encountered an error: ${error.message}`, false);
  } finally {
    // Hide typing indicator
    typingIndicator.style.display = 'none';

    // Re-enable input
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

/**
 * Reset the conversation
 */
async function resetConversation() {
  if (!sessionId) return;

  try {
    await fetch('/api/chat/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });

    sessionId = null;

    // Clear chat messages except first
    const messagesContainer = document.getElementById('chatMessages');
    while (messagesContainer.children.length > 1) {
      messagesContainer.removeChild(messagesContainer.lastChild);
    }

    addMessage('Conversation reset. How can I help you?', false);
  } catch (error) {
    console.error('Reset error:', error);
  }
}

/**
 * Initialize the application
 */
function init() {
  console.log('Initializing Local Places Explorer...');

  // Initialize map
  initMap();

  // Load places
  loadPlaces();

  // Textarea auto-resize
  const messageInput = document.getElementById('messageInput');
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
  });

  // Handle Enter key (submit) vs Shift+Enter (new line)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('chatForm').dispatchEvent(new Event('submit'));
    }
  });

  // Chat form handler
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, true);

    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Send message
    sendMessage(message);
  });

  // Reset chat button
  document.getElementById('resetChat').addEventListener('click', () => {
    resetConversation();
  });

  console.log('Initialization complete');
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
