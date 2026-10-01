import { escapeHtml } from "../utils/escapeHtml.js";
import { DateFormatter } from "../utils/DateFormatter.js";
import { translations } from "../i18n/translations.js";
import { icons } from "./icons.js";

const dateFormatter = new DateFormatter(translations.ro);

// One admin tab: lists the rows of a table and opens RecordDialog / ConfirmDialog for CRUD.
// The profile table (single row) is shown as a details card instead of a list.
export class TableView {
  constructor(containerElement, schema, { supabaseClient, recordDialog, confirmDialog, showToast, onRowCountChange }) {
    this.containerElement = containerElement;
    this.schema = schema;
    this.supabaseClient = supabaseClient;
    this.recordDialog = recordDialog;
    this.confirmDialog = confirmDialog;
    this.showToast = showToast;
    this.onRowCountChange = onRowCountChange;

    this.rows = [];
    this.fieldsByName = Object.fromEntries(schema.fields.map((field) => [field.name, field]));

    this.containerElement.addEventListener("click", (event) => this.handleClick(event));
  }

  get tableQuery() {
    return this.supabaseClient.from(this.schema.tableName);
  }

  async load() {
    let query = this.tableQuery.select("*");
    query = this.schema.isSingleRow ? query.eq("id", 1) : query.order("sort_order").order("id");

    const { data, error } = await query;
    if (error) {
      this.containerElement.innerHTML = this.renderHeader() + `<p class="adminError">Nu am putut încărca datele: ${escapeHtml(error.message)}</p>`;
      return;
    }

    this.rows = data;
    this.onRowCountChange(this.schema.tableName, data.length);
    this.render();
  }

  render() {
    const body = this.schema.isSingleRow ? this.renderDetailsCard() : this.renderListCard();
    this.containerElement.innerHTML = this.renderHeader() + body;
  }

  renderHeader() {
    const subtitle = this.schema.isSingleRow
      ? "Datele de bază afișate în partea de sus a CV-ului"
      : `${this.rows.length} ${this.rows.length === 1 ? "înregistrare" : "înregistrări"}`;

    const actionButton = this.schema.isSingleRow
      ? `<button type="button" class="button button--primary" data-action="edit" data-row-id="1">${icons.pencil} Editează</button>`
      : `<button type="button" class="button button--primary" data-action="add">${icons.plus} Adaugă ${escapeHtml(this.schema.itemName)}</button>`;

    return `
      <header class="viewHeader">
        <div>
          <h1 class="viewHeader__title">${escapeHtml(this.schema.title)}</h1>
          <p class="adminHint">${subtitle}</p>
        </div>
        ${actionButton}
      </header>
    `;
  }

  renderListCard() {
    if (this.rows.length === 0) {
      return `
        <div class="glassCard emptyState">
          <p>Nicio înregistrare încă.</p>
          <p class="adminHint">Apasă „Adaugă ${escapeHtml(this.schema.itemName)}” ca să creezi prima.</p>
        </div>
      `;
    }

    const columns = this.schema.listColumns.map((name) => this.fieldsByName[name]);

    const headerCells = columns
      .map((field) => `<th scope="col" class="${field.type === "number" ? "isNumeric" : ""}">${escapeHtml(field.label)}</th>`)
      .join("");

    const bodyRows = this.rows
      .map(
        (row) => `
        <tr>
          ${columns.map((field) => `<td class="${field.type === "number" ? "isNumeric" : ""}">${this.formatCell(field, row[field.name])}</td>`).join("")}
          <td class="dataTable__actions">
            <button type="button" class="iconButton" data-action="edit" data-row-id="${row.id}" aria-label="Editează">${icons.pencil}</button>
            <button type="button" class="iconButton iconButton--danger" data-action="delete" data-row-id="${row.id}" aria-label="Șterge">${icons.trash}</button>
          </td>
        </tr>`
      )
      .join("");

    return `
      <div class="glassCard tableScroll">
        <table class="dataTable">
          <thead><tr>${headerCells}<th scope="col" class="dataTable__actions">Acțiuni</th></tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  }

  renderDetailsCard() {
    const profileRow = this.rows[0];
    if (!profileRow) {
      return `<div class="glassCard emptyState"><p>Profilul nu e completat încă.</p><p class="adminHint">Apasă „Editează” ca să-l completezi.</p></div>`;
    }

    const detailItems = this.schema.fields
      .map(
        (field) => `
        <div class="detailsList__item ${field.type === "textarea" ? "isWide" : ""}">
          <dt>${escapeHtml(field.label)}</dt>
          <dd>${this.formatCell(field, profileRow[field.name])}</dd>
        </div>`
      )
      .join("");

    return `<dl class="glassCard detailsList">${detailItems}</dl>`;
  }

  formatCell(field, value) {
    if (value === null || value === undefined || value === "") {
      return `<span class="mutedText">${escapeHtml(field.emptyLabel ?? "—")}</span>`;
    }

    switch (field.type) {
      case "month":
        return escapeHtml(dateFormatter.formatMonthYear(value.slice(0, 7)));
      case "select":
        return escapeHtml(field.options.find((option) => String(option.value) === String(value))?.label ?? value);
      case "color":
        return `<span class="colorSwatch" style="background:${escapeHtml(value)}"></span>${escapeHtml(value)}`;
      default:
        return escapeHtml(value);
    }
  }

  async handleClick(event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const rowId = Number(actionButton.dataset.rowId);
    const row = this.rows.find((item) => item.id === rowId);

    switch (actionButton.dataset.action) {
      case "add":
        this.openAddDialog();
        break;
      case "edit":
        this.openEditDialog(row ?? {});
        break;
      case "delete":
        await this.confirmAndDelete(row);
        break;
    }
  }

  openAddDialog() {
    // New rows go to the end of the list by default
    const nextSortOrder = Math.max(0, ...this.rows.map((row) => row.sort_order ?? 0)) + 1;

    this.recordDialog.open({
      title: `Adaugă ${this.schema.itemName}`,
      fields: this.schema.fields,
      values: { sort_order: nextSortOrder },
      submitLabel: "Adaugă",
      onSubmit: (rowValues) => this.saveRow(this.tableQuery.insert(rowValues), "Adăugat"),
    });
  }

  openEditDialog(row) {
    this.recordDialog.open({
      title: `Editează ${this.schema.itemName}`,
      fields: this.schema.fields,
      values: row,
      onSubmit: (rowValues) => {
        // Profile always lives at id = 1; upsert also covers the very first save
        const request = this.schema.isSingleRow
          ? this.tableQuery.upsert({ id: 1, ...rowValues })
          : this.tableQuery.update(rowValues).eq("id", row.id);
        return this.saveRow(request, "Salvat");
      },
    });
  }

  async saveRow(request, successMessage) {
    const { error } = await request;
    if (error) return `Eroare: ${error.message}`;

    this.showToast(successMessage);
    await this.load();
  }

  async confirmAndDelete(row) {
    const rowLabel = row[this.schema.listColumns[0]];
    const isConfirmed = await this.confirmDialog.ask({
      title: `Ștergi ${this.schema.itemName}?`,
      message: `„${rowLabel}” dispare din CV. Acțiunea nu poate fi anulată.`,
    });
    if (!isConfirmed) return;

    const { error } = await this.tableQuery.delete().eq("id", row.id);
    if (error) {
      this.showToast(`Nu am putut șterge: ${error.message}`, { isError: true });
      return;
    }

    this.showToast("Șters");
    await this.load();
  }
}
