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
    addProfile:       document.getElementById("addAdditionalInfo"),
    updateProfile:    document.getElementById("updateProfile"),
    deleteProfile:    document.getElementById("deleteProfile"),
    errorMsg:         document.getElementById("errorMsg"),
  };

  const display = {
    name:       document.getElementById("name"),
    age:        document.getElementById("age"),
    gender:     document.getElementById("gender"),
    biography:  document.getElementById("biography"),
  };

  const inputs = {
    name: document.getElementById("inputName"),
    age:       document.getElementById("inputAge"),
    gender:    document.getElementById("inputGender"),
    biography: document.getElementById("inputBiography"),
  };

  const buttons = {
    create: document.getElementById("btnSaveAdditionalInfo"),
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
      sections.addProfile.hidden    = true;

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
      inputs.age.value       = data.user.age ?? "";
      inputs.gender.value    = data.user.gender ?? "";
      inputs.biography.value = data.user.biography ?? "";
    } else {
      // Kein Profil vorhanden
      sections.addProfile.hidden    = false;
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
  // 5) CREATE-Handler
  // ═══════════════════════════════════════════════
  buttons.create.addEventListener("click", async () => {
    sections.errorMsg.textContent = "";
    const payload = {
      name: inputs.name.value.trim(),
      age:       inputs.age.value,
      gender:    inputs.gender.value,
      biography: inputs.biography.value.trim(),
    };
    try {
      const res    = await fetch("/api/profile/createProfile.php", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        window.location.reload();
      } else {
        sections.errorMsg.textContent = result.error || result.message || "Fehler beim Anlegen des Profils.";
      }
    } catch (err) {
      sections.errorMsg.textContent = "Netzwerkfehler beim Anlegen des Profils.";
      console.error(err);
    }
  });

  // ═══════════════════════════════════════════════
  // 6) UPDATE-Handler
  // ═══════════════════════════════════════════════
  buttons.update.addEventListener("click", async () => {
    sections.errorMsg.textContent = "";
    const payload = {
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
      const result = await res.json();
      if (result.success) {
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
        window.location.reload();
      } else {
        sections.errorMsg.textContent = result.error || result.message || "Fehler beim Löschen des Profils.";
      }
    } catch (err) {
      sections.errorMsg.textContent = "Netzwerkfehler beim Löschen des Profils.";
      console.error(err);
    }
  });

})();
