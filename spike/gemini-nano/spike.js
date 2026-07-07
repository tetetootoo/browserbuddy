const statusEl = document.getElementById("status");
const runBtn = document.getElementById("run");
const resultsTable = document.getElementById("results");
const resultsBody = resultsTable.querySelector("tbody");

const LATENCY_TARGET_MS = 500;

const TEST_MATRIX = [
  {
    task: "translate",
    lang: "en → da",
    instruction: "Translate the following English text to Danish. Reply with only the translation.",
    input: "The quick brown fox jumps over the lazy dog.",
  },
  {
    task: "translate",
    lang: "en → de",
    instruction: "Translate the following English text to German. Reply with only the translation.",
    input: "The quick brown fox jumps over the lazy dog.",
  },
  {
    task: "define",
    lang: "en",
    instruction: "Define the following word in one short sentence.",
    input: "ubiquitous",
  },
  {
    task: "define",
    lang: "da",
    instruction: "Definer følgende ord på dansk i én kort sætning.",
    input: "medarbejder",
  },
  {
    task: "define",
    lang: "de",
    instruction: "Definiere das folgende Wort auf Deutsch in einem kurzen Satz.",
    input: "Datenschutz",
  },
  {
    task: "explain",
    lang: "en",
    instruction: "Explain what this technical message means to a non-technical reader, in one sentence.",
    input: "The API returned a 429 status code.",
  },
  {
    task: "simplify",
    lang: "en",
    instruction: "Rewrite the following sentence in plain, simple language.",
    input:
      "Notwithstanding the aforementioned provisions, the party of the first part shall be indemnified against any and all liabilities arising therefrom.",
  },
];

async function resolveModelAPI() {
  if ("LanguageModel" in self) {
    return {
      label: "self.LanguageModel (current API)",
      availability: () => self.LanguageModel.availability(),
      create: (opts) => self.LanguageModel.create(opts),
    };
  }
  if (self.ai && self.ai.languageModel) {
    return {
      label: "self.ai.languageModel (legacy API)",
      availability: async () => {
        const caps = await self.ai.languageModel.capabilities();
        return caps.available;
      },
      create: (opts) => self.ai.languageModel.create(opts),
    };
  }
  return null;
}

function renderRow({ task, lang, input, output, latencyMs }) {
  const row = document.createElement("tr");
  const pass = latencyMs < LATENCY_TARGET_MS;
  row.innerHTML = `
    <td>${task}</td>
    <td>${lang}</td>
    <td>${input}</td>
    <td>${output}</td>
    <td>${latencyMs.toFixed(1)}ms</td>
    <td class="${pass ? "pass" : "fail"}">${pass ? "PASS" : "FAIL"}</td>
  `;
  resultsBody.appendChild(row);
}

async function runMatrix(api) {
  resultsTable.style.display = "table";
  for (const testCase of TEST_MATRIX) {
    try {
      const session = await api.create({ systemPrompt: testCase.instruction });
      const start = performance.now();
      const output = await session.prompt(testCase.input);
      const latencyMs = performance.now() - start;
      renderRow({ ...testCase, output, latencyMs });
      session.destroy?.();
    } catch (err) {
      renderRow({ ...testCase, output: `ERROR: ${err.message}`, latencyMs: NaN });
    }
  }
}

(async () => {
  const api = await resolveModelAPI();

  if (!api) {
    statusEl.textContent =
      "No on-device model API detected. See README.md for the Chrome flags needed to enable it, then reload this page.";
    return;
  }

  statusEl.textContent = `Detected: ${api.label}. Checking model availability…`;

  const availability = await api.availability();
  statusEl.textContent = `Detected: ${api.label}. Availability: ${availability}`;

  if (availability === "unavailable") {
    statusEl.textContent += "\nModel is unavailable on this device/browser. See README.md.";
    return;
  }

  if (availability === "downloadable" || availability === "after-download") {
    statusEl.textContent += "\nModel needs to download before it can run — click 'Run test matrix' to trigger it.";
  }

  runBtn.disabled = false;
  runBtn.addEventListener("click", async () => {
    runBtn.disabled = true;
    statusEl.textContent = "Running test matrix… (first run may trigger a model download and be slow)";
    await runMatrix(api);
    statusEl.textContent = "Done. See table below. Re-run to get steady-state (post-download) latency.";
    runBtn.disabled = false;
  });
})();
