const newsForm = document.getElementById('add-news-form');

if(newsForm){
  newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('news-title').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const image = document.getElementById('news-image').files[0]; // soubor
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
