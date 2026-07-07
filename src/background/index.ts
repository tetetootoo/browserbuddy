import type { GlanceMessage, GlanceResponse } from "../shared/messages";

chrome.runtime.onMessage.addListener(
  (message: GlanceMessage, _sender, sendResponse: (response: GlanceResponse) => void) => {
    if (message.type === "SELECTION_CAPTURED") {
      console.log("[background] selection captured:", message.text);
      sendResponse({ type: "ACK", receivedAt: Date.now() });
      return true;
    }
    return false;
  },
);
