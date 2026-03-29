let lastActionTime = 0;
const COOLDOWN = 60000;

function canProceed() {
  const now = Date.now();

  if (now - lastActionTime < COOLDOWN) {
    showToast("Počkej chvíli před další změnou ⏳", "error");
    return false;
  }

  lastActionTime = now;
  return true;
}

function formatTitle(str) {
  if (!str) return '—';
  return str
    .replace(/_/g, ' ')
}

document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const usernameLS = localStorage.getItem('username');

  //  Nepřihlášený uživatel
  if (!userId || !usernameLS) {
    window.location.href = '/login';
    return;
  }

  try {
    //  načtení kompletních dat uživatele ze serveru
    const res = await fetch(`/users/${userId}`);
    if (!res.ok) throw new Error('Nelze načíst profil');

    const user = await res.json();
    fillProfile(user);
    loadUserStats(userId);
    loadUserBadges(userId);

  } catch (err) {
    console.error(err);
    alert('Chyba při načítání profilu');
  }
});

/* ------------------ FILL PROFILE ------------------ */

function fillProfile(user) {
  // Nadpis
  document.getElementById('profileUsername').innerText = user.username;

  // Základní info
  document.getElementById('infoUsername').innerText = user.username;
  document.getElementById('infoEmail').innerText = user.email;

  // Astronomický text
  const created = new Date(user.created_at);
  const formatted = created.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('profileLore').innerText =
    `Na AstroWeb jsi doletěl ${formatted}. Od té doby prozkoumáváš krásy vesmíru.`;
}

async function loadUserStats(userId) {
  try {
    const res = await fetch(`/users/${userId}/stats`);
    if (!res.ok) throw new Error('Statistiky nenalezeny');

    const stats = await res.json();

    document.getElementById('statsLikes').innerText =
      stats.likes ?? 0;

    document.getElementById('statsCategory').innerText =
      stats.favoriteCategory
        ? formatTitle(stats.favoriteCategory)
        : '—';

    document.getElementById('statsConstellation').innerText =
      stats.favoriteConstellation || '—';

  } catch (err) {
    console.error(err);
    document.getElementById('statsLikes').innerText = '—';
    document.getElementById('statsCategory').innerText = '—';
    document.getElementById('statsConstellation').innerText = '—';
  }
}

const usernameModal = new bootstrap.Modal(
  document.getElementById('changeUsernameModal')
);

const emailModal = new bootstrap.Modal(
  document.getElementById('changeEmailModal')
);

document.querySelectorAll('.profile-info-row button')[0]
  .addEventListener('click', () => usernameModal.show());

document.querySelectorAll('.profile-info-row button')[1]
  .addEventListener('click', () => emailModal.show());

  document.getElementById('saveUsernameBtn').addEventListener('click', async () => {
  const newUsername = document.getElementById('newUsername').value.trim();
  const userId = localStorage.getItem('userId');

  const btn = document.getElementById('saveUsernameBtn');
  btn.disabled = true;

  btn.disabled = false;

  if (!newUsername) return showToast('Zadej nové uživatelské jméno', 'error');
  if (!canProceed()) return;

  const res = await fetch(`/users/${userId}/username`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: newUsername })
  });

  const data = await res.json();
  if (!res.ok) return showToast(data.msg, 'error');

  showToast('Uživatelské jméno změněno', 'success');

  localStorage.setItem('username', newUsername);
  document.getElementById('profileUsername').innerText = newUsername;
  document.getElementById('infoUsername').innerText = newUsername;

  usernameModal.hide();
});

document.getElementById('saveEmailBtn').addEventListener('click', async () => {
  const email = document.getElementById('newEmail').value.trim();
  const confirm = document.getElementById('confirmEmail').value.trim();
  const userId = localStorage.getItem('userId');

  if (!email || !confirm) return showToast('Vyplň obě pole', 'error');
  if (email !== confirm) return showToast('Emaily se neshodují', 'error');

  const res = await fetch(`/users/${userId}/email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) return showToast(data.msg, 'error');

  showToast('Email změněn', 'success');

  if (!canProceed()) return;

  document.getElementById('infoEmail').innerText = email;
  emailModal.hide();
});

const passwordModal = new bootstrap.Modal(
  document.getElementById('changePasswordModal')
);

document.getElementById('changePasswordBtn')
  .addEventListener('click', () => passwordModal.show());

  document.getElementById('savePasswordBtn')
  .addEventListener('click', async () => {

    const current = document.getElementById('currentPassword').value;
    const next = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;

    if (!current || !next || !confirm)
      return showToast('Vyplň všechna pole', 'error');

    if (next.length < 8)
      return showToast('Heslo musí mít alespoň 8 znaků', 'error');

    if (next !== confirm)
      return showToast('Nová hesla se neshodují', 'error');

      if (!canProceed()) return;

    const userId = localStorage.getItem('userId');

    const res = await fetch(
      `/users/${userId}/password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next
        })
      }
    );

    const data = await res.json();
    if (!res.ok) return showToast(data.msg, 'error');

    showToast('Heslo bylo úspěšně změněno', 'success');
    passwordModal.hide();

    // vyčistit pole
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  });

  // Načtení uživatelských odznaků
  async function loadUserBadges(userId) {
  try {
    const res = await fetch(`/users/${userId}/badges`);
    if (!res.ok) throw new Error('Badges nenalezeny');

    const badges = await res.json();
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';

    if (badges.length === 0) {
      grid.innerHTML = '<p class="text-muted">Zatím nemáš žádné odznaky.</p>';
      return;
    }

    badges.forEach(badge => {
      const card = document.createElement('div');
      card.className = 'badge-card';

    card.innerHTML = `
      <div class="badge-icon">
        <img src="${badge.icon}" alt="${badge.name}">
      </div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.description || ''}</div>
    `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("profileToast");

  toast.textContent = message;
  toast.className = `profile-toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

async function loadUserCooldowns(userId) {
  const res = await fetch(`/users/${userId}/cooldowns`);
  const data = await res.json();

  if (data.username) {
    document.getElementById('usernameCooldown').innerText =
      `Další změna za: ${data.username}`;
    document.getElementById('saveUsernameBtn').disabled = true;
  }

  if (data.email) {
    document.getElementById('emailCooldown').innerText =
      `Další změna za: ${data.email}`;
    document.getElementById('saveEmailBtn').disabled = true;
  }

  if (data.password) {
    document.getElementById('passwordCooldown').innerText =
      `Další změna za: ${data.password}`;
    document.getElementById('savePasswordBtn').disabled = true;
  }
}