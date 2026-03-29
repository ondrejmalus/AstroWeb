document.addEventListener("DOMContentLoaded", async () => {
  // Načtení navbaru z externího souboru
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

  // Zvýraznění aktivní stránky
  let currentPage = location.pathname.split("/").pop();

  // když je root "/", ber to jako index
  if (!currentPage) currentPage = "index";

  // mapování stránek, které sdílejí logickou sekci
  const activeMap = {
    "login": "login",
    "profile": "profile",
    "upload": "upload",
    "edit": "upload",
    "thefact": "facts-page",
    "index": "index"
  };

  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    // Aktivní pokud přesně odpovídá stránce nebo patří do stejné "sekce"
    const cleanHrefRaw = href.replace(/^\/|\.html$/g, "");
    const cleanHref = cleanHrefRaw === "" ? "index" : cleanHrefRaw;

    if (
      cleanHref === currentPage ||
      activeMap[currentPage] === cleanHref
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Správa uživatelské role (guest / user / admin)
  const role = localStorage.getItem("userRole") || "guest";
  const authLinks = document.getElementById("auth-links");

  if (!authLinks) {
    console.warn("⚠️ Nebyl nalezen element #auth-links v navbaru!");
    return;
  }

  if (role === "user") {
    authLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/profile">
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
        <a class="nav-link" href="/profile">
          <i class="fas fa-user-circle"></i> Admin - Profil
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/upload">
          <i class="fas fa-upload"></i> Administrace
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
        <a class="nav-link" href="/login">
          <i class="fas fa-user"></i> Přihlášení
        </a>
      </li>
    `;
  }

  // Znovu zvýrazní aktivní odkaz i mezi auth odkazy
  const newLinks = document.querySelectorAll(".nav-link");
  newLinks.forEach(link => {
    const href = link.getAttribute("href");
    const cleanHref = href.replace("/", "");

    if (
      cleanHref === currentPage ||
      activeMap[currentPage] === cleanHref
    ) {
      link.classList.add("active");
    }
  });

  // Odhlášení
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("userRole");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "/login"; // přesměruje na login stránku
  });
}
});
