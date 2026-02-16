function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim();
}

let galleryData = [];           // všechno
let filteredGalleryData = [];   // to, co je VIDĚT
let currentIndex = 0;           // index v filteredGalleryData
let visibleGalleryOrder = [];
let currentPrimaryImage = null;
let scrollBeforeFullscreen = 0;

// ---------- Pomocné funkce ----------

function formatTitle(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDistance(num) {
  if (!num) return '-';
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return num > 100 ? `~ ${formatted}` : formatted;
}

// ---------- LEVÝ SIDEBAR ----------

const sidebarCategories = [
  { key: 'sluneční_soustava', label: 'Sluneční soustava', icon: 'fa-sun' },
  { key: 'hvězdy', label: 'Hvězdy', icon: 'fa-star' },
  { key: 'mlhoviny', label: 'Mlhoviny', icon: 'fa-cloud' },
  { key: 'hvězdokupy', label: 'Hvězdokupy', icon: 'fa-solid fa-star-of-life' },
  { key: 'galaxie', label: 'Galaxie', icon: 'fa-solid fa-spiral' }
];

function buildSidebar(data) {
  const sidebarList = document.getElementById('sidebarList');
  if (!sidebarList) return;

  sidebarList.innerHTML = '';

  sidebarCategories.forEach(cat => {
    const catItems = data.filter(item => item.category === cat.key);
    if (!catItems.length) return;

    const wrapper = document.createElement('li');
    wrapper.className = 'sidebar-category';

    wrapper.innerHTML = `
      <div class="sidebar-cat-header">
        <i class="fas ${cat.icon}" style="margin-right:6px;"></i>
        ${cat.label}
      </div>
      <ul class="sidebar-sublist" style="display:block;"></ul>
    `;

    const subList = wrapper.querySelector('.sidebar-sublist');

    const subcategories = [...new Set(catItems.map(i => i.subcategory))];

    subcategories.forEach(sub => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#sub-${sub}">${formatTitle(sub)}</a>`;
      subList.appendChild(li);
    });

    sidebarList.appendChild(wrapper);
  });
}

// ---------- PRAVÝ SIDEBAR – GENEROVÁNÍ FILTRŮ ----------

// Pevné pořadí kategorií a jejich podkategorií
const categories = [
  "sluneční_soustava",
  "hvězdy",
  "mlhoviny",
  "hvězdokupy",
  "galaxie"
];

const subcategories = {
  sluneční_soustava: ["Planeta", "Slunce", "Měsíc", "Ostatní objekty"],
  hvězdy: ["Nadobr", "Jasný obr", "Obr", "Podobr", "Hvězdy hlavní posloupnosti"],
  mlhoviny: ["Emisní", "Planetární", "Reflexní", "Pozůstatky supernov"],
  hvězdokupy: ["Kulové", "Otevřené"],
  galaxie: ["Eliptické", "Spirální"]
};

// Generování filtrů do pravého sidebaru
function fillRightSidebarFilters(data) {
  // Kategorie
  const catBox = document.getElementById('filterCategory');
  if (catBox) {
    catBox.innerHTML = "";
    categories.forEach(c => {
      if (data.some(i => i.category === c)) {
        catBox.innerHTML += `
          <label class="filter-checkbox">
            <input type="checkbox" class="catCheck" value="${c}">
            ${formatTitle(c)}
          </label>`;
      }
    });
  }

// Podkategorie – podle hlavní kategorie
const subBox = document.getElementById('filterSubcategory');
if (subBox) {
  subBox.innerHTML = "";
categories.forEach(c => {
  if (!data.some(i => i.category === c)) return;

  subcategories[c].forEach(s => {
    const exists = data.some(i =>
      normalize(i.category) === normalize(c) &&
      normalize(i.subcategory) === normalize(s)
    );

    if (exists) {
      subBox.innerHTML += `
        <label class="filter-checkbox">
          <input type="checkbox" class="subCheck" value="${s}">
          ${s} – ${formatTitle(c)}
        </label>
      `;
    }
  });
});
}

  // Souhvězdí – abecedně
  const conBox = document.getElementById('filterConstellation');
  if (conBox) {
    const cons = [...new Set(data.map(i => i.constellation).filter(Boolean))].sort();
    conBox.innerHTML = "";
    cons.forEach(c => {
      conBox.innerHTML += `
        <label class="filter-checkbox">
          <input type="checkbox" class="conCheck" value="${c}">
          ${c}
        </label>`;
    });
  }
}

