// 1. Wir holen uns die Elemente aus dem HTML, damit wir sie ändern können
const bild = document.getElementById("pokemon-bild");
const tippFeld = document.getElementById("tipp-feld");
const ratenKnopf = document.getElementById("raten-knopf");
const ergebnis = document.getElementById("ergebnis");
const neuKnopf = document.getElementById("neu-knopf");

// Hier merken wir uns den richtigen Namen (am Anfang leer)
let richtigerName = "";

// 2. Diese Funktion lädt ein zufälliges Pokémon von der API
async function ladePokemon() {
  // Zufällige Zahl zwischen 1 und 151 (die erste Generation)
  const id = Math.floor(Math.random() * 151) + 1;

  // Anfrage an die API schicken und auf die Antwort warten
  const antwort = await fetch("https://pokeapi.co/api/v2/pokemon/" + id);
  const daten = await antwort.json();

  // Zweiter API-Aufruf: Hier stehen die Namen in allen Sprachen
  const speziesAntwort = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + id);
  const speziesDaten = await speziesAntwort.json();

  // Den Eintrag mit der Sprache "de" (Deutsch) suchen
  const deutsch = speziesDaten.names.find(function (eintrag) {
    return eintrag.language.name === "de";
  });

  // Den deutschen Namen merken (aber noch NICHT anzeigen!)
  richtigerName = deutsch.name.toLowerCase();

  // Bild anzeigen und wieder schwarz machen
  bild.src = daten.sprites.other["official-artwork"].front_default;
  bild.classList.add("silhouette");

  // Alles zurücksetzen für die neue Runde
  tippFeld.value = "";
  ergebnis.textContent = "";
}

// 3. Diese Funktion prüft, ob der Tipp richtig ist
function pruefeTipp() {
  // Was hat der Spieler eingetippt? (klein geschrieben, ohne Leerzeichen)
  const tipp = tippFeld.value.toLowerCase().trim();

  if (tipp === richtigerName) {
    // Ersten Buchstaben gross schreiben: "glurak" → "Glurak"
    const schoenerName = richtigerName.charAt(0).toUpperCase() + richtigerName.slice(1);
    ergebnis.textContent = "✅ Richtig! Es ist " + schoenerName + "!";
    bild.classList.remove("silhouette"); // Farbe zeigen
  } else {
    ergebnis.textContent = "❌ Leider falsch, versuch's nochmal!";
  }
}

// 4. Knöpfe mit den Funktionen verbinden
ratenKnopf.addEventListener("click", pruefeTipp);
neuKnopf.addEventListener("click", ladePokemon);

// Bonus: Mit der Enter-Taste raten
tippFeld.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    pruefeTipp();
  }
});

// 5. Beim Start der Seite direkt ein Pokémon laden
ladePokemon();
