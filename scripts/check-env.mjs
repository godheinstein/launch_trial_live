const requiredForLiveMode = ["VITE_CONVEX_URL", "CONVEX_DEPLOYMENT", "OPENAI_API_KEY"];
const optionalServices = ["ELEVENLABS_API_KEY", "FAL_KEY"];

function readEnv(name) {
  return process.env[name]?.trim() ?? "";
}

function printStatus(name, required) {
  const value = readEnv(name);
  if (value) {
    console.log(`OK ${name} is set.`);
    return;
  }

  const label = required ? "Missing" : "Optional";
  const detail = required
    ? "Live mode may not work until this is configured."
    : "Related enhancement can be skipped for the core demo.";
  console.warn(`${label}: ${name}. ${detail}`);
}

console.log("Checking Launch Trial Live environment variables...\n");

for (const name of requiredForLiveMode) {
  printStatus(name, true);
}

for (const name of optionalServices) {
  printStatus(name, false);
}

console.log("\nTip: create .env.local from .env.example for local Vite and Convex development.");
