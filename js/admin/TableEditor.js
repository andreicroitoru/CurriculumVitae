import { escapeHtml } from "../utils/escapeHtml.js";

// Generic editor for one Supabase table, driven by a schema from editorSchemas.js.
// Every row becomes a card with a form; each card saves / deletes on its own.
export class TableEditor {
  constructor(containerElement, schema, { supabaseClient, showToast }) {
    this.containerElement = containerElement;
    this.schema = schema;
    this.supabaseClient = supabaseClient;
    this.showToast = showToast;

    this.records = [];
    this.hasUnsavedDraft = false;

    this.containerElement.addEventListener("submit", (event) => this.handleSubmit(event));
    this.containerElement.addEventListener("click", (event) => this.handleClick(event));
  }

  async load() {
    this.containerElement.innerHTML = `<p class="adminHint">Se încarcă…</p>`;

    let query = this.supabaseClient.from(this.schema.tableName).select("*");
    query = this.schema.isSingleRow ? query.eq("id", 1) : query.order("sort_order").order("id");

    const { data, error } = await query;
    if (error) {
      this.containerElement.innerHTML = `<p class="adminError">Nu am putut încărca datele: ${escapeHtml(error.message)}</p>`;
      return;
    }

    // The profile table has a single row; if it's missing (seed not run yet) start with an empty form
    this.records = this.schema.isSingleRow && data.length === 0 ? [{}] : data;
    this.hasUnsavedDraft = false;
    this.render();
  }

  render() {
    const toolbar = this.schema.isSingleRow
      ? ""
      : `
        <div class="tableEditor__toolbar">
          <span class="adminHint">${this.records.length} înregistrări</span>
          <button type="button" class="button button--primary" data-action="addRecord" ${this.hasUnsavedDraft ? "disabled" : ""}>
            + ${this.schema.newRecordLabel}
          </button>
        </div>
      `;

    const recordCards = this.records.map((record) => this.renderRecordCard(record)).join("");
    this.containerElement.innerHTML = toolbar + `<div class="tableEditor__list">${recordCards}</div>`;
  }

  renderRecordCard(record) {
    const recordKey = record.id ?? "new";
    const isNewRecord = record.id === undefined;
    const cardTitle = this.schema.isSingleRow ? this.schema.title : this.schema.describeRecord(record);

    const fieldsHtml = this.schema.fields
      .map((field) => this.renderField(field, record[field.name], `${this.schema.tableName}-${recordKey}-${field.name}`))
      .join("");

    const deleteButton =
      this.schema.isSingleRow
        ? ""
        : `<button type="button" class="button button--danger" data-action="${isNewRecord ? "cancelDraft" : "deleteRecord"}">
            ${isNewRecord ? "Renunță" : "Șterge"}
          </button>`;

    return `
      <form class="recordCard ${isNewRecord ? "isDraft" : ""}" data-record-id="${recordKey}" novalidate>
        <h3 class="recordCard__title">${escapeHtml(cardTitle)}</h3>
        <div class="recordCard__fields">${fieldsHtml}</div>
        <div class="recordCard__actions">
          <span class="recordCard__status" aria-live="polite"></span>
          ${deleteButton}
          <button type="submit" class="button button--primary">${isNewRecord ? "Adaugă" : "Salvează"}</button>
        </div>
      </form>
    `;
  }

  renderField(field, currentValue, inputId) {
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
  readFormValues(formElement) {
    const formData = new FormData(formElement);
    const rowValues = {};

    for (const field of this.schema.fields) {
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

  findMissingRequiredFields(rowValues) {
    return this.schema.fields.filter((field) => field.required && rowValues[field.name] === null).map((field) => field.label);
  }

  async handleSubmit(event) {
    event.preventDefault();

    const formElement = event.target.closest(".recordCard");
    const recordId = formElement.dataset.recordId;
    const statusElement = formElement.querySelector(".recordCard__status");
    const submitButton = formElement.querySelector('button[type="submit"]');

    const rowValues = this.readFormValues(formElement);
    const missingFields = this.findMissingRequiredFields(rowValues);
    if (missingFields.length > 0) {
      statusElement.textContent = `Completează: ${missingFields.join(", ")}`;
      statusElement.className = "recordCard__status isError";
      return;
    }

    submitButton.disabled = true;
    statusElement.textContent = "Se salvează…";
    statusElement.className = "recordCard__status";

    const { error } = await this.saveRow(recordId, rowValues);

    submitButton.disabled = false;

    if (error) {
      statusElement.textContent = `Eroare: ${error.message}`;
      statusElement.className = "recordCard__status isError";
      return;
    }

    this.showToast(recordId === "new" ? "Adăugat" : "Salvat");
    await this.load();
  }

  saveRow(recordId, rowValues) {
    const tableQuery = this.supabaseClient.from(this.schema.tableName);

    // Single-row tables always live at id = 1, upsert covers both "first save" and "edit"
    if (this.schema.isSingleRow) return tableQuery.upsert({ id: 1, ...rowValues });
    if (recordId === "new") return tableQuery.insert(rowValues);
    return tableQuery.update(rowValues).eq("id", Number(recordId));
  }

  async handleClick(event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const formElement = actionButton.closest(".recordCard");

    switch (actionButton.dataset.action) {
      case "addRecord":
        this.addDraftRecord();
        break;

      case "cancelDraft":
        this.records = this.records.filter((record) => record.id !== undefined);
        this.hasUnsavedDraft = false;
        this.render();
        break;

      case "deleteRecord":
        // First click arms the button, second click deletes. No native confirm() popups.
        if (actionButton.dataset.armed !== "true") {
          actionButton.dataset.armed = "true";
          actionButton.textContent = "Confirmă ștergerea";
          setTimeout(() => {
            actionButton.dataset.armed = "false";
            actionButton.textContent = "Șterge";
          }, 4000);
          return;
        }
        await this.deleteRecord(Number(formElement.dataset.recordId));
        break;
    }
  }

  addDraftRecord() {
    const nextSortOrder = Math.max(0, ...this.records.map((record) => record.sort_order ?? 0)) + 1;

    this.records.push({ sort_order: nextSortOrder });
    this.hasUnsavedDraft = true;
    this.render();

    const draftCard = this.containerElement.querySelector(".recordCard.isDraft");
    draftCard.scrollIntoView({ behavior: "smooth", block: "center" });
    draftCard.querySelector("input, textarea, select")?.focus({ preventScroll: true });
  }

  async deleteRecord(recordId) {
    const { error } = await this.supabaseClient.from(this.schema.tableName).delete().eq("id", recordId);

    if (error) {
      this.showToast(`Nu am putut șterge: ${error.message}`, { isError: true });
      return;
    }

    this.showToast("Șters");
    await this.load();
  }
}
