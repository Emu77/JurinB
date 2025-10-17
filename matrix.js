// Definieren des Zieltexts
const targetText = "Moin Juri!";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./<>?`~ ";
const framesPerSecond = 30;
const charactersToChangePerFrame = 1;

let currentText = Array(targetText.length).fill(' ');
let revealedChars = Array(targetText.length).fill(false);
let intervalId;
let frameCount = 0;

// Funktion zum Löschen der Konsolenausgabe
const clearConsole = () => {
  process.stdout.write('\x1B[2J\x1B[0f');
};

// Funktion zum Generieren eines zufälligen Zeichens
const getRandomChar = () => {
  return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
};

// Hauptfunktion für die Animation
const animate = () => {
  clearConsole();

  // Zufällige Zeichen, die noch nicht aufgedeckt wurden, mit Matrix-Effekt füllen
  let displayText = '';
  for (let i = 0; i < targetText.length; i++) {
    if (revealedChars[i]) {
      displayText += currentText[i];
    } else {
      displayText += getRandomChar();
    }
  }

  console.log(displayText);

  // Nach und nach Zeichen vom Zieltext aufdecken
  if (frameCount % charactersToChangePerFrame === 0) {
    let unrevealedIndices = [];
    for (let i = 0; i < revealedChars.length; i++) {
      if (!revealedChars[i]) {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length > 0) {
      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      revealedChars[randomIndex] = true;
      currentText[randomIndex] = targetText[randomIndex];
    } else {
      // Animation beenden, wenn alle Zeichen aufgedeckt sind
      clearInterval(intervalId);
    }
  }

  frameCount++;
};

// Animation starten
intervalId = setInterval(animate, 1000 / framesPerSecond);
