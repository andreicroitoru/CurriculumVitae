// "Are you sure?" pop-up for deletes. Resolves true / false, so callers can just await it.
export class ConfirmDialog {
  constructor(dialogElement) {
    this.dialogElement = dialogElement;
    this.titleElement = dialogElement.querySelector(".glassDialog__title");
    this.messageElement = dialogElement.querySelector(".confirmDialog__message");
    this.confirmButton = dialogElement.querySelector("[data-confirm]");

    this.resolvePending = null;

    this.confirmButton.addEventListener("click", () => this.finish(true));
    this.dialogElement.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]") || event.target === this.dialogElement) this.finish(false);
    });
    // Escape key fires "cancel" on a modal dialog
    this.dialogElement.addEventListener("cancel", () => this.finish(false));
  }

  ask({ title, message, confirmLabel = "Șterge" }) {
    this.titleElement.textContent = title;
    this.messageElement.textContent = message;
    this.confirmButton.textContent = confirmLabel;

    this.dialogElement.showModal();
    // Focus the safe option, so a stray Enter doesn't delete anything
    this.dialogElement.querySelector(".button[data-close]").focus();

    return new Promise((resolve) => {
      this.resolvePending = resolve;
    });
  }

  finish(isConfirmed) {
    this.dialogElement.close();
    this.resolvePending?.(isConfirmed);
    this.resolvePending = null;
  }
}
