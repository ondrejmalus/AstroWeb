let gallery = [];
let stats = {};

document.addEventListener("DOMContentLoaded", async () => {

  await loadGallery();
  await loadStats();

  renderCommunityStats();
  renderGalleryStats();
  renderTypeStats();
  renderInterestingStats();
  renderTopObjects();
});

async function loadGallery() {

  const res = await fetch("/gallery");
  gallery = await res.json();

}

function createCard(icon, title, value) {

  return `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="card-stats text-center h-100" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.54); border-radius: 12px;">
        <div class="card-body">
          <div style="font-size:2.4rem;margin-bottom:5px">${icon}</div>
          <h6>${title}</h6>
          <h4>${value}</h4>
        </div>
      </div>
    </div>
  `;

}

function renderGalleryStats() {

  const el = document.getElementById("stats-gallery");

  const images = gallery.length;

  const categories = new Set(gallery.map(x => x.category));
  const subcategories = new Set(gallery.map(x => x.subcategory));
  const constellations = new Set(
    gallery.map(x => x.constellation).filter(Boolean)
  );

el.innerHTML =
    createCard("📸", "Počet snímků", images) +
    createCard("🗂", "Kategorie", categories.size) +
    createCard("🧩", "Podkategorie", subcategories.size) +
    createCard("✨", "Souhvězdí", constellations.size) +
    createCard("🖼", "Externí snímky", stats.extraImages);
}

function renderTypeStats() {

  const el = document.getElementById("stats-types");

  const galaxies =
    gallery.filter(x => x.category === "galaxie").length;

  const nebulae =
    gallery.filter(x => x.category === "mlhoviny").length;

  const clusters =
    gallery.filter(x => x.category === "hvězdokupy").length;

  const stars =
    gallery.filter(x => x.category === "hvězdy").length;

  const solar =
    gallery.filter(x => x.category === "sluneční_soustava").length;

  const subCounts = {};

  gallery.forEach(obj => {

    if (!obj.subcategory) return;

    subCounts[obj.subcategory] =
      (subCounts[obj.subcategory] || 0) + 1;

  });

const mostSub =
  Object.entries(subCounts)
    .sort((a,b)=>b[1]-a[1])[0];

  el.innerHTML =
    createCard("🌌", "Galaxie", galaxies) +
    createCard("☁️", "Mlhoviny", nebulae) +
    createCard("✨", "Hvězdokupy", clusters) +
    createCard("⭐", "Hvězdy", stars) +
    createCard("🪐", "Sluneční soustava", solar)+
    createCard("✨", "Nejčastější podkategorie", mostSub ? `${mostSub[0]} (${mostSub[1]})` : "-"
  );
}

function renderInterestingStats() {

  const el = document.getElementById("stats-interesting");

  const distances = gallery
    .filter(x => x.distance)
    .map(x => ({ name: x.name, distance: Number(x.distance) }));

  const farthest =
    distances.sort((a,b)=>b.distance-a.distance)[0];

  const nearest =
    distances.sort((a,b)=>a.distance-b.distance)[0];

  const constellationCount = {};

  const avgDistance =
  distances.reduce((a,b)=>a+b.distance,0) /
  distances.length;

  gallery.forEach(obj => {

    if(!obj.constellation) return;

    constellationCount[obj.constellation] =
      (constellationCount[obj.constellation] || 0) + 1;

  });

  const mostConstellation =
    Object.entries(constellationCount)
      .sort((a,b)=>b[1]-a[1])[0];

  el.innerHTML =
    createCard(
      "🌠",
      "Nejvzdálenější objekt",
      farthest?.name || "-"
    ) +
    createCard(
      "💫",
      "Nejbližší objekt mimo sluneční soustavu",
      nearest?.name || "-"
    ) +
    createCard(
      "🔭",
      "Nejvíce objektů v souhvězdí",
      mostConstellation
        ? `${mostConstellation[0]} (${mostConstellation[1]})`
        : "-"
    )+
    createCard(
      "📏",
      "Průměrná vzdálenost",
      Math.round(avgDistance).toLocaleString("cs-CZ") + " ly"
    );
}

async function loadStats() {

  const res = await fetch("/stats");
  stats = await res.json();

}

function renderCommunityStats() {

  const el = document.getElementById("stats-community");

  el.innerHTML =
    createCard("👨‍🚀", "Astronauti", stats.users) +
    createCard("❤️", "Celkové lajky", stats.likes) +
    createCard(
      "⭐",
      "Nejoblíbenější kategorie",
      stats.favCategory
        ? `${stats.favCategory.category} (${stats.favCategory.count})`
        : "-"
    ) +
    createCard(
        "📋", 
        "Nejoblíbenější podkategorie", 
        stats.favSubcategory
        ? `${stats.favSubcategory.subcategory} (${stats.favSubcategory.count})`
        : "-"
    ) +
    createCard(
      "✨",
      "Nejoblíbenější souhvězdí",
      stats.favConstellation
        ? `${stats.favConstellation.constellation} (${stats.favConstellation.count})`
        : "-"
    );
}

function renderTopObjects() {

  const el = document.getElementById("stats-top");

  if (!el) return;

  el.innerHTML =
    createCard(
      "⭐",
      "Nejoblíbenější objekt",
      stats.mostLikedObject
        ? `${stats.mostLikedObject.common_name} (${stats.mostLikedObject.likes})`
        : "-"
    ) +

    createCard(
      "📸",
      "Nejfotografovanější objekt",
      stats.mostPhotographedObject
        ? `${stats.mostPhotographedObject.common_name} (${stats.mostPhotographedObject.images})`
        : "-"
    );

}