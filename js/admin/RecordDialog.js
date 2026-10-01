import { escapeHtml } from "../utils/escapeHtml.js";

// The add / edit pop-up. One <dialog> in admin.html, reused by every table.
// Native <dialog> gives us focus trapping, Escape to close and the backdrop for free.
export class RecordDialog {
  constructor(dialogElement) {
    this.dialogElement = dialogElement;
    this.formElement = dialogElement.querySelector("form");
    this.titleElement = dialogElement.querySelector(".glassDialog__title");
    this.fieldsContainer = dialogElement.querySelector(".formGrid");
    this.statusElement = dialogElement.querySelector(".formStatus");
    this.submitButton = dialogElement.querySelector('button[type="submit"]');

    this.fields = [];
    this.onSubmit = null;

    this.formElement.addEventListener("submit", (event) => this.handleSubmit(event));

    // Close buttons, and a click on the dimmed backdrop (the click lands on <dialog> itself)
    this.dialogElement.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]") || event.target === this.dialogElement) this.close();
    });
  }

  // onSubmit(rowValues) saves the row and returns an error message, or nothing when it worked
  open({ title, fields, values = {}, submitLabel = "Salvează", onSubmit }) {
    this.fields = fields;
    this.onSubmit = onSubmit;

    this.titleElement.textContent = title;
    this.submitButton.textContent = submitLabel;
    this.setStatus("");
    this.fieldsContainer.innerHTML = fields.map((field) => this.renderField(field, values[field.name])).join("");

    this.dialogElement.showModal();
    this.fieldsContainer.querySelector("input, textarea, select")?.focus();
  }

  close() {
    this.dialogElement.close();
  }

  async handleSubmit(event) {
    event.preventDefault();

    const rowValues = this.readFormValues();
    const missingFields = this.fields
      .filter((field) => field.required && rowValues[field.name] === null)
      .map((field) => field.label);

    if (missingFields.length > 0) {
      this.setStatus(`Completează: ${missingFields.join(", ")}`, { isError: true });
      return;
    }

    this.submitButton.disabled = true;
    this.setStatus("Se salvează…");

    const errorMessage = await this.onSubmit(rowValues);

    this.submitButton.disabled = false;
    if (errorMessage) {
      this.setStatus(errorMessage, { isError: true });
      return;
    }
    this.close();
  }

  setStatus(message, { isError = false } = {}) {
    this.statusElement.textContent = message;
    this.statusElement.classList.toggle("isError", isError);
  }

  renderField(field, currentValue) {
    const inputId = `field-${field.name}`;
    const widthClass = field.width === "half" ? "formField--half" : "";
    const requiredAttribute = field.required ? "required" : "";
    const hintHtml = field.hint ? `<small class="formField__hint">${escapeHtml(field.hint)}</small>` : "";
    const commonAttributes = `id="${inputId}" name="${field.name}" ${requiredAttribute}`;

    let inputHtml;
    switch (field.type) {
      case "textarea":
        inputHtml = `<textarea ${commonAttributes} rows="5">${escapeHtml(currentValue ?? "")}</textarea>`;
        break;

      case "select":
        inputHtml = `
          <select ${commonAttributes}>
            ${field.options
              .map(
                (option) =>
                  `<option value="${option.value}" ${String(option.value) === String(currentValue) ? "selected" : ""}>${escapeHtml(option.label)}</option>`
              )
              .join("")}
          </select>`;
        break;

      case "month":
        // DB stores a full date (2018-06-01), <input type="month"> wants "2018-06"
        inputHtml = `<input type="month" ${commonAttributes} value="${currentValue ? currentValue.slice(0, 7) : ""}">`;
        break;

      case "year":
        inputHtml = `<input type="number" min="1950" max="2100" step="1" ${commonAttributes} value="${currentValue ?? ""}">`;
        break;

      case "number":
        inputHtml = `<input type="number" step="1" ${commonAttributes} value="${currentValue ?? 0}">`;
        break;

      case "color":
        inputHtml = `<input type="color" ${commonAttributes} value="${escapeHtml(currentValue || "#444444")}">`;
        break;

      default:
        inputHtml = `<input type="${field.type}" ${commonAttributes} value="${escapeHtml(currentValue ?? "")}">`;
    }

    return `
      <div class="formField ${widthClass}">
        <label for="${inputId}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>
        ${inputHtml}
        ${hintHtml}
      </div>
    `;
  }

  // Turns form inputs back into a row object Supabase understands
  readFormValues() {
    const formData = new FormData(this.formElement);
    const rowValues = {};

    for (const field of this.fields) {
      const rawValue = String(formData.get(field.name) ?? "").trim();

      if (rawValue === "") {
        rowValues[field.name] = field.type === "number" ? 0 : null;
        continue;
      }

      switch (field.type) {
        case "month":
          rowValues[field.name] = `${rawValue}-01`;
          break;
        case "year":
        case "number":
        case "select":
          rowValues[field.name] = Number(rawValue);
          break;
        default:
          rowValues[field.name] = rawValue;
      }
    }

    return rowValues;
  }
}
