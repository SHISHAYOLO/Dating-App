// js/profile.js

(async function() {
  // ═══════════════════════════════════════════════
  // 1) Authentifizierungsprüfung
  // ═══════════════════════════════════════════════
  async function checkAuth() {
    try {
      const res = await fetch("/api/profile/readProfile.php", {
        credentials: "include"
      });
      if (res.status === 401) {
        window.location.href = "login.html";
        return false;
      }
      return true;
    } catch (err) {
      console.error("Auth-Check fehlgeschlagen:", err);
      window.location.href = "login.html";
      return false;
    }
  }

  if (!await checkAuth()) return;

  // ═══════════════════════════════════════════════
  // 2) Profil laden (READ)
  // ═══════════════════════════════════════════════
  async function loadProfile() {
    console.log("Lade Profil...");
    const res = await fetch("/api/profile/readProfile.php", {
      credentials: "include"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // ═══════════════════════════════════════════════
  // 3) DOM-Elemente
  // ═══════════════════════════════════════════════
  const sections = {
    userProfile:      document.getElementById("userProfile"),
    updateProfile:    document.getElementById("updateProfile"),
    deleteProfile:    document.getElementById("deleteProfile"),
    errorMsg:         document.getElementById("errorMsg"),
  };

  const display = {
    name:       document.getElementById("showName"),
    age:        document.getElementById("showAge"),
    gender:     document.getElementById("showGender"),
    biography:  document.getElementById("showBiography"),
  };

  const inputs = {
    name: document.getElementById("inputName"),
    age:       document.getElementById("inputAge"),
    gender:    document.getElementById("inputGender"),
    biography: document.getElementById("inputBiography"),
  };

  const buttons = {
    update: document.getElementById("btnUpdateProfile"),
    delete: document.getElementById("btnDeleteInformation"),
  };

  // ═══════════════════════════════════════════════
  // 4) Initiales Laden und UI-Setup
  // ═══════════════════════════════════════════════
  let profileExists = false;
  try {
    const data = await loadProfile();
    console.log("Profil geladen:", data);
    if (data.user && data.user.name) {
      profileExists = true;

      // Sichtbarkeit der Sektionen
      sections.userProfile.hidden   = false;
      sections.updateProfile.hidden = false;
      sections.deleteProfile.hidden = false;

      // Anzeige-Populate
      display.name.textContent = data.user.name;
      display.age.textContent       = data.user.age ?? "–";
      display.gender.textContent    = ({
        m: "männlich",
        w: "weiblich",
        d: "divers"
      })[data.user.gender] ?? "–";
      display.biography.textContent = data.user.biography ?? "–";

      // Inputs für Update
      inputs.name.value       = data.user.name;
      inputs.age.value       = data.user.age ?? "";
      inputs.gender.value    = data.user.gender ?? "";
      inputs.biography.value = data.user.biography ?? "";
    } else {
      // Kein Profil vorhanden
      sections.userProfile.hidden   = true;
      sections.updateProfile.hidden = true;
      sections.deleteProfile.hidden = true;
    }
  } catch (err) {
    console.error("Profil konnte nicht geladen werden:", err);
    sections.errorMsg.textContent = "Profil konnte nicht geladen werden.";
    console.error(err);
  }

  // ═══════════════════════════════════════════════
  // 6) UPDATE-Handler
  // ═══════════════════════════════════════════════
  buttons.update.addEventListener("click", async () => {
    sections.errorMsg.textContent = "";
    const payload = {
      name:      inputs.name.value.trim(),
      age:       inputs.age.value,
      gender:    inputs.gender.value,
      biography: inputs.biography.value.trim(),
    };
    try {
      const res    = await fetch("/api/profile/updateProfile.php", {
        method:      "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(payload),
      });
      
      if (res.status === 200) {
        window.location.reload();
      } else {
        sections.errorMsg.textContent = result.error || result.message || "Fehler beim Aktualisieren des Profils.";
      }
    } catch (err) {
      sections.errorMsg.textContent = "Netzwerkfehler beim Aktualisieren des Profils.";
      console.error(err);
    }
  });

  // ═══════════════════════════════════════════════
  // 7) DELETE-Handler
  // ═══════════════════════════════════════════════
  buttons.delete.addEventListener("click", async () => {
    if (!confirm("Möchtest du dein Profil wirklich löschen?")) return;
    sections.errorMsg.textContent = "";
    try {
      const res    = await fetch("/api/profile/deleteProfile.php", {
        method:      "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        // redirect to index.html
        alert("Profil erfolgreich gelöscht.");
        
        window.location.href = "index.html";
      } else {
        sections.errorMsg.textContent = result.error || result.message || "Fehler beim Löschen des Profils.";
      }
    } catch (err) {
      sections.errorMsg.textContent = "Netzwerkfehler beim Löschen des Profils.";
      console.error(err);
    }
  });

})();
