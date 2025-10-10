document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Načtení navbaru z externího souboru
  const navbarContainer = document.createElement("div");
  document.body.prepend(navbarContainer);

  try {
    const response = await fetch("layout/navbar.html");
    if (!response.ok) throw new Error("Navbar se nepodařilo načíst.");
    navbarContainer.innerHTML = await response.text();
  } catch (err) {
    console.error("Chyba při načítání navbaru:", err);
    return;
  }

  // 2️⃣ Zvýraznění aktivní stránky
  const currentPage = location.pathname.split("/").pop() || "index.html";

  // mapování stránek, které sdílejí logickou sekci
  const activeMap = {
    "login.html": "login.html",
    "profile.html": "profile.html",
    "upload.html": "upload.html",
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    // Aktivní pokud přesně odpovídá stránce nebo patří do stejné "sekce"
    if (
      href === currentPage ||
      activeMap[currentPage] === href
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 3️⃣ Správa uživatelské role (guest / user / admin)
  const role = localStorage.getItem("userRole") || "guest";
  const authLinks = document.getElementById("auth-links");

  if (!authLinks) {
    console.warn("⚠️ Nebyl nalezen element #auth-links v navbaru!");
    return;
  }

  if (role === "user") {
    authLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="profile.html">
          <i class="fas fa-user-circle"></i> Profil
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout">
          <i class="fas fa-sign-out-alt"></i> Odhlásit
        </a>
      </li>
    `;
  } else if (role === "admin") {
    authLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="upload.html">
          <i class="fas fa-upload"></i> Upload
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout">
          <i class="fas fa-sign-out-alt"></i> Odhlásit
        </a>
      </li>
    `;
  } else {
    // Nepřihlášený uživatel
    authLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="login.html">
          <i class="fas fa-user"></i> Přihlášení
        </a>
      </li>
    `;
  }

  // 4️⃣ Znovu zvýrazní aktivní odkaz i mezi auth odkazy (např. login.html)
  const newLinks = document.querySelectorAll(".nav-link");
  newLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (
      href === currentPage ||
      activeMap[currentPage] === href
    ) {
      link.classList.add("active");
    }
  });

  // 5️⃣ Odhlášení
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("userRole");
    localStorage.removeItem("role"); // pro jistotu, pokud se někde používá starší klíč
    window.location.href = "login.html"; // přesměruje na login stránku
  });
}
});
