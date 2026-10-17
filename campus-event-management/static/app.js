const grid = document.getElementById('eventGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const authModal = document.getElementById('authModal');
let authMode = 'signup';
let currentUser = null;
let toastTimer;

const eventIcons = {Workshop:'🧠', Sports:'🏆', Seminar:'🎤', Competition:'⚡', Conference:'🌐', Society:'🤝'};
const categoryClasses = {Workshop:'visual-workshop', Sports:'visual-sports', Seminar:'visual-seminar', Competition:'visual-competition', Conference:'visual-conference', Society:'visual-society'};
function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function toast(message) {
  const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}
async function api(url, options={}) {
  const response = await fetch(url, {headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options});
  const data = await response.json().catch(()=>({error:'Unexpected server response'}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function prettyDate(date) {
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}
async function loadEvents() {
  grid.innerHTML = '<div class="loading">Loading campus events…</div>';
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
  if (categoryFilter.value !== 'All') params.set('category', categoryFilter.value);
  try {
    const events = await api('/api/events?' + params.toString());
    document.getElementById('eventCount').textContent = String(events.length).padStart(2,'0');
    document.getElementById('shownCount').textContent = events.length;
    if (!events.length) { grid.innerHTML = '<div class="empty-state">No events match your search. Try another keyword or category.</div>'; return; }
    grid.innerHTML = events.map(e => {
      const cat = e.category || 'Society';
      const admin = currentUser && currentUser.role === 'admin';
      return `<article class="event-card">
        <div class="event-visual ${categoryClasses[cat] || 'visual-society'}"><span class="visual-icon">${eventIcons[cat] || '✨'}</span><span class="category-tag">${escapeHtml(cat)}</span></div>
        <div class="event-body"><span class="event-date">${escapeHtml(prettyDate(e.date))} · ${escapeHtml(e.time)}</span>
        <h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.description)}</p>
        <div class="event-meta"><span>⌖ ${escapeHtml(e.location)}</span><span>◷ ${e.seats_left} seats remaining</span></div>
        <div class="card-bottom"><span class="seats"><strong>${e.registered}</strong> registered</span>
        ${admin ? `<button class="register-btn" onclick="deleteEvent(${e.id})">Delete event</button>` : `<button class="register-btn" ${e.seats_left<=0?'disabled':''} onclick="registerEvent(${e.id})">${e.seats_left<=0?'Event full':'Register ↗'}</button>`}
        </div></div></article>`;
    }).join('');
  } catch (e) { grid.innerHTML = `<div class="empty-state">Could not load events. Is the Flask server running?<br>${escapeHtml(e.message)}</div>`; }
}
async function refreshUser() {
  try {
    const data = await api('/api/me'); currentUser = data.user;
  } catch { currentUser = null; }
  document.getElementById('userBadge').textContent = currentUser ? `Hi, ${currentUser.name}` : '';
  document.getElementById('loginOpen').classList.toggle('hidden', !!currentUser);
  document.getElementById('signupOpen').classList.toggle('hidden', !!currentUser);
  document.getElementById('logoutBtn').classList.toggle('hidden', !currentUser);
  await loadEvents();
}
function openAuth(mode) {
  authMode = mode; authModal.classList.remove('hidden');
  const signup = mode === 'signup';
  document.getElementById('nameField').classList.toggle('hidden', !signup);
  document.getElementById('authName').required = signup;
  document.getElementById('modalEyebrow').textContent = signup ? 'WELCOME TO CAMPUSCONNECT' : 'GOOD TO SEE YOU AGAIN';
  document.getElementById('modalTitle').textContent = signup ? 'Join the community.' : 'Welcome back.';
  document.getElementById('modalDesc').textContent = signup ? 'Create an account to register for campus events.' : 'Log in to manage your campus experience.';
  document.getElementById('authSubmit').textContent = signup ? 'Create account' : 'Log in';
  document.getElementById('modalSwitch').innerHTML = signup ? 'Already a member? <button type="button" id="switchAuth">Log in</button>' : 'New to CampusConnect? <button type="button" id="switchAuth">Create account</button>';
  document.getElementById('switchAuth').onclick = () => openAuth(signup ? 'login' : 'signup');
}
document.getElementById('loginOpen').onclick = () => openAuth('login');
['signupOpen','heroSignup','ctaSignup'].forEach(id => document.getElementById(id).onclick = () => openAuth('signup'));
document.getElementById('modalClose').onclick = () => authModal.classList.add('hidden');
authModal.addEventListener('click', e => { if (e.target === authModal) authModal.classList.add('hidden'); });
document.getElementById('authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {email:document.getElementById('authEmail').value, password:document.getElementById('authPassword').value};
  if (authMode === 'signup') payload.name = document.getElementById('authName').value;
  try {
    const data = await api(authMode === 'signup' ? '/api/signup' : '/api/login', {method:'POST', body:JSON.stringify(payload)});
    currentUser = data.user; authModal.classList.add('hidden'); e.target.reset();
    toast(authMode === 'signup' ? 'Account created. Welcome!' : 'You are now logged in.');
    await refreshUser();
  } catch (err) { toast(err.message); }
});
document.getElementById('logoutBtn').onclick = async () => {
  try { await api('/api/logout', {method:'POST', body:'{}'}); currentUser = null; toast('Logged out successfully.'); await refreshUser(); }
  catch (e) { toast(e.message); }
};
window.registerEvent = async id => {
  if (!currentUser) { openAuth('login'); toast('Please log in before registering.'); return; }
  try { const data = await api('/api/register', {method:'POST', body:JSON.stringify({event_id:id})}); toast(data.message); await loadEvents(); }
  catch (e) { toast(e.message); }
};
window.deleteEvent = async id => {
  if (!confirm('Delete this event? Existing registrations will also be removed.')) return;
  try { const data = await api('/api/events/' + id, {method:'DELETE'}); toast(data.message); await loadEvents(); }
  catch (e) { toast(e.message); }
};
let searchTimer;
searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadEvents, 250); });
categoryFilter.addEventListener('change', loadEvents);
document.getElementById('refreshBtn').addEventListener('click', loadEvents);
refreshUser();