// ---------- RENDER HLAVNÍ GALERIE ----------

function renderGallery(data) {
  visibleGalleryOrder = [];
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  // když renderujeme klasickou galerii, schováme topResults
  const topResults = document.getElementById('topResults');
  if (topResults) topResults.innerHTML = "";

  gallery.style.display = 'block';
  gallery.innerHTML = '';

  const categories = [
    { key: 'sluneční_soustava', label: 'Sluneční soustava' },
    { key: 'hvězdy', label: 'Hvězdy' },
    { key: 'mlhoviny', label: 'Mlhoviny' },
    { key: 'hvězdokupy', label: 'Hvězdokupy' },
    { key: 'galaxie', label: 'Galaxie' }
  ];

  categories.forEach(cat => {
    const catItems = data.filter(item => item.category === cat.key);
    if (!catItems.length) return;

    const catDiv = document.createElement('div');
    catDiv.className = 'category mb-5 category-title';
    catDiv.innerHTML = `<h2>${cat.label}</h2>`;
    gallery.appendChild(catDiv);

    const subcategories = [...new Set(catItems.map(i => i.subcategory))];
    subcategories.forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory mb-3 subcategory-title';
      subDiv.id = `sub-${sub}`;
      subDiv.innerHTML = `<h4 class="subcategory-header">${formatTitle(sub)}</h4>`;

      const row = document.createElement('div');
      row.className = 'subcategory-row';

      catItems
        .filter(i => i.subcategory === sub)
        .forEach(item => {
          visibleGalleryOrder.push(item.id);
          const card = document.createElement('div');
          card.className = 'card gallery-card shadow-sm me-3';
          card.innerHTML = `
            <img src="./images/${item.image}" class="card-img-top" alt="${item.common_name}">
            <div class="card-body text-center">
              <h5 class="card-title">${item.common_name}</h5>
              <p class="card-text small">${item.name}</p>
              <p class="card-text small">Souhvězdí: ${item.constellation}</p>
            </div>
          `;
          card.addEventListener('click', () => openModalById(item.id));
          row.appendChild(card);
        });

      subDiv.appendChild(row);
      catDiv.appendChild(subDiv);
    });
  });
}

// ---------- FILTRY – APLIKACE ----------

// upravená funkce applyFilters
function applyFilters() {

  const search =
    document.getElementById('searchInput')?.value.toLowerCase() || "";

  const selectedCats =
    [...document.querySelectorAll('.catCheck:checked')]
      .map(e => e.value);

  const selectedSubs =
    [...document.querySelectorAll('.subCheck:checked')]
      .map(e => e.value);

  const selectedCons =
    [...document.querySelectorAll('.conCheck:checked')]
      .map(e => e.value);

  filteredGalleryData =
    galleryData.filter(item => {

      const matchesSearch =
        item.common_name.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search);

      const matchCat =
        selectedCats.length
          ? selectedCats.some(cat =>
              normalize(cat) === normalize(item.category)
            )
          : true;

      const matchSub =
        selectedSubs.length
          ? selectedSubs.some(sub =>
              normalize(sub) === normalize(item.subcategory)
            )
          : true;

      const matchCon =
        selectedCons.length
          ? selectedCons.some(con =>
              normalize(con) === normalize(item.constellation)
            )
          : true;

      return matchesSearch && matchCat && matchSub && matchCon;

    });

  renderGallery(filteredGalleryData);
}

// ---------- TOP 10 GALERIE ----------

function hideMainGallery() {
  const gallery = document.getElementById("gallery");
  if (gallery) gallery.style.display = "none";
}

function showMainGallery() {
  const gallery = document.getElementById("gallery");
  if (gallery) gallery.style.display = "block";
}

function renderTopGallery(list, title) {
  const container = document.getElementById("topResults");
  if (!container) return;

  filteredGalleryData = list;
  visibleGalleryOrder = list.map(i => i.id);

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML =
      "<p class='text-center text-warning'>Žádné výsledky.</p>";
    return;
  }

  const block = document.createElement("div");
  block.className = "top-block mb-5";

  block.innerHTML = `
    <h2 class="mb-3">${title}</h2>
    <div class="row" id="topCards"></div>
  `;

  container.appendChild(block);
  const row = block.querySelector("#topCards");

  list.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-md-6 mb-4";

    col.innerHTML = `
      <div class="card gallery-card shadow-sm">
        <img src="./images/${item.image}" class="card-img-top" alt="${item.common_name}">
        <div class="card-body text-center">
          <h5 class="card-title">${item.common_name}</h5>
          <p class="card-text small">
            ${item.name} | Souhvězdí: ${item.constellation}
          </p>
          <p class="card-text small">
            ❤️ ${item.likes} |
            ${new Date(item.created_at).toLocaleDateString("cs-CZ")}
          </p>
        </div>
      </div>
    `;

    col.addEventListener("click", () => openModalById(item.id));
    row.appendChild(col);
  });
}

