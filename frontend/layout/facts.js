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
          <p>${fact.text}</p>
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
