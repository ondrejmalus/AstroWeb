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
    window.location.href = '/login.html';
    return;
  }

  try {
    //  načtení kompletních dat uživatele ze serveru
    const res = await fetch(`http://localhost:3000/users/${userId}`);
    if (!res.ok) throw new Error('Nelze načíst profil');

    const user = await res.json();
    fillProfile(user);
    loadUserStats(userId);

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

  // Astronomický text 🌌
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
    const res = await fetch(`http://localhost:3000/users/${userId}/stats`);
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

  if (!newUsername) return alert('Zadej nové uživatelské jméno');

  const res = await fetch(`http://localhost:3000/users/${userId}/username`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: newUsername })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.msg);

  localStorage.setItem('username', newUsername);
  document.getElementById('profileUsername').innerText = newUsername;
  document.getElementById('infoUsername').innerText = newUsername;

  usernameModal.hide();
});

document.getElementById('saveEmailBtn').addEventListener('click', async () => {
  const email = document.getElementById('newEmail').value.trim();
  const confirm = document.getElementById('confirmEmail').value.trim();
  const userId = localStorage.getItem('userId');

  if (!email || !confirm) return alert('Vyplň obě pole');
  if (email !== confirm) return alert('Emaily se neshodují');

  const res = await fetch(`http://localhost:3000/users/${userId}/email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.msg);

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
      return alert('Vyplň všechna pole');

    if (next.length < 6)
      return alert('Heslo musí mít alespoň 6 znaků');

    if (next !== confirm)
      return alert('Nová hesla se neshodují');

    const userId = localStorage.getItem('userId');

    const res = await fetch(
      `http://localhost:3000/users/${userId}/password`,
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
    if (!res.ok) return alert(data.msg);

    alert('Heslo bylo úspěšně změněno');
    passwordModal.hide();

    // vyčistit pole
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  });