function resetFiltersAndShowAll() {
  const topResults = document.getElementById("topResults");
  if (topResults) topResults.innerHTML = "";

  showMainGallery();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

document.querySelectorAll(".filter-checkbox input").forEach(cb => {
  cb.checked = false;
  cb.parentElement.classList.remove('active'); // odstraní zvýraznění
});


  renderGallery(galleryData);
}

// ---------- MODÁL ----------

function openModalById(id) {
  currentIndex = visibleGalleryOrder.indexOf(id);
  if (currentIndex === -1) return;
  showModalItem();
}

function getSubcategoriesInCategory(category) {
  const items = galleryData.filter(i => i.category === category);
  return [...new Set(items.map(i => i.subcategory))];
}

function showModalItem() {
  const id = visibleGalleryOrder[currentIndex];
  const item = galleryData.find(i => i.id === id);
  if (!item) return;

  currentPrimaryImage = item.image;

  document.getElementById('modalImage').src = `./images/${item.image}`;
  document.getElementById('modalTitle').innerText = item.common_name;
  document.getElementById('modalDescription').innerText = item.fact || 'Žádný popis.';
  document.getElementById('modalType').innerText = formatTitle(item.category);
  document.getElementById('modalConstellation').innerText = item.constellation || '-';
  document.getElementById('modalDistance').innerText = item.distance ? formatDistance(item.distance) : '-';
  document.getElementById('likeCount').innerText = item.likes || 0;

  const likeBtn = document.getElementById('likeBtn');
  if (item.likedByUser) likeBtn.classList.add('liked');
  else likeBtn.classList.remove('liked');

  if (modalInstance) {
    modalInstance.show();
  }

  // === DALŠÍ SNÍMKY ===
fetch(`http://localhost:3000/gallery/${item.id}/images`)
  .then(res => res.json())
  .then(images => {
    if (images.length) {
      moreImagesBtn.classList.remove('d-none');
      moreImagesBtn.onclick = () => openExtraImages(item.id);
    } else {
      moreImagesBtn.classList.add('d-none');
    }
  })
  .catch(() => {
    moreImagesBtn.classList.add('d-none');
  });
}

const modalImage = document.getElementById('modalImage');

modalImage.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    scrollBeforeFullscreen = window.scrollY;
    modalImage.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// po opuštění fullscreenu znovu zobraz modál
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    window.scrollTo({
      top: scrollBeforeFullscreen,
      behavior: 'instant'
    });
  }
});

// ---------- DALŠÍ SNÍMKY V MODÁLU ----------
const moreImagesBtn = document.getElementById('moreImagesBtn');
const extraImagesModal = new bootstrap.Modal(
  document.getElementById('extraImagesModal')
);
const extraImagesGrid = document.getElementById('extraImagesGrid');

function toggleFullscreen(img) {
  if (!document.fullscreenElement) {
    scrollBeforeFullscreen = window.scrollY;
    img.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// funkce pro otevření modálu s dalšími snímky
async function openExtraImages(galleryId) {
  try {
    const res = await fetch(`http://localhost:3000/gallery/${galleryId}/images`);
    const images = await res.json();

    const grid = document.getElementById('extraImagesGrid');
    const count = document.getElementById('extraImagesCount');

    grid.innerHTML = '';
    count.textContent = `(${images.length})`;

    // === PRIMÁRNÍ SNÍMEK ===
    const primaryCol = document.createElement('div');
    primaryCol.className = 'col-12 col-md-6 col-lg-4';

    primaryCol.innerHTML = `
      <div class="position-relative text-center">
        <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">
          Primární
        </span>
        <img src="./images/${currentPrimaryImage}"
             class="img-fluid rounded shadow"
             style="cursor:pointer"
        >
      </div>
    `;

    const primaryImg = primaryCol.querySelector('img');

    primaryImg.addEventListener('click', () => {
      toggleFullscreen(primaryImg);
    });

    grid.appendChild(primaryCol);

    // === DALŠÍ SNÍMKY ===
    images.forEach((img, index) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';

      col.innerHTML = `
        <div class="position-relative text-center">
          <span class="badge bg-secondary position-absolute top-0 end-0 m-2">
            ${index + 1}
          </span>
          <img src="./images/${img.image}"
               class="img-fluid rounded shadow"
               style="cursor:pointer"
          >
        </div>
      `;

    const extraImg = col.querySelector('img');

    extraImg.addEventListener('click', () => {
      toggleFullscreen(extraImg);
    });

      grid.appendChild(col);
    });

    extraImagesModal.show();

  } catch (err) {
    console.error(err);
    alert('Nepodařilo se načíst další snímky');
  }
}

// ---------- INIT ----------

async function loadGallery() {
  const gallery = document.getElementById('gallery');

  try {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`http://localhost:3000/gallery${userId ? '?userId=' + userId : ''}`);
    const data = await res.json();
    galleryData = data;

    const countEl = document.getElementById('galleryCount');
      if (countEl) {
        countEl.textContent = galleryData.length;
      }

    buildSidebar(data);
    fillRightSidebarFilters(data);
    renderGallery(data);
    filteredGalleryData = galleryData;

  } catch (err) {
    console.error('Chyba při načítání galerie:', err);
    if (gallery) {
      gallery.innerHTML = '<p class="text-danger">Nepodařilo se načíst galerii.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // init modálu
  const modalEl = document.getElementById('imageModal');
  if (modalEl) {
    modalInstance = new bootstrap.Modal(modalEl);
  }

  // vyhledávání
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // checkboxy – delegace (ať nepřidáváme listenery milionkrát)
document.body.addEventListener('change', e => {
  if (e.target.matches('.catCheck, .subCheck, .conCheck, .catalogCheck')) {

    // Zvýraznění aktivního checkboxu
    const label = e.target.closest('.filter-checkbox');
    if (label) {
      if (e.target.checked) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    }

    applyFilters();
  }
});

  // Náhodný snímek
const randomBtn = document.getElementById('randomImageBtn');

if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    if (!filteredGalleryData.length) return;

    const randomIndex = Math.floor(Math.random() * filteredGalleryData.length);
    const randomItem = filteredGalleryData[randomIndex];

    // otevře modál rovnou na náhodném snímku
    openModalById(randomItem.id);
  });
}

  // Top 10 nejnovějších
  const btnNewest = document.getElementById("showTopNewest");
  if (btnNewest) {
    btnNewest.addEventListener("click", () => {
      const newest = [...galleryData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      hideMainGallery();
      renderTopGallery(newest, "Top 10 nejnovějších snímků");
    });
  }

  // Top 10 nejlépe hodnocených
  const btnRated = document.getElementById("showTopRated");
  if (btnRated) {
    btnRated.addEventListener("click", () => {
      const rated = [...galleryData]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 10);

      hideMainGallery();
      renderTopGallery(rated, "Top 10 nejlépe hodnocených");
    });
  }

  // Zobrazit vše
  const btnAll = document.getElementById("showAll");
  if (btnAll) {
    btnAll.addEventListener("click", () => {
      resetFiltersAndShowAll();
    });
  }

// Prev / Next v modálu – upraveno pro filtrování
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

document.getElementById('prevBtn').addEventListener('click', () => {
  if (!filteredGalleryData.length) return;
  currentIndex = (currentIndex - 1 + visibleGalleryOrder.length) % visibleGalleryOrder.length;
  showModalItem();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (!filteredGalleryData.length) return;
  currentIndex = (currentIndex + 1) % visibleGalleryOrder.length;
  showModalItem();
});

  // Like tlačítko
const likeBtn = document.getElementById('likeBtn');

if (likeBtn) {
  likeBtn.addEventListener('click', async () => {

    if (!visibleGalleryOrder.length) return;

    const id = visibleGalleryOrder[currentIndex];
    const item = galleryData.find(i => i.id === id);
    if (!item) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Pro lajkování se prosím přihlas.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/gallery/${item.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (data.success) {
        item.likes = data.likes;
        item.likedByUser = true;

        document.getElementById('likeCount').innerText = data.likes;
        likeBtn.classList.add('liked');
      } else {
        alert(data.message || 'Tento snímek už jsi lajknul.');
      }

    } catch (err) {
      console.error('Chyba při lajkování:', err);
      alert('Chyba serveru při lajkování.');
    }
  });
}

  // fakticky načteme galerii
  loadGallery();
});