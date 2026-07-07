import type { GlanceMessage, GlanceResponse } from "../shared/messages";

const ICON_ID = "glance-selection-icon";

function removeIcon(): void {
  document.getElementById(ICON_ID)?.remove();
}

function showIconNearSelection(rect: DOMRect, text: string): void {
  removeIcon();

  const icon = document.createElement("button");
  icon.id = ICON_ID;
  icon.textContent = "G";
  icon.setAttribute("aria-label", "Glance: get an instant answer");
  Object.assign(icon.style, {
    position: "fixed",
    top: `${rect.top - 32}px`,
    left: `${rect.right}px`,
    zIndex: "2147483647",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  } satisfies Partial<CSSStyleDeclaration>);

  icon.addEventListener("mousedown", (e) => {
    // Prevent the click from collapsing the text selection before we read it.
    e.preventDefault();
  });

  icon.addEventListener("click", () => {
    const start = performance.now();
    const message: GlanceMessage = { type: "SELECTION_CAPTURED", text };
    chrome.runtime.sendMessage(message, (response: GlanceResponse) => {
      console.log(`[glance] round trip ${(performance.now() - start).toFixed(1)}ms`, response);
    });
    removeIcon();
  });

  document.body.appendChild(icon);
}

document.addEventListener("selectionchange", () => {
  const selection = document.getSelection();
  const text = selection?.toString().trim() ?? "";

  if (!text) {
    removeIcon();
    return;
  }

  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const rect = range?.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) {
    removeIcon();
    return;
  }

  showIconNearSelection(rect, text);
});

document.addEventListener("mousedown", (e) => {
  if ((e.target as HTMLElement | null)?.id !== ICON_ID) {
    removeIcon();
  }
});
