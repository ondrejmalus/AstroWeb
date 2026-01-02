// FORMULÁŘ PRO ČLÁNKY
const newsForm = document.getElementById('add-news-form');

if(newsForm){
  newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('news-title').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const image = document.getElementById('news-image').files[0];
    const role = localStorage.getItem('role');

    if(role !== 'admin') return alert('Nemáš oprávnění přidávat články!');
    if(!title || !content || !image) return alert('Vyplň nadpis, obsah a vyber obrázek!');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:3000/news', {
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
    const res = await fetch("http://localhost:3000/gallery");
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
    if (!category || !subcategory || !name || !image) return alert('Vyplň všechny povinné údaje!');

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
      const res = await fetch('http://localhost:3000/gallery', {
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

    const formData = new FormData(factForm);

    try {
      const res = await fetch('http://localhost:3000/facts', {
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
