import { escapeHtml } from "../utils/escapeHtml.js";
import { supabaseClient } from "../services/supabaseClient.js";
import { editorSchemas } from "./editorSchemas.js";
import { icons } from "./icons.js";
import { AuthService } from "./AuthService.js";
import { TableView } from "./TableView.js";
import { RecordDialog } from "./RecordDialog.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

const TOAST_VISIBLE_MS = 2200;
const ACTIVE_TAB_STORAGE_KEY = "cvAdminActiveTab";

class AdminApp {
  constructor() {
    this.loginView = document.getElementById("loginView");
    this.dashboardView = document.getElementById("dashboardView");
    this.loginForm = document.getElementById("loginForm");
    this.loginErrorElement = document.getElementById("loginError");
    this.signedInEmailElement = document.getElementById("signedInEmail");
    this.signOutButton = document.getElementById("signOutButton");
    this.sidebarNavElement = document.getElementById("sidebarNav");
    this.viewsContainer = document.getElementById("viewsContainer");
    this.toastElement = document.getElementById("toast");

    this.authService = new AuthService(supabaseClient);
    this.recordDialog = new RecordDialog(document.getElementById("recordDialog"));
    this.confirmDialog = new ConfirmDialog(document.getElementById("confirmDialog"));

    this.tableViews = new Map(); // tableName -> { tableView, viewElement }
    this.activeTableName = this.loadSavedTab();
    this.toastTimeoutId = null;
  }

  async start() {
    this.loginForm.addEventListener("submit", (event) => this.handleLogin(event));
    this.signOutButton.addEventListener("click", () => this.handleSignOut());
    this.sidebarNavElement.addEventListener("click", (event) => this.handleSidebarClick(event));

    // Already logged in from a previous visit? Skip the login screen.
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      await this.openDashboardFor(currentUser);
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(this.loginForm);
    const submitButton = this.loginForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    this.showLoginError("");

    try {
      const user = await this.authService.signIn(formData.get("email"), formData.get("password"));
      await this.openDashboardFor(user);
    } catch (error) {
      this.showLoginError(error.message === "Invalid login credentials" ? "Email sau parolă greșită." : error.message);
    } finally {
      submitButton.disabled = false;
    }
  }

  async openDashboardFor(user) {
    const isAdmin = await this.authService.isCurrentUserAdmin(user);

    if (!isAdmin) {
      await this.authService.signOut();
      this.showLoginError("Contul acesta nu are drepturi de admin.");
      return;
    }

    this.loginForm.reset();
    this.signedInEmailElement.textContent = user.email;
    this.loginView.hidden = true;
    this.dashboardView.hidden = false;

    this.renderSidebar();
    this.createTableViews();
    this.showView(this.activeTableName);

    // Load every table up front: they're tiny, and the sidebar can show all the counts right away
    await Promise.all([...this.tableViews.values()].map(({ tableView }) => tableView.load()));
  }

  async handleSignOut() {
    await this.authService.signOut();
    this.tableViews.clear();
    this.viewsContainer.innerHTML = "";
    this.dashboardView.hidden = true;
    this.loginView.hidden = false;
  }

  renderSidebar() {
    this.sidebarNavElement.innerHTML = editorSchemas
      .map(
        (schema) => `
        <button type="button" class="sidebarNav__item" data-table-name="${schema.tableName}"
          aria-controls="view-${schema.tableName}">
          ${icons[schema.icon]}
          <span class="sidebarNav__label">${escapeHtml(schema.title)}</span>
          ${schema.isSingleRow ? "" : `<span class="sidebarNav__count" data-count-for="${schema.tableName}"></span>`}
        </button>`
      )
      .join("");
  }

  createTableViews() {
    for (const schema of editorSchemas) {
      const viewElement = document.createElement("section");
      viewElement.className = "adminView";
      viewElement.id = `view-${schema.tableName}`;
      viewElement.innerHTML = `<p class="adminHint">Se încarcă…</p>`;
      this.viewsContainer.append(viewElement);

      const tableView = new TableView(viewElement, schema, {
        supabaseClient,
        recordDialog: this.recordDialog,
        confirmDialog: this.confirmDialog,
        showToast: (message, options) => this.showToast(message, options),
        onRowCountChange: (tableName, rowCount) => this.updateSidebarCount(tableName, rowCount),
      });

      this.tableViews.set(schema.tableName, { tableView, viewElement });
    }
  }

  handleSidebarClick(event) {
    const navItem = event.target.closest("[data-table-name]");
    if (navItem) this.showView(navItem.dataset.tableName);
  }

  showView(tableName) {
    if (!this.tableViews.has(tableName)) tableName = editorSchemas[0].tableName;
    this.activeTableName = tableName;

    this.tableViews.forEach(({ viewElement }, name) => {
      viewElement.hidden = name !== tableName;
    });
    this.sidebarNavElement.querySelectorAll("[data-table-name]").forEach((navItem) => {
      const isActive = navItem.dataset.tableName === tableName;
      navItem.classList.toggle("isActive", isActive);
      if (isActive) navItem.setAttribute("aria-current", "page");
      else navItem.removeAttribute("aria-current");
    });

    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tableName);
    } catch {
      // private mode - not remembering the tab is fine
    }
  }

  loadSavedTab() {
    try {
      return localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) ?? editorSchemas[0].tableName;
    } catch {
      return editorSchemas[0].tableName;
    }
  }

  updateSidebarCount(tableName, rowCount) {
    const countElement = this.sidebarNavElement.querySelector(`[data-count-for="${tableName}"]`);
    if (countElement) countElement.textContent = rowCount;
  }

  showLoginError(message) {
    this.loginErrorElement.textContent = message;
    this.loginErrorElement.hidden = message === "";
  }

  showToast(message, { isError = false } = {}) {
    clearTimeout(this.toastTimeoutId);

    this.toastElement.textContent = message;
    this.toastElement.classList.toggle("isError", isError);
    this.toastElement.classList.add("isVisible");

    this.toastTimeoutId = setTimeout(() => {
      this.toastElement.classList.remove("isVisible");
    }, TOAST_VISIBLE_MS);
  }
}

new AdminApp().start();
