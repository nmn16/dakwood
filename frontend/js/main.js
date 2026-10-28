(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  // Editorial stock imagery from Unsplash. Images are loaded from their source CDN,
  // so the visitor's browser needs an internet connection to display them.
  const propertyPhotos = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=82'
  ];
  const tourPhotos = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=82',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=82'
  ];

  const csrfToken = () => {
    const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  };

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.method === 'POST' ? { 'X-CSRFToken': csrfToken() } : {}), ...(options.headers || {}) },
    });
    let data;
    try { data = await response.json(); } catch { data = { error: 'The server returned an unreadable response.' }; }
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
  }

  function showMessage(element, message, state = '') {
    if (!element) return;
    element.textContent = message;
    element.className = `form-message${state ? ` ${state}` : ''}`;
  }

  function setResult(element, markup) {
    if (element) element.innerHTML = markup;
  }

  function resultMarkup(title, detail, extra = '') {
    return `<div class="result-card"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p>${extra ? `<p>${escapeHtml(extra)}</p>` : ''}</div>`;
  }

  // Responsive navigation
  const menuButton = $('.menu-btn');
  const nav = $('#nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  $('#year').textContent = new Date().getFullYear();
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  ['#check-in', '#check-out', '#travel-date'].forEach(id => { if ($(id)) $(id).min = localToday; });
  $('#check-in')?.addEventListener('change', event => {
    if ($('#check-out')) {
      $('#check-out').min = event.target.value || localToday;
      if ($('#check-out').value && $('#check-out').value <= event.target.value) $('#check-out').value = '';
    }
  });

  let properties = [];
  let packages = [];

  async function loadProperties() {
    const list = $('#property-list');
    const select = $('#hotel-property');
    try {
      const data = await api('/api/hospitality/properties/');
      properties = data.results || [];
      select.innerHTML = '<option value="">Choose accommodation</option>' + properties.map(item => `<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(item.location)}</option>`).join('');
      if (!properties.length) {
        list.innerHTML = '<p class="empty-state">No active accommodation is listed yet. The team can add properties from the admin panel.</p>';
        return;
      }
      list.innerHTML = properties.map((item, index) => `
        <article class="listing-card">
          <div class="listing-image"><img src="${propertyPhotos[index % propertyPhotos.length]}" alt="Accommodation inspiration for ${escapeHtml(item.name)}" loading="lazy" decoding="async"></div>
          <div class="card-topline"><span class="card-index">⌂</span><span class="card-location">${escapeHtml(item.location)}</span></div>
          <h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
          <div class="amenities">${(item.amenities || []).slice(0, 4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="card-bottom"><div class="price">${money(item.nightly_rate)}<small>per room / night</small></div><button class="card-action" type="button" data-property-id="${item.id}">Request stay ↗</button></div>
        </article>`).join('');
      $$('[data-property-id]', list).forEach(button => button.addEventListener('click', () => {
        select.value = button.dataset.propertyId;
        $('#hospitality-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        select.focus({ preventScroll: true });
      }));
    } catch (error) {
      list.innerHTML = `<p class="empty-state">Could not load accommodation: ${escapeHtml(error.message)}. Check that the backend is running and demo data has been loaded.</p>`;
      select.innerHTML = '<option value="">Could not load stays</option>';
    }
  }

  async function loadPackages() {
    const list = $('#tour-list');
    const select = $('#tour-package');
    try {
      const data = await api('/api/tours/packages/');
      packages = data.results || [];
      select.innerHTML = '<option value="">Choose a tour package</option>' + packages.map(item => `<option value="${item.id}">${escapeHtml(item.title)} · ${escapeHtml(item.destination)}</option>`).join('');
      if (!packages.length) {
        list.innerHTML = '<p class="empty-state">No active tour packages are listed yet. Add packages from the admin panel or load the demo data.</p>';
        return;
      }
      list.innerHTML = packages.map((item, index) => `
        <article class="listing-card">
          <div class="listing-image"><img src="${tourPhotos[index % tourPhotos.length]}" alt="Travel inspiration for ${escapeHtml(item.destination)}" loading="lazy" decoding="async"></div>
          <div class="card-topline"><span class="card-index">✳</span><span class="category-pill">${escapeHtml(item.category)}</span></div>
          <h3>${escapeHtml(item.title)}</h3><p class="card-location">${escapeHtml(item.destination)} · ${item.duration_days} day${item.duration_days === 1 ? '' : 's'}</p><p>${escapeHtml(item.description)}</p>
          <div class="amenities">${(item.inclusions || []).slice(0, 4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="card-bottom"><div class="price">${money(item.price_per_person)}<small>per person</small></div><button class="card-action" type="button" data-package-id="${item.id}">Choose trip ↗</button></div>
        </article>`).join('');
      $$('[data-package-id]', list).forEach(button => button.addEventListener('click', () => {
        select.value = button.dataset.packageId;
        $('#tour-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        select.focus({ preventScroll: true });
      }));
    } catch (error) {
      list.innerHTML = `<p class="empty-state">Could not load tour packages: ${escapeHtml(error.message)}. Check that the backend is running and demo data has been loaded.</p>`;
      select.innerHTML = '<option value="">Could not load packages</option>';
    }
  }

  async function submitBooking(form, endpoint, messageSelector, type) {
    const message = $(messageSelector);
    const submit = $('button[type="submit"]', form);
    const original = submit.textContent;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload[type === 'hospitality' ? 'guests' : 'travelers'] = Number(payload[type === 'hospitality' ? 'guests' : 'travelers']);
    if (type === 'hospitality') payload.rooms_requested = Number(payload.rooms_requested);
    submit.disabled = true;
    submit.textContent = 'Submitting…';
    showMessage(message, 'Sending your request…');
    try {
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      showMessage(message, `${data.message} Reference: ${data.reference}. Save this reference to check your status.`, 'success');
      form.reset();
      if ($('#check-in')) $('#check-in').min = localToday;
      if ($('#check-out')) $('#check-out').min = localToday;
      if ($('#travel-date')) $('#travel-date').min = localToday;
      const refInput = $('#booking-ref');
      if (refInput) refInput.value = data.reference;
    } catch (error) {
      showMessage(message, error.message, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  }

  $('#hospitality-form').addEventListener('submit', event => {
    event.preventDefault();
    submitBooking(event.currentTarget, '/api/hospitality/bookings/', '#hospitality-message', 'hospitality');
  });
  $('#tour-form').addEventListener('submit', event => {
    event.preventDefault();
    submitBooking(event.currentTarget, '/api/tours/bookings/', '#tour-message', 'tours');
  });

  $('#status-form').addEventListener('submit', async event => {
    event.preventDefault();
    const ref = $('#booking-ref').value.trim().toUpperCase();
    const result = $('#status-result');
    setResult(result, '<p>Checking booking…</p>');
    try {
      const data = await api(`/api/bookings/${encodeURIComponent(ref)}/`);
      setResult(result, resultMarkup(`${data.type}: ${data.status}`, `${data.reference} · ${data.item}`, `Date: ${data.date} · Request created: ${data.submitted}`));
    } catch (error) {
      setResult(result, resultMarkup('Booking not found', error.message));
    }
  });

  $('#track-form').addEventListener('submit', async event => {
    event.preventDefault();
    const number = $('#track-id').value.trim().toUpperCase();
    const result = $('#track-result');
    setResult(result, '<p>Looking up parcel…</p>');
    try {
      const data = await api(`/api/track/${encodeURIComponent(number)}/`);
      const last = data.events && data.events[0];
      setResult(result, resultMarkup(`${data.tracking_number} · ${data.status}`, `${data.origin} → ${data.destination}`, last ? `Latest update: ${last.location ? `${last.location} · ` : ''}${last.time}${last.note ? ` · ${last.note}` : ''}` : 'No tracking updates have been added yet.'));
    } catch (error) {
      setResult(result, resultMarkup('Parcel not found', error.message));
    }
  });

  $('#contact-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $('button[type="submit"]', form);
    const message = $('#form-message');
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    showMessage(message, 'Sending your enquiry…');
    try {
      const data = await api('/api/inquiries/', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      showMessage(message, `Thanks, ${data.name}. Your enquiry has been saved. Our team will follow up.`, 'success');
      form.reset();
    } catch (error) {
      showMessage(message, error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });

  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    const select = $('#contact-service');
    if (select) select.value = link.dataset.service;
  }));

  loadProperties();
  loadPackages();
})();
