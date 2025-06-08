// js/register.js
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Werte aus dem Formular auslesen
    const name      = document.getElementById("inputName").value.trim();
    const email     = document.getElementById("inputEmail").value.trim();
    const password  = document.getElementById("inputPassword").value;
    const age       = document.getElementById("inputAge").value;
    const gender    = document.getElementById("inputGender").value;
    const biography = document.getElementById("inputBiography").value.trim();

    // Einfache Client-Validierung
    if (!name || !email || !password || !age || !gender || !biography) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const response = await fetch("api/register.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          name,
          email,
          password,
          age,
          gender,
          biography
        })
      });

      const result = await response.json();

      if (result.status === "success") {
        alert("Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
        window.location.href = "login.html";
      } else {
        alert(result.message || result.error || "Registrierung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.");
    }
  });
