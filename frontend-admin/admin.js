function showError(msg) {

  const box =
    document.getElementById("globalError");

  if (box) {

    box.textContent = msg;
    box.style.display = "block";

    setTimeout(() => {
      box.style.display = "none";
    }, 4000);

  } else {

    console.error(msg);

  }

}

function showSuccess(msg) {

  const box =
    document.getElementById("globalSuccess");

  if (box) {

    box.textContent = msg;
    box.style.display = "block";

    setTimeout(() => {
      box.style.display = "none";
    }, 3000);

  }

}

function showToast(message) {

  const toastEl =
    document.getElementById("successToast");

  const toastText =
    document.getElementById("successToastText");

  if (!toastEl) return;

  toastText.textContent = message;

const toast = new bootstrap.Toast(toastEl, {
  delay: 3000
});

  toast.show();

}

// =====================================================
// ADMIN.JS — SAFE VERSION FOR ELECTRON
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

  const gallerySearch =
  document.getElementById("searchInput");

if (gallerySearch) {

  gallerySearch.addEventListener("input", e => {

    const val =
      e.target.value.toLowerCase();

    const filtered =
      galleryData.filter(item =>

        item.name.toLowerCase().includes(val)
        ||
        (item.common_name || "")
          .toLowerCase()
          .includes(val)
        ||
        (item.constellation || "")
          .toLowerCase()
          .includes(val)
        ||
        item.category
          .toLowerCase()
          .includes(val)

      );

    renderGallery(filtered);

  });

}

  console.log("ADMIN JS READY");

  // =====================================================
  // LOGIN
  // =====================================================

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("loginError");

  if (loginForm) {

    loginForm.addEventListener("submit", async e => {

      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {

        if (errorBox)
          errorBox.textContent = "Vyplň všechna pole";

        return;
      }

      try {

        const res =
          await window.adminAPI.login({
            username,
            password
          });

        if (res.success) {

          if (errorBox)
            errorBox.textContent = "";

          window.adminAPI.goTo("welcome");

        } else {

          if (errorBox)
            errorBox.textContent =
              res.msg || "Přihlášení selhalo";

        }

      } catch {

        if (errorBox)
          errorBox.textContent =
            "Server nedostupný";

      }

    });

  }


  // clear error on typing
  if (usernameInput) {
    usernameInput.addEventListener("input", () => {
      if (errorBox) errorBox.textContent = "";
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      if (errorBox) errorBox.textContent = "";
    });
  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  window.goTo = function(page) {
    window.adminAPI.goTo(page.replace(".html", ""));
  };

  window.logout = function() {
    window.adminAPI.logout();
  };


  // =====================================================
  // SESSION CHECK
  // =====================================================

  async function ensureAdmin() {

    const session =
      await window.adminAPI.getSession();

    if (!session || session.role !== "admin") {

      alert("Nejsi přihlášen jako admin");

      window.adminAPI.goTo("login");

      return false;
    }

    return true;
  }


  // =====================================================
  // NEWS FORM
  // =====================================================

const newsForm = document.getElementById("add-news-form");

if (newsForm) {

  newsForm.addEventListener("submit", async e => {

    e.preventDefault();

    if (!(await ensureAdmin())) return;

    const title =
      document.getElementById("news-title").value.trim();

    const content =
      document.getElementById("news-content").value.trim();

    const imageInput =
      document.getElementById("news-image");

    if (!title || !content || !imageInput.files.length) {
      showError("Vyplň všechna pole");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", imageInput.files[0]);

    try {

      const res = await fetch(
        "http://localhost:3000/news",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (data.success) {

        showSuccess("Článek přidán");

        newsForm.reset();

      } else {

        showError(data.error || data.msg);

      }

    } catch {

      showError("Server nedostupný");

    }

  });

}


  // =====================================================
  // GALLERY FORM
  // =====================================================

  const subcategories = {
  sluneční_soustava: ["Planeta", "Slunce", "Měsíc", "Ostatní objekty"],
  hvězdy: ["Nadobr", "Jasný obr", "Obr", "Podobr", "Hvězdy hlavní posloupnosti"],
  mlhoviny: ["Emisní", "Planetární", "Reflexní", "Pozůstatky supernov"],
  hvězdokupy: ["Kulové", "Otevřené"],
  galaxie: ["Eliptické", "Spirální"]
};

const categorySelect =
  document.getElementById("gallery-category");

const subcategorySelect =
  document.getElementById("gallery-subcategory");

if (categorySelect && subcategorySelect) {

  categorySelect.addEventListener("change", () => {

    const list =
      subcategories[categorySelect.value] || [];

    subcategorySelect.innerHTML =
      '<option value="">Vyber podkategorii</option>';

    list.forEach(sub => {

      const opt =
        document.createElement("option");

      opt.value =
        sub.toLowerCase().replaceAll(" ", "_");

      opt.textContent = sub;

      subcategorySelect.appendChild(opt);

    });

  });

}

  const galleryForm =
    document.getElementById("add-gallery-form");

  if (galleryForm) {

    galleryForm.addEventListener("submit", async e => {

      e.preventDefault();

      if (!(await ensureAdmin())) return;

      const imageInput =
        document.getElementById("gallery-image");

      if (!imageInput.files.length) {
        alert("Vyber obrázek");
        return;
      }

      const formData = new FormData();

      formData.append(
        "category",
        document.getElementById("gallery-category").value
      );

      formData.append(
        "subcategory",
        document.getElementById("gallery-subcategory").value
      );

      formData.append(
        "name",
        document.getElementById("gallery-name").value
      );

      formData.append(
        "common_name",
        document.getElementById("gallery-common_name").value
      );

      formData.append(
        "constellation",
        document.getElementById("gallery-constellation").value
      );

      formData.append(
        "distance",
        document.getElementById("gallery-distance").value
      );

      formData.append(
        "fact",
        document.getElementById("gallery-fact").value
      );

      formData.append(
        "image",
        imageInput.files[0]
      );

      try {

        const res =
          await fetch(
            "http://localhost:3000/gallery",
            {
              method: "POST",
              body: formData
            }
          );

        const data =
          await res.json();

        if (data.success) {

          showSuccess("Snímek přidán");

          galleryForm.reset();

        } else {

          showError(data.error || "Chyba");

        }

      } catch {

        alert("Server nedostupný");

      }

    });

  }

  const constellationInput =
  document.getElementById("gallery-constellation");

const constellationDropdown =
  document.getElementById("constellation-dropdown");

let constellationList = [];

async function loadConstellations() {

  try {

    const res =
      await fetch("http://localhost:3000/gallery");

    const data =
      await res.json();

    constellationList =
      [...new Set(
        data
          .map(x => x.constellation)
          .filter(Boolean)
      )];

  } catch {}

}

if (constellationInput) {

  loadConstellations();

  constellationInput.addEventListener("input", () => {

    const value =
      constellationInput.value.toLowerCase();

    constellationDropdown.innerHTML = "";

    constellationList
      .filter(c =>
        c.toLowerCase().includes(value)
      )
      .forEach(c => {

        const div =
          document.createElement("div");

        div.textContent = c;

        div.onclick = () => {

          constellationInput.value = c;

          constellationDropdown.innerHTML = "";

        };

        constellationDropdown.appendChild(div);

      });

  });

}


  // =====================================================
  // FACT FORM
  // =====================================================

  const factForm =
    document.getElementById("add-fact-form");

  if (factForm) {

    factForm.addEventListener("submit", async e => {

      e.preventDefault();

      if (!(await ensureAdmin())) return;

      const formData =
        new FormData(factForm);

      try {

        const res =
          await fetch(
            "http://localhost:3000/facts",
            {
              method: "POST",
              body: formData
            }
          );

        const data =
          await res.json();

        if (data.success) {

          showSuccess("Zajímavost přidána");

          factForm.reset();

        }

      } catch {

        alert("Server nedostupný");

      }

    });

  }


// =====================================================
// BADGE FORM
// =====================================================

const badgeForm =
  document.getElementById("add-badge-form");

if (badgeForm) {

  badgeForm.addEventListener("submit", async e => {

    e.preventDefault();

    if (!(await ensureAdmin())) return;

    const formData = new FormData();

    formData.append(
      "badge_key",
      document.getElementById("badge-key").value
    );

    formData.append(
      "name",
      document.getElementById("badge-name").value
    );

    formData.append(
      "description",
      document.getElementById("badge-description").value
    );

    formData.append(
      "trigger_type",
      document.getElementById("badge-trigger").value
    );

    formData.append(
      "trigger_value",
      document.getElementById("badge-value").value
    );

    const icon =
      document.getElementById("badge-icon").files[0];

    if (icon)
      formData.append("icon", icon);

    try {

      const res =
        await fetch(
          "http://localhost:3000/badges",
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await res.json();

      if (data.success) {

        showSuccess("Badge přidána");

        badgeForm.reset();

      }

    } catch {

      showError("Server nedostupný");

    }

  });

}


// =====================================================
// EXTRA IMAGE FORM
// =====================================================

const extraForm =
  document.getElementById("add-gallery-extra-image-form");

if (extraForm) {

  extraForm.addEventListener("submit", async e => {

    e.preventDefault();

    if (!(await ensureAdmin())) return;

    const galleryId =
      document.getElementById("extra-gallery-id").value;

    const image =
      document.getElementById("extra-gallery-image").files[0];

    if (!galleryId || !image) {
      showError("Vyber objekt a obrázek");
      return;
    }

    const formData =
      new FormData();

    formData.append("image", image);

    try {

      const res =
        await fetch(
          `http://localhost:3000/gallery/${galleryId}/images`,
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await res.json();

      if (data.success) {

        showSuccess("Snímek přidán");

        extraForm.reset();

      }

    } catch {

      showError("Server nedostupný");

    }

  });

}

const extraSearch =
  document.getElementById("extra-gallery-search");

const extraDropdown =
  document.getElementById("extra-gallery-dropdown");

const extraId =
  document.getElementById("extra-gallery-id");

let galleryObjects = [];

async function loadGalleryObjects() {

  const res =
    await fetch("http://localhost:3000/gallery");

  galleryObjects =
    await res.json();

}

if (extraSearch) {

  loadGalleryObjects();

  extraSearch.addEventListener("input", () => {

    const value =
      extraSearch.value.toLowerCase();

    extraDropdown.innerHTML = "";

    galleryObjects
      .filter(obj =>
        obj.name.toLowerCase().includes(value)
      )
      .forEach(obj => {

        const div =
          document.createElement("div");

        div.textContent =
          `${obj.name} (${obj.category})`;

        div.onclick = () => {

          extraSearch.value = obj.name;
          extraId.value = obj.id;

          extraDropdown.innerHTML = "";

        };

        extraDropdown.appendChild(div);

      });

  });

}

});

// =====================================================
// EDIT PAGE LOGIC
// =====================================================

let galleryData = [];
let newsData = [];
let factsData = [];

let galleryModal;
let newsModal;
let factModal;


// init when edit page loads
document.addEventListener("DOMContentLoaded", async () => {

  if (document.getElementById("galleryTableBody")) {

    galleryModal =
      new bootstrap.Modal(
        document.getElementById("editGalleryModal")
      );

    newsModal =
      new bootstrap.Modal(
        document.getElementById("editNewsModal")
      );

    factModal =
      new bootstrap.Modal(
        document.getElementById("editFactModal")
      );

    await loadGallery();
    await loadNews();
    await loadFacts();

  }

});


// =====================================================
// LOAD GALLERY
// =====================================================

async function loadGallery() {

  try {

    const res =
      await fetch("http://localhost:3000/gallery");

    galleryData =
      await res.json();

    renderGallery(galleryData);

  } catch {

    showError("Nepodařilo se načíst galerii");

  }

}


function renderGallery(data) {

  const tbody =
    document.getElementById("galleryTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(item => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
    <td>
      <img
        src="http://localhost:3000/images/${item.image}"
        class="admin-thumb"
        style="width:80px;border-radius:6px"
      >
    </td>
    <td>${item.name}</td>
    <td>${item.category}</td>
    <td>${item.constellation || "—"}</td>
    <td>
      <button class="btn btn-warning btn-sm me-1"
        onclick="editItem(${item.id})">
        Upravit
      </button>

      <button class="btn btn-danger btn-sm"
        onclick="deleteItem(${item.id})">
        Smazat
      </button>
    </td>
    `;

    tbody.appendChild(tr);

  });

}


// =====================================================
// DELETE GALLERY
// =====================================================

window.deleteItem = async function(id) {

  if (!confirm("Opravdu smazat snímek?")) return;

  try {

    await fetch(
      `http://localhost:3000/gallery/${id}`,
      { method: "DELETE" }
    );

    galleryData =
      galleryData.filter(x => x.id !== id);

    renderGallery(galleryData);

    showSuccess("Snímek smazán");

  } catch {

    showError("Nepodařilo se smazat snímek");

  }

}


// =====================================================
// EDIT GALLERY
// =====================================================

window.editItem = function(id) {

  const item =
    galleryData.find(x => x.id === id);

  if (!item) return;

  document.getElementById("edit-id").value = item.id;
  document.getElementById("edit-name").value = item.name;
  document.getElementById("edit-common-name").value = item.common_name || "";
  document.getElementById("edit-constellation").value = item.constellation || "";
  document.getElementById("edit-fact").value = item.fact || "";

  galleryModal.show();

};


window.saveEdit = async function() {

  const id =
    document.getElementById("edit-id").value;

  const fd =
    new FormData();

  fd.append(
    "name",
    document.getElementById("edit-name").value
  );

  fd.append(
    "common_name",
    document.getElementById("edit-common-name").value
  );

  fd.append(
    "constellation",
    document.getElementById("edit-constellation").value
  );

  fd.append(
    "fact",
    document.getElementById("edit-fact").value
  );

  const image =
    document.getElementById("edit-image").files[0];

  if (image)
    fd.append("image", image);

  try {

    await fetch(
      `http://localhost:3000/gallery/${id}`,
      {
        method: "PUT",
        body: fd
      }
    );

    showToast("Snímek byl úspěšně uložen");

    galleryModal.hide();

    await loadGallery();

  } catch {

    showError("Nepodařilo se uložit změny");

  }

};


// =====================================================
// NEWS
// =====================================================

async function loadNews() {

  try {

    const res =
      await fetch("http://localhost:3000/news");

    const json =
      await res.json();

    newsData =
      json.articles || [];

    renderNews(newsData);

  } catch {

    showError("Nepodařilo se načíst novinky");

  }

}


function renderNews(data) {

  const tbody =
    document.getElementById("newsTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(n => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${n.title}</td>

      <td>
        ${new Date(n.created_at)
          .toLocaleDateString("cs-CZ")}
      </td>

      <td>

        <button class="btn btn-warning btn-sm me-1"
          onclick="editNews(${n.id})">
          Upravit
        </button>

      </td>
    `;

    tbody.appendChild(tr);

  });

}


window.editNews = function(id) {

  const n =
    newsData.find(x => x.id === id);

  if (!n) return;

  document.getElementById("edit-news-id").value = n.id;
  document.getElementById("edit-news-title").value = n.title;
  document.getElementById("edit-news-content").value = n.content;

  newsModal.show();

};


window.saveNewsEdit = async function() {

  const id =
    document.getElementById("edit-news-id").value;

  const fd =
    new FormData();

  fd.append(
    "title",
    document.getElementById("edit-news-title").value
  );

  fd.append(
    "content",
    document.getElementById("edit-news-content").value
  );

  const image =
    document.getElementById("edit-news-image").files[0];

  if (image)
    fd.append("image", image);

  try {

    await fetch(
      `http://localhost:3000/news/${id}`,
      {
        method: "PUT",
        body: fd
      }
    );

    showToast("Článek byl uložen");

    newsModal.hide();

    await loadNews();

  } catch {

    showError("Nepodařilo se uložit článek");

  }

};


// =====================================================
// FACTS
// =====================================================

async function loadFacts() {

  try {

    const res =
      await fetch("http://localhost:3000/facts");

    const json =
      await res.json();

    factsData =
      json.facts || json.data || json;

    renderFacts(factsData);

  } catch {

    showError("Nepodařilo se načíst zajímavosti");

  }

}


function renderFacts(data) {

  const tbody =
    document.getElementById("factsTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(f => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
      <td>${f.category}</td>

      <td>${f.title}</td>

      <td>

        <button class="btn btn-warning btn-sm"
          onclick="editFact(${f.id})">
          Upravit
        </button>

      </td>
    `;

    tbody.appendChild(tr);

  });

}


window.editFact = function(id) {

  const f =
    factsData.find(x => x.id === id);

  if (!f) return;

  document.getElementById("edit-fact-id").value = f.id;
  document.getElementById("edit-fact-category").value = f.category;
  document.getElementById("edit-fact-title").value = f.title;
  document.getElementById("edit-fact-text").value = f.text;

  factModal.show();

};


window.saveFactEdit = async function() {

  const id =
    document.getElementById("edit-fact-id").value;

  const fd =
    new FormData();

  fd.append(
    "category",
    document.getElementById("edit-fact-category").value
  );

  fd.append(
    "title",
    document.getElementById("edit-fact-title").value
  );

  fd.append(
    "text",
    document.getElementById("edit-fact-text").value
  );

  const image =
    document.getElementById("edit-fact-image").files[0];

  if (image)
    fd.append("image", image);

  try {

    await fetch(
      `http://localhost:3000/facts/${id}`,
      {
        method: "PUT",
        body: fd
      }
    );

    showToast("Zajímavost byla uložena");

    factModal.hide();

    await loadFacts();

  } catch {

    showError("Nepodařilo se uložit zajímavost");

  }

};