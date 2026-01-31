let galleryData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadGallery();
  await loadNews();
  await loadFacts();

  document.getElementById('searchInput')
    ?.addEventListener('input', filterTable);
});


async function loadGallery() {
  try {
    const res = await fetch('http://localhost:3000/gallery');
    galleryData = await res.json();
    renderTable(galleryData);
  } catch (err) {
    console.error(err);
    alert('Chyba při načítání galerie');
  }
}

// VYKRESLENÍ TABULKY
function renderTable(data) {
  const tbody = document.getElementById('galleryTableBody');
  tbody.innerHTML = '';

  data.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <img src="../frontend/images/${item.image}" alt="${item.name}">
      </td>
      <td>${item.name}</td>
      <td>${item.common_name || '—'}</td>
      <td>${item.category}</td>
      <td>${item.constellation || '—'}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1"
          onclick="editItem(${item.id})">
          ✏️ Upravit
        </button>

        <button class="btn btn-danger btn-sm"
          onclick="deleteItem(${item.id})">
          🗑️ Smazat
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* VYHLEDÁVÁNÍ */
function filterTable(e) {
  const value = e.target.value.toLowerCase();

  const filtered = galleryData.filter(item =>
    item.name.toLowerCase().includes(value) ||
    (item.common_name || '').toLowerCase().includes(value) ||
    item.category.toLowerCase().includes(value) ||
    (item.constellation || '').toLowerCase().includes(value)
  );

  renderTable(filtered);
}

// Smazání položky
async function deleteItem(id) {
  const confirmDelete = confirm(
    'Opravdu chceš tento snímek smazat? Tato akce je nevratná.'
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/gallery/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Chyba při mazání');

    galleryData = galleryData.filter(i => i.id !== id);
    renderTable(galleryData);

  } catch (err) {
    console.error(err);
    alert('Nepodařilo se smazat snímek');
  }
}

let editModal;

document.addEventListener('DOMContentLoaded', () => {
  editModal = new bootstrap.Modal(
    document.getElementById('editGalleryModal')
  );
});

function editItem(id) {
  const item = galleryData.find(i => i.id === id);
  if (!item) return;

  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-common-name').value = item.common_name || '';
  document.getElementById('edit-constellation').value = item.constellation || '';
  document.getElementById('edit-fact').value = item.fact || '';

  document.getElementById('edit-image').value = '';
  editModal.show();
}

async function saveEdit() {
  const id = document.getElementById('edit-id').value;

  const formData = new FormData();
  formData.append('name', document.getElementById('edit-name').value);
  formData.append('common_name', document.getElementById('edit-common-name').value);
  formData.append('constellation', document.getElementById('edit-constellation').value);
  formData.append('fact', document.getElementById('edit-fact').value);

  const image = document.getElementById('edit-image').files[0];
  if (image) formData.append('image', image);

  try {
    const res = await fetch(`http://localhost:3000/gallery/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!res.ok) throw new Error('Chyba při ukládání');

    // ÚSPĚCH
    alert('Snímek byl úspěšně uložen ✅');

    editModal.hide();
    await loadGallery();

  } catch (err) {
    console.error(err);
    alert('Nepodařilo se uložit změny ❌');
  }
}

let newsData = [];
let factsData = [];

/* NOVINKY */
async function loadNews() {
  const res = await fetch('http://localhost:3000/news');
  const json = await res.json();

  newsData = json.articles ?? [];
  renderNews(newsData);
}

function renderNews(data) {
  const tbody = document.getElementById('newsTableBody');
  tbody.innerHTML = '';

  data.forEach(n => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${n.title}</td>
      <td>${new Date(n.created_at).toLocaleDateString('cs-CZ')}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1"
          onclick="editNews(${n.id})">✏️ Upravit</button>
        <button class="btn btn-danger btn-sm"
          onclick="deleteNews(${n.id})">🗑️ Smazat</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

const newsSearch = document.getElementById('newsSearch');
if (newsSearch) {
  newsSearch.addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    renderNews(newsData.filter(n =>
      n.title.toLowerCase().includes(val)
    ));
  });
}

/* ZAJÍMAVOSTI */
async function loadFacts() {
  const res = await fetch('http://localhost:3000/facts');
  const json = await res.json();

  const data = Array.isArray(json)
    ? json
    : json.facts || json.data || [];

  factsData = data;
  renderFacts(factsData);
}

function renderFacts(data) {
  const tbody = document.getElementById('factsTableBody');
  tbody.innerHTML = '';

  data.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.category}</td>
      <td>${f.title}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1"
          onclick="editFact(${f.id})">✏️ Upravit</button>
        <button class="btn btn-danger btn-sm"
          onclick="deleteFact(${f.id})">🗑️ Smazat</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

const factsSearch = document.getElementById('factsSearch');
if (factsSearch) {
  factsSearch.addEventListener('input', e => {
    const val = e.target.value.toLowerCase();
    renderFacts(factsData.filter(f =>
      f.title.toLowerCase().includes(val)
    ));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('newsTableBody')) {
    loadNews();
  }

  if (document.getElementById('factsTableBody')) {
    loadFacts();
  }
});

document.getElementById('newsSearch').addEventListener('input', e => {
  const val = e.target.value.toLowerCase();
  renderNews(newsData.filter(n =>
    n.title.toLowerCase().includes(val)
  ));
});

let newsModal = new bootstrap.Modal(
  document.getElementById('editNewsModal')
);

function editNews(id) {
  const n = newsData.find(x => x.id === id);

  document.getElementById('edit-news-id').value = n.id;
  document.getElementById('edit-news-title').value = n.title;
  document.getElementById('edit-news-content').value = n.content;

  newsModal.show();
}

async function saveNewsEdit() {
  const id = document.getElementById('edit-news-id').value;
  const fd = new FormData();

  fd.append('title', document.getElementById('edit-news-title').value);
  fd.append('content', document.getElementById('edit-news-content').value);

  const img = document.getElementById('edit-news-image').files[0];
  if (img) fd.append('image', img);

  await fetch(`http://localhost:3000/news/${id}`, {
    method: 'PUT',
    body: fd
  });

  alert('Článek uložen ✅');
  newsModal.hide();
  loadNews();
}

let factModal = new bootstrap.Modal(
  document.getElementById('editFactModal')
);

function editFact(id) {
  const f = factsData.find(x => x.id === id);

  document.getElementById('edit-fact-id').value = f.id;
  document.getElementById('edit-fact-category').value = f.category;
  document.getElementById('edit-fact-title').value = f.title;
  document.getElementById('edit-fact-text').value = f.text;

  document.getElementById('edit-fact-image').value = '';
  factModal.show();
}

async function saveFactEdit() {
  const id = document.getElementById('edit-fact-id').value;

  const fd = new FormData();
  fd.append('category', document.getElementById('edit-fact-category').value);
  fd.append('title', document.getElementById('edit-fact-title').value);
  fd.append('text', document.getElementById('edit-fact-text').value);

  const img = document.getElementById('edit-fact-image').files[0];
  if (img) fd.append('image', img);

  await fetch(`http://localhost:3000/facts/${id}`, {
    method: 'PUT',
    body: fd
  });

  alert('Zajímavost uložena ✅');
  factModal.hide();
  loadFacts();
}

async function deleteFact(id) {
  if (!confirm('Opravdu chceš tuto zajímavost smazat?')) return;

  await fetch(`http://localhost:3000/facts/${id}`, {
    method: 'DELETE'
  });

  factsData = factsData.filter(f => f.id !== id);
  renderFacts(factsData);
}