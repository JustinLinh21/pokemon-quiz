// 1. Wir holen uns die Elemente aus dem HTML, damit wir sie ändern können
const bild = document.getElementById("pokemon-bild");
const nameText = document.getElementById("pokemon-name");
const knopf = document.getElementById("neu-knopf");

// 2. Diese Funktion lädt ein zufälliges Pokémon von der API
async function ladePokemon() {
  // Zufällige Zahl zwischen 1 und 151 (die erste Generation)
  const id = Math.floor(Math.random() * 151) + 1;

  // Anfrage an die API schicken und auf die Antwort warten
  const antwort = await fetch("https://pokeapi.co/api/v2/pokemon/" + id);

  // Die Antwort in ein JavaScript-Objekt umwandeln
  const daten = await antwort.json();

  // Zum Anschauen: Öffne im Browser F12 → Console
  console.log(daten);

  // Bild und Name auf der Seite anzeigen
  bild.src = daten.sprites.other["official-artwork"].front_default;
  nameText.textContent = daten.name;
}

// 3. Wenn man auf den Knopf klickt, laden wir ein neues Pokémon
knopf.addEventListener("click", ladePokemon);

// 4. Beim Start der Seite direkt ein Pokémon laden
ladePokemon();
