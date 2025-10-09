document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('add-object-form');
  const nameInput = document.getElementById('object-name');
  const categorySelect = document.getElementById('object-category');

  // --- Načtení seznamu objektů ---
  async function loadObjects() {
    try {
      const res = await fetch('http://localhost:3000/objects');
      const data = await res.json();
      if(!data.success) return;

      const lists = {
        star: document.getElementById('list-star'),
        messier: document.getElementById('list-messier'),
        ngc: document.getElementById('list-ngc'),
        ic: document.getElementById('list-ic'),
        other: document.getElementById('list-other')
      };
      Object.values(lists).forEach(ul => ul.innerHTML = '');

      data.objects.forEach(obj => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = obj.name;
        if(lists[obj.category]) lists[obj.category].appendChild(li);
      });
    } catch(err) {
      console.error(err);
      alert('Nepodařilo se načíst objekty');
    }
  }

  loadObjects();

  // --- Odeslání formuláře ---
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const category = categorySelect.value;
      const role = localStorage.getItem('role'); // role z přihlášení

      if(!name) return;

      try {
        const res = await fetch('http://localhost:3000/objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, category, role })
        });
        const data = await res.json();
        if(data.success){
          form.reset();
          loadObjects();
        } else {
          alert(data.msg || 'Chyba při přidávání');
        }
      } catch(err){
        console.error(err);
        alert('Chyba při komunikaci se serverem');
      }
    });
  }

  // --- Skrýt formulář pokud nejsem admin ---
  const formContainer = document.querySelector('.add-object-form');
  const role = localStorage.getItem('role');
  if(role !== 'admin') formContainer.style.display = 'none';

});
