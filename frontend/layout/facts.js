function truncateText(text, max = 200) {
  if (!text) return '';
  return text.length > max
    ? text.substring(0, max) + '…'
    : text;
}

let allFacts = [];

async function loadFacts() {
  try {
    const res = await fetch('http://localhost:3000/facts');
    const data = await res.json();
    if (!data.success) return;

    allFacts = data.facts;
    renderFacts(allFacts);

  } catch (err) {
    console.error('Chyba při načítání facts:', err);
  }
}

function renderFacts(facts) {
  const container = document.getElementById('factsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!facts.length) {
    container.innerHTML = '<p class="text-center text-warning">Žádné zajímavosti.</p>';
    return;
  }

  facts.forEach(fact => {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';

    col.innerHTML = `
      <div class="fact-card h-100">
        ${fact.image ? `<img src="${fact.image}" alt="${fact.title}">` : ''}
        <div class="fact-body">
          <span class="fact-category">
            ${fact.category === 'personality' ? 'Osobnost' : 'Všeobecné'}
          </span>
          <h5>${fact.title}</h5>
          <p>${truncateText(fact.text, 180)}</p>
          <div class="fact-readmore">
          <button class="btn btn-outline-info btn-sm mt-2"
            data-bs-toggle="modal"
            data-bs-target="#factModal"
            data-title="${fact.title}"
            data-category="${fact.category}"
            data-text="${fact.text}"
            data-image="${fact.image || ''}"
            >
            Číst více
          </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// ---------- FILTRY ----------
document.addEventListener('click', e => {
  if (!e.target.dataset.filter) return;

  document.querySelectorAll('.facts-filters button')
    .forEach(b => b.classList.remove('active'));

  e.target.classList.add('active');

  const filter = e.target.dataset.filter;

  if (filter === 'all') {
    renderFacts(allFacts);
  } else {
    renderFacts(allFacts.filter(f => f.category === filter));
  }
});

document.addEventListener('DOMContentLoaded', loadFacts);

document.addEventListener('click', e => {
  if (!e.target.matches('[data-bs-target="#factModal"]')) return;

  const btn = e.target;

  document.querySelector('#factModal .modal-title').innerText =
    btn.dataset.title;

  document.getElementById('factModalText').innerText =
    btn.dataset.text;

  const category =
    btn.dataset.category === 'personality'
      ? 'Osobnost'
      : 'Všeobecné';

  document.getElementById('factModalCategory').innerText = category;

  const img = document.getElementById('factModalImage');
  if (btn.dataset.image) {
    img.src = btn.dataset.image;
    img.classList.remove('d-none');
  } else {
    img.classList.add('d-none');
  }
});
