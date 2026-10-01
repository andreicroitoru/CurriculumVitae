import { escapeHtml } from "../utils/escapeHtml.js";
import { editorSchemas } from "./editorSchemas.js";
import { supabaseClient } from "../services/supabaseClient.js";
import { AuthService } from "./AuthService.js";
import { TableEditor } from "./TableEditor.js";

const TOAST_VISIBLE_MS = 2200;

class AdminApp {
  constructor() {
    this.loginView = document.getElementById("loginView");
    this.dashboardView = document.getElementById("dashboardView");
    this.loginForm = document.getElementById("loginForm");
    this.loginErrorElement = document.getElementById("loginError");
    this.signedInEmailElement = document.getElementById("signedInEmail");
    this.signOutButton = document.getElementById("signOutButton");
    this.tabListElement = document.getElementById("editorTabs");
    this.editorContainer = document.getElementById("editorContainer");
    this.toastElement = document.getElementById("toast");

    this.authService = new AuthService(supabaseClient);
    this.tableEditors = new Map();
    this.activeTableName = editorSchemas[0].tableName;
    this.toastTimeoutId = null;
  }

  async start() {
    this.loginForm.addEventListener("submit", (event) => this.handleLogin(event));
    this.signOutButton.addEventListener("click", () => this.handleSignOut());
    this.tabListElement.addEventListener("click", (event) => this.handleTabClick(event));

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
      this.showLoginError(
        error.message === "Invalid login credentials" ? "Email sau parolă greșită." : error.message
      );
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

    this.renderTabs();
    await this.openEditor(this.activeTableName);
  }

  async handleSignOut() {
    await this.authService.signOut();
    this.tableEditors.clear();
    this.dashboardView.hidden = true;
    this.loginView.hidden = false;
  }

  renderTabs() {
    this.tabListElement.innerHTML = editorSchemas
      .map(
        (schema) => `
        <button type="button" role="tab" class="adminTabs__tab" id="tab-${schema.tableName}"
          data-table-name="${schema.tableName}"
          aria-selected="${schema.tableName === this.activeTableName}">
          ${escapeHtml(schema.title)}
        </button>`
      )
      .join("");
  }

  async handleTabClick(event) {
    const tabButton = event.target.closest("[data-table-name]");
    if (!tabButton) return;

    this.activeTableName = tabButton.dataset.tableName;
    this.tabListElement.querySelectorAll("[role=tab]").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab === tabButton));
    });

    await this.openEditor(this.activeTableName);
  }

  // Each table gets its own container, created the first time its tab is opened
  async openEditor(tableName) {
    if (!this.tableEditors.has(tableName)) {
      const schema = editorSchemas.find((item) => item.tableName === tableName);
      const editorElement = document.createElement("div");
      editorElement.className = "tableEditor";
      this.editorContainer.append(editorElement);

      const tableEditor = new TableEditor(editorElement, schema, {
        supabaseClient,
        showToast: (message, options) => this.showToast(message, options),
      });

      this.tableEditors.set(tableName, { tableEditor, editorElement });
      await tableEditor.load();
    }

    this.tableEditors.forEach(({ editorElement }, name) => {
      editorElement.hidden = name !== tableName;
    });
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
