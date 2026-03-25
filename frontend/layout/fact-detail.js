async function loadFact() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {
    const res = await fetch('/facts');
    const data = await res.json();

    if (!data.success) return;

    const fact = data.facts.find(f => f.id == id);
    if (!fact) return;

    document.getElementById("factTitle").innerText = fact.title;

    document.getElementById("factText").innerText = fact.text;

    document.getElementById("factCategory").innerText =
      fact.category === "personality"
        ? "Osobnost"
        : "Všeobecné";

    const img = document.getElementById("factImage");

    if (fact.image) {
      img.src = fact.image;
      img.classList.remove("d-none");
    }

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadFact);