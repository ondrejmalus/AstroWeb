// ================================
// FORMULÁŘ PRO ČLÁNKY
// ================================
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

// ================================
// FORMULÁŘ PRO GALERII
// ================================
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
  });

  // Odeslání formuláře
  galleryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

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