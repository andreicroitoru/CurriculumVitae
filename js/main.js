import { translations, supportedLanguages, defaultLanguage } from "./i18n/translations.js";
import { CvRenderer } from "./components/CvRenderer.js";
import { LanguageSwitcher } from "./components/LanguageSwitcher.js";
import { DateFormatter } from "./utils/DateFormatter.js";
import { CvRepository } from "./services/CvRepository.js";
import { reloadIfNewVersionDeployed } from "./utils/versionCheck.js";

const LANGUAGE_STORAGE_KEY = "cvPreferredLanguage";
const FADE_DURATION_MS = 180; // keep in sync with .pageContent transition in sections.css

class CvApp {
  constructor() {
    this.pageContentElement = document.getElementById("pageContent");
    this.lastUpdatedElement = document.getElementById("lastUpdated");
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.cvData = null;
    this.cvRenderer = null;
    this.currentLanguage = this.loadSavedLanguage();
  }

  async start() {
    // The switcher works even while the CV is loading, it just re-renders whatever is on screen
    new LanguageSwitcher(document.getElementById("languageSwitch"), {
      initialLanguage: this.currentLanguage,
      onLanguageChange: (language) => this.changeLanguage(language),
    });

    this.renderPage(this.currentLanguage);

    try {
      this.cvData = await new CvRepository().fetchCv();
      this.cvRenderer = new CvRenderer(this.cvData, translations);
      this.renderPage(this.currentLanguage);
    } catch (error) {
      console.error("Could not load CV from Supabase", error);
      this.showStatusMessage(translations[this.currentLanguage].loadingFailed);
    }
  }

  changeLanguage(language) {
    this.currentLanguage = language;
    this.saveLanguage(language);

    if (this.prefersReducedMotion) {
      this.renderPage(language);
      return;
    }

    // Fade out, swap the content while it's invisible, fade back in
    this.pageContentElement.classList.add("isFadingOut");
    setTimeout(() => {
      this.renderPage(language);
      this.pageContentElement.classList.remove("isFadingOut");
    }, FADE_DURATION_MS);
  }

  renderPage(language) {
    const labels = translations[language];

    // Static texts that live in index.html (nav links, footer) are marked with data-translation-key
    document.querySelectorAll("[data-translation-key]").forEach((element) => {
      element.textContent = labels[element.dataset.translationKey];
    });
    document.documentElement.lang = language;

    if (!this.cvData) {
      this.showStatusMessage(labels.loadingCv);
      return;
    }

    this.pageContentElement.innerHTML = this.cvRenderer.render(language);

    const lastUpdatedText = new DateFormatter(labels).formatMonthYear(this.cvData.lastUpdated);
    this.lastUpdatedElement.textContent = `${labels.footerUpdated} ${lastUpdatedText}`;
  }

  showStatusMessage(message) {
    this.pageContentElement.innerHTML = `<p class="statusMessage">${message}</p>`;
  }

  // localStorage can throw in private mode / with blocked cookies, so it's wrapped
  loadSavedLanguage() {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (supportedLanguages.includes(savedLanguage)) return savedLanguage;
    } catch (error) {
      console.warn("Could not read saved language", error);
    }
    return defaultLanguage;
  }

  saveLanguage(language) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn("Could not save language", error);
    }
  }
}

reloadIfNewVersionDeployed();
new CvApp().start();
