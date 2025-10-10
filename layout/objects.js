document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('add-object-form');
  const nameInput = document.getElementById('object-name');
  const categorySelect = document.getElementById('object-category');
  const searchInput = document.getElementById('object-search');
  const searchBtn = document.getElementById('search-btn');

  // --- Globální seznamy kategorií ---
  const lists = {
    star: document.getElementById('list-star'),
    messier: document.getElementById('list-messier'),
    ngc: document.getElementById('list-ngc'),
    ic: document.getElementById('list-ic'),
    other: document.getElementById('list-other')
  };

  // --- Načtení seznamu objektů ---
  async function loadObjects() {
    try {
      const res = await fetch('http://localhost:3000/objects');
      const data = await res.json();
      if (!data.success) return;

      // Vyprázdnit všechny seznamy
      Object.values(lists).forEach(ul => ul.innerHTML = '');

// Seřadit položky podle kategorie
const sortedObjects = data.objects.sort((a, b) => {
  const numericCategories = ['messier', 'ngc', 'ic'];
  if (numericCategories.includes(a.category) && numericCategories.includes(b.category)) {
    const numA = parseInt(a.name.replace(/\D/g, ''), 10);
    const numB = parseInt(b.name.replace(/\D/g, ''), 10);
    return numA - numB;
  }
  // Abecedně pro ostatní kategorie
  return a.name.localeCompare(b.name);
});


      sortedObjects.forEach(obj => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = obj.name;
        if (lists[obj.category]) lists[obj.category].appendChild(li);
      });
    } catch (err) {
      console.error(err);
      alert('Nepodařilo se načíst objekty');
    }
  }

  loadObjects();

  // --- Odeslání formuláře ---
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const category = categorySelect.value;
      const role = localStorage.getItem('role'); // role z přihlášení

      if (!name) return;

      try {
        const res = await fetch('http://localhost:3000/objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, category, role })
        });
        const data = await res.json();
        if (data.success) {
        form.reset();
        loadObjects();
        alert('Objekt byl úspěšně přidán ✅');
          } else {
        alert(data.msg || '❌ Nastala chyba při přidávání objektu');
      }
      } catch (err) {
        console.error(err);
        alert('Chyba při komunikaci se serverem');
      }
    });
  }

  // --- Skrýt formulář pokud nejsem admin ---
  const formContainer = document.querySelector('.add-object-form');
  const role = localStorage.getItem('role');
  if (role !== 'admin') formContainer.style.display = 'none';

  // --- Vyhledávač ---
  function filterObjects() {
    const filter = searchInput.value.toLowerCase();
    Object.values(lists).forEach(ul => {
      Array.from(ul.children).forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(filter) ? '' : 'none';
      });
    });
  }

  const resetBtn = document.getElementById('reset-search');

if (searchBtn) {
  searchBtn.addEventListener('click', filterObjects); // hledání po kliknutí
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    Object.values(lists).forEach(ul => {
      Array.from(ul.children).forEach(li => li.style.display = '');
    });
  });
}

});
