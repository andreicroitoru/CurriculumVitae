// GitHub Pages lets browsers keep index.html for up to 10 minutes. The deploy workflow
// writes the current commit into version.json (never cached) and into data-version on <html>.
// If they differ, this page is an old copy: reload once to get the new one.
const RELOAD_MARKER_KEY = "cvReloadedForVersion";

export async function reloadIfNewVersionDeployed() {
  const pageVersion = document.documentElement.dataset.version;
  if (!pageVersion || pageVersion === "dev") return; // local run, no workflow stamping

  try {
    const response = await fetch("version.json", { cache: "no-store" });
    const { version: deployedVersion } = await response.json();

    // The marker stops a reload loop if the CDN is still serving the old HTML right after a deploy
    if (deployedVersion !== pageVersion && sessionStorage.getItem(RELOAD_MARKER_KEY) !== deployedVersion) {
      sessionStorage.setItem(RELOAD_MARKER_KEY, deployedVersion);
      location.reload();
    }
  } catch (error) {
    console.warn("Version check failed, keeping the current page", error);
  }
}
