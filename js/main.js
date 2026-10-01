import { cvData } from "./data/cvData.js";
import { translations, supportedLanguages, defaultLanguage } from "./i18n/translations.js";
import { CvRenderer } from "./components/CvRenderer.js";
import { LanguageSwitcher } from "./components/LanguageSwitcher.js";
import { DateFormatter } from "./utils/DateFormatter.js";

const LANGUAGE_STORAGE_KEY = "cvPreferredLanguage";
const FADE_DURATION_MS = 180; // keep in sync with .pageContent transition in sections.css

class CvApp {
  constructor() {
    this.pageContentElement = document.getElementById("pageContent");
    this.lastUpdatedElement = document.getElementById("lastUpdated");
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.cvRenderer = new CvRenderer(cvData, translations);
    this.currentLanguage = this.loadSavedLanguage();
  }

  start() {
    this.renderPage(this.currentLanguage);

    new LanguageSwitcher(document.getElementById("languageSwitch"), {
      initialLanguage: this.currentLanguage,
      onLanguageChange: (language) => this.changeLanguage(language),
    });
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

    this.pageContentElement.innerHTML = this.cvRenderer.render(language);

    // Static texts that live in index.html (nav links, footer) are marked with data-translation-key
    document.querySelectorAll("[data-translation-key]").forEach((element) => {
      element.textContent = labels[element.dataset.translationKey];
    });

    const lastUpdatedText = new DateFormatter(labels).formatMonthYear(cvData.lastUpdated);
    this.lastUpdatedElement.textContent = `${labels.footerUpdated} ${lastUpdatedText}`;

    document.documentElement.lang = language;
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

new CvApp().start();
