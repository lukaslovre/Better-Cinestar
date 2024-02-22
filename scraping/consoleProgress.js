function drawProgressBar(percent) {
  const length = 40; // Length of the progress bar
  const position = Math.floor(percent * length);

  // Create the progress bar string
  const progressBar = Array(length).fill("\u2591");
  for (let i = 0; i < position; i++) {
    progressBar[i] = "█";
  }
  const progressBarString = progressBar.join("");

  // Write the message and progress bar to the console
  if (process.stdout.clearLine && process.stdout.cursorTo) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`[${progressBarString}] ${Math.floor(percent * 100)}%`);
  } else {
    // Fallback behavior if clearLine() or cursorTo() are not available
    process.stdout.write(`[${progressBarString}] ${Math.floor(percent * 100)}%\n`);
  }
}

// Test the progress bar
// let percent = 0;
// const interval = setInterval(() => {
//   percent += 0.01;
//   drawProgressBar(percent);
//   if (percent >= 1) clearInterval(interval);
// }, 100);

module.exports = { drawProgressBar };
