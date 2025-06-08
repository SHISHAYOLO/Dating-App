(async function () {
  try {
    const res = await fetch("/api/meineMatches.php", {
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "login.html";
      return;
    }

    const matches = await res.json();
    const container = document.getElementById("matchesContainer");

    if (!Array.isArray(matches)) {
      throw new Error("Erwartete Matches als Array.");
    }

    if (matches.length === 0) {
        document.getElementById("noMatchesMsg").style.display = "block";
    } else {
        document.getElementById("noMatchesMsg").style.display = "none";
    }
    matches.forEach((match) => {
      const card = document.createElement("div");
      card.className = "match-card";
    
      let gender = "Unbekannt";
        switch (match.gender) {
            case "m":
                gender = "Männlich";
                break;
        case "w":
            gender = "Weiblich";
            break;
        case "d":    
            gender = "Divers";
            break;
        default:
            break;
        }
      card.innerHTML = `
        <div class="profile-pic">
          <img src="https://d11a6trkgmumsb.cloudfront.net/original/3X/d/8/d8b5d0a738295345ebd8934b859fa1fca1c8c6ad.jpeg" alt="Profilbild">
          
          <button class="call-btn">Telefonieren</button>
        </div>
        <div class="match-details">
          <div class="info-row">
            <span><strong>${match.name}</strong></span>
            <span><strong>${gender}</strong></span>
            <span><strong>${match.age}</strong></span>
          </div>
          <div class="bio">
            <strong>Biografie</strong>
            <p>${match.biography || "Keine Biografie vorhanden."}</p>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    const callButtons = document.getElementsByClassName("call-btn");
    
    Array.from(callButtons)
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        alert("Anruf gestartet! (Womöglich warten Sie noch lange auf eine Antwort.)");
      });
    });
  } catch (err) {
    console.error("Fehler beim Laden der Matches:", err);
  }
})();