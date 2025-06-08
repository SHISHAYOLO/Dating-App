// js/mainpage.js
(async function() {
  // 1) Auth-Check & Begrüßung
  try {
    const res = await fetch("/api/mainpage.php", {
      credentials: "include"
    });
    if (res.status === 401) {
      // nicht eingeloggt → Login
      window.location.href = "login.html";
      return;
    }
    const result = await res.json();
    document.getElementById("greeting").textContent =
      `Hallo, ${result.user.name}!`;
  } catch (err) {
    console.error("Auth-Check fehlgeschlagen:", err);
    window.location.href = "login.html";
    return;
  }

  // 2) Button-Handler
  document
    .getElementById("btnFindMatches")
    .addEventListener("click", () => {
      window.location.href = "getMatches.html";
    });

  document
    .getElementById("btnViewMatches")
    .addEventListener("click", () => {
      window.location.href = "viewMatches.html";
    });
})();
