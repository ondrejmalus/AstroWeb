function validateForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select');

  for (const input of inputs) {
    if (
      input.type !== 'file' &&
      input.value.trim() === ''
    ) {
      alert('Vyplň prosím všechna pole ❗');
      input.focus();
      return false;
    }

    // file input
    if (input.type === 'file' && !input.files.length) {
      alert('Musíš vybrat obrázek ❗');
      input.focus();
      return false;
    }
  }

  return true;
}

// FORMULÁŘ PRO ČLÁNKY
const newsForm = document.getElementById('add-news-form');

if(newsForm){
  newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(newsForm)) return;

    const title = document.getElementById('news-title').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const image = document.getElementById('news-image').files[0];
    const role = localStorage.getItem('role');

    if(role !== 'admin') return alert('Nemáš oprávnění přidávat články!');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    try {
      const res = await fetch('/news', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if(data.success){
        alert('Článek přidán!');
        newsForm.reset();
      } else {
        alert(data.error || 'Chyba při přidávání článku');
      }
    } catch(err){
      console.error(err);
      alert('Chyba při komunikaci se serverem');
    }
  });
}

// FORMULÁŘ PRO GALERII
const galleryForm = document.getElementById('add-gallery-form');

if (galleryForm) {
  const categorySelect = document.getElementById('gallery-category');
  const subcategorySelect = document.getElementById('gallery-subcategory');

  // Podkategorie podle hlavní kategorie
  const subcategories = {
    sluneční_soustava: ["Planeta", "Slunce", "Měsíc", "Ostatní objekty"],
    hvězdy: ["Nadobr", "Jasný obr", "Obr", "Podobr", "Hvězdy hlavní posloupnosti"],
    mlhoviny: ["Emisní", "Planetární", "Reflexní", "Pozůstatky supernov"],
    hvězdokupy: ["Kulové", "Otevřené"],
    galaxie: ["Eliptické", "Spirální"]
  };

categorySelect.addEventListener('change', () => {
  const cats = subcategories[categorySelect.value] || [];
  subcategorySelect.innerHTML = '<option value="">Vyberte podkategorii</option>';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.toLowerCase().replaceAll(' ', '_');
    opt.textContent = c;
    subcategorySelect.appendChild(opt);
  });

  // === SPECIÁLNÍ LOGIKA PRO SLUNEČNÍ SOUSTAVU ===
  if (categorySelect.value === "sluneční_soustava") {
    constellationInput.value = "-";
    constellationInput.disabled = true;
  } else {
    constellationInput.disabled = false;
    constellationInput.value = "";
  }
});

const constellationInput = document.getElementById('gallery-constellation');
const dropdown = document.getElementById('constellation-dropdown');
let constellationValues = [];

// Načtení existujících souhvězdí
async function loadConstellations() {
  try {
    const res = await fetch("/gallery");
    const data = await res.json();

    constellationValues = [...new Set(
      data
        .map(i => i.constellation)
        .filter(c => c && c !== "-")
    )];

  } catch (err) {
    console.error("Chyba při načítání souhvězdí:", err);
  }
}

loadConstellations();

// Filtrování při psaní
constellationInput.addEventListener("input", () => {
  const value = constellationInput.value.toLowerCase();
  dropdown.innerHTML = "";

  const filtered = constellationValues.filter(c =>
    c.toLowerCase().includes(value)
  );

  if (filtered.length === 0) {
    dropdown.innerHTML = `<div class="no-results">Žádné výsledky</div>`;
  } else {
    filtered.forEach(c => {
      const div = document.createElement("div");
      div.textContent = c;
      div.addEventListener("click", () => {
        constellationInput.value = c;
        dropdown.style.display = "none";
      });
      dropdown.appendChild(div);
    });
  }

  dropdown.style.display = "block";
});

// Klik ven → zavřít
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-select-wrapper")) {
    dropdown.style.display = "none";
  }
});

  // Odeslání formuláře
  galleryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(galleryForm)) return;

    // Sběr dat z formuláře
    const category = categorySelect.value;
    const subcategory = subcategorySelect.value;
    const name = document.getElementById('gallery-name').value.trim();
    const common_name = document.getElementById('gallery-common_name').value.trim();
    const constellation = document.getElementById('gallery-constellation').value.trim();
    const distance = document.getElementById('gallery-distance').value.trim();
    const fact = document.getElementById('gallery-fact').value.trim();
    const image = document.getElementById('gallery-image').files[0];
    const role = localStorage.getItem('role');

    if (role !== 'admin') return alert('Nemáš oprávnění přidávat snímky!');

    const formData = new FormData();
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('name', name);
    formData.append('common_name', common_name);
    formData.append('constellation', constellation);
    formData.append('distance', distance);
    formData.append('fact', fact);
    formData.append('image', image);

    try {
      const res = await fetch('/gallery', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert('Snímek přidán do galerie! ✅');
        galleryForm.reset();
        subcategorySelect.innerHTML = '<option value="">Nejdřív vyberte kategorii</option>';
      } else {
        alert(data.error || 'Chyba při přidávání snímku ❌');
      }
    } catch (err) {
      console.error(err);
      alert('Chyba při komunikaci se serverem');
    }
  });
}

