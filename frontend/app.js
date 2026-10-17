const API_URL = 'http://localhost:5000/api';

document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(link.dataset.page).classList.add('active');
    if (link.dataset.page === 'events') loadEvents();
  });
});

async function loadEvents(searchTerm = '') {
  const res = await fetch(`${API_URL}/events`);
  let events = await res.json();
  
  if (searchTerm) {
    events = events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  renderEvents(events, 'events-list');
}

function renderEvents(events, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = events.map(event => `
    <div class="event-card" onclick="showDetail(${event.id})">
      <h3>${event.title}</h3>
      <span class="category">${event.category}</span>
      <p>📅 ${event.date} at ${event.time}</p>
      <p>📍 ${event.location}</p>
      <p>Seats: ${event.capacity}</p>
    </div>
  `).join('');
}

async function showDetail(id) {
  const res = await fetch(`${API_URL}/events/${id}`);
  const event = await res.json();
  
  document.getElementById('event-content').innerHTML = `
    <h2>${event.title}</h2>
    <span class="category">${event.category}</span>
    <p>${event.description}</p>
    <p><strong>Date:</strong> ${event.date} | ${event.time}</p>
    <p><strong>Location:</strong> ${event.location}</p>
    <p><strong>Capacity:</strong> ${event.capacity}</p>
    <button class="btn" onclick="goRegister(${event.id})">Register Now</button>
  `;
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('event-detail').classList.add('active');
}

function goRegister(eventId) {
  document.getElementById('event-id').value = eventId;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('register').classList.add('active');
}

document.getElementById('search-input')?.addEventListener('input', e => {
  loadEvents(e.target.value);
});

document.getElementById('reg-form').addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    eventId: parseInt(document.getElementById('event-id').value)
  };
  
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await res.json();
  alert('✅ ' + result.message);
  e.target.reset();
});

window.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch(`${API_URL}/events`);
  const events = await res.json();
  renderEvents(events.slice(0, 3), 'featured-events');
});