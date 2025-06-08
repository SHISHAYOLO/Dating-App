// js/getMatches.js
(async function() {
  // Prüfung, dass der Nutzer eingeloggt ist
  async function checkAuth() {
    const res = await fetch("/api/mainpage.php", {
      credentials: "include"
    });
    if (res.status === 401) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
  if (!await checkAuth()) return;

  const elems = {
    profileCard: document.getElementById("profileCard"),
    name:       document.getElementById("name"),
    age:        document.getElementById("age"),
    gender:     document.getElementById("gender"),
    biography:  document.getElementById("biography"),
    errorMsg:   document.getElementById("errorMsg"),
    btnNext:    document.getElementById("btnNext"),
    btnLike:    document.getElementById("btnLike")
  };

  let currentProfile = null;

  // Lädt ein random Profil
  async function loadRandomProfile() {
    elems.errorMsg.textContent = "";
    try {
      const res = await fetch("/api/getMatches.php", {
        credentials: "include"
      });
      if (res.status === 204) {
        elems.btnLike.disabled = true;
        elems.btnNext.disabled = true;
        elems.profileCard.style.display = "none";
        elems.errorMsg.textContent = "Keine weiteren Profile verfügbar.";
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      elems.profileCard.style.display = "block";
      elems.btnLike.disabled = false;
      elems.btnNext.disabled = false;
      const data = await res.json();
      currentProfile = data.user;
      elems.name.textContent      = `${currentProfile.name}`;
      elems.age.textContent       = currentProfile.age ?? "–";
      elems.gender.textContent    = ({
        m: "männlich",
        w: "weiblich",
        d: "divers"
      })[currentProfile.gender] ?? "–";
      elems.biography.textContent = currentProfile.biography ?? "–";
    } catch (err) {
      elems.errorMsg.textContent = "Fehler beim Laden des Profils.";
      console.error(err);
    }
  }

  // Speichert das aktuelle Profil als „Gefällt mir“
  async function likeCurrentProfile() {
    if (!currentProfile) return;
    elems.errorMsg.textContent = "";
    try {
      const res = await fetch("/api/likeMatch.php", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ matched_user_id: currentProfile.user_id })
      });
      const result = await res.json();
      if (result.status === "success") {
        // nach dem Like direkt nächstes Profil laden
        await loadRandomProfile();
      } else {
        elems.errorMsg.textContent = result.message || "Fehler beim Speichern.";
      }
    } catch (err) {
      elems.errorMsg.textContent = "Netzwerkfehler beim Speichern.";
      console.error(err);
    }
  }

  // Initiales Profil laden
  await loadRandomProfile();

  // Button-Handler
  elems.btnNext.addEventListener("click", loadRandomProfile);
  elems.btnLike.addEventListener("click", likeCurrentProfile);
})();
