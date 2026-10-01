const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Content goes into innerHTML, so anything coming from cvData gets escaped first
export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => htmlEntities[character]);
}