// FORMULÁŘ PRO ZAJÍMAVOSTI
const factForm = document.getElementById('add-fact-form');

if (factForm) {
  factForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(factForm)) return;

    const formData = new FormData(factForm);

    try {
      const res = await fetch('/facts', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        alert('Zajímavost byla přidána ✨');
        factForm.reset();
      } else {
        alert(data.msg || 'Chyba při ukládání zajímavosti');
      }

    } catch (err) {
      console.error(err);
      alert('Chyba serveru');
    }
  });
}

// FORMULÁŘ – BADGES
const badgeForm = document.getElementById('add-badge-form');

if (badgeForm) {
  badgeForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(badgeForm)) return;

    const role = localStorage.getItem('role');
    if (role !== 'admin') return alert('Nemáš oprávnění!');

    const formData = new FormData();
    formData.append('badge_key', document.getElementById('badge-key').value);
    formData.append('name', document.getElementById('badge-name').value);
    formData.append('description', document.getElementById('badge-description').value);
    formData.append('trigger_type', document.getElementById('badge-trigger').value);
    formData.append('trigger_value', document.getElementById('badge-value').value);

    const icon = document.getElementById('badge-icon').files[0];
    if (icon) formData.append('icon', icon);

    try {
      const res = await fetch('/badges', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        alert('Badge přidána 🏅');
        badgeForm.reset();
      } else {
        alert(data.msg || 'Chyba při přidání badge');
      }

    } catch (err) {
      console.error(err);
      alert('Chyba serveru');
    }
  });
}

// ==========================================
// FORMULÁŘ – DALŠÍ SNÍMKY K OBJEKTU
// ==========================================

const extraImageForm = document.getElementById(
  'add-gallery-extra-image-form'
);

const searchInput = document.getElementById(
  'extra-gallery-search'
);
const dropdown = document.getElementById(
  'extra-gallery-dropdown'
);
const hiddenIdInput = document.getElementById(
  'extra-gallery-id'
);

let galleryObjects = [];

// ------------------------------------------
// Načtení objektů galerie
// ------------------------------------------
async function loadGalleryObjectsForExtraImages() {
  try {
    const res = await fetch('/gallery');
    galleryObjects = await res.json();
  } catch (err) {
    console.error(err);
    alert('Nepodařilo se načíst objekty galerie');
  }
}

loadGalleryObjectsForExtraImages();

// ------------------------------------------
// Vyhledávání objektů
// ------------------------------------------
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    dropdown.innerHTML = '';

    const filtered = galleryObjects.filter(o =>
      o.name.toLowerCase().includes(value)
    );

    if (!filtered.length) {
      dropdown.innerHTML =
        '<div class="no-results">Žádné výsledky</div>';
    } else {
      filtered.forEach(o => {
        const div = document.createElement('div');
        div.textContent = `${o.name} (${o.category})`;

        div.addEventListener('click', () => {
          searchInput.value = o.name;
          hiddenIdInput.value = o.id;
          dropdown.style.display = 'none';
        });

        dropdown.appendChild(div);
      });
    }

    dropdown.style.display = 'block';
  });
}

// klik mimo → zavřít dropdown
const dropdown1 = document.querySelector('.custom-dropdown');

document.addEventListener('click', e => {
  if (!dropdown1) return;

  if (!e.target.closest('.custom-select-wrapper')) {
    dropdown1.style.display = 'none';
  }
});

// ------------------------------------------
// Odeslání formuláře
// ------------------------------------------
if (extraImageForm) {
  extraImageForm.addEventListener('submit', async e => {
    e.preventDefault();

    const role = localStorage.getItem('role');
    if (role !== 'admin')
      return alert('Nemáš oprávnění!');

    const galleryId = hiddenIdInput.value;
    const image = document.getElementById(
      'extra-gallery-image'
    ).files[0];

    if (!galleryId) {
      alert('Musíš vybrat objekt ❗');
      return;
    }

    if (!image) {
      alert('Musíš vybrat obrázek ❗');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch(
        `/gallery/${galleryId}/images`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await res.json();

      if (data.success) {
        alert('Další snímek byl přidán ✅');
        extraImageForm.reset();
        hiddenIdInput.value = '';
      } else {
        alert(data.error || 'Chyba při přidávání snímku');
      }

    } catch (err) {
      console.error(err);
      alert('Chyba serveru');
    }
  });
}
