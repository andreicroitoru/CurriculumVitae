import { DateFormatter } from "../utils/DateFormatter.js";
import { escapeHtml } from "../utils/escapeHtml.js";

// Builds the main content of the page from cvData for a given language.
export class CvRenderer {
  constructor(cvData, translations) {
    this.cvData = cvData;
    this.translations = translations;
  }

  render(language) {
    this.language = language;
    this.labels = this.translations[language];
    this.dateFormatter = new DateFormatter(this.labels);

    return [
      this.renderHero(),
      this.renderQuickStats(),
      this.renderAboutSection(),
      this.renderExperienceSection(),
      this.renderEducationSection(),
      this.renderCertificationsSection(),
      this.renderSkillsSection(),
      this.renderContactSection(),
    ].join("");
  }

  // Picks the right language from { ro, en } objects, plain strings pass through
  localize(value) {
    if (value && typeof value === "object") return value[this.language];
    return value;
  }

  renderHero() {
    const { personalInfo } = this.cvData;

    return `
      <div class="profileHero">
        <div class="profileHero__avatar" aria-hidden="true">${escapeHtml(personalInfo.avatarInitials)}</div>
        <div>
          <div class="profileHero__location">${escapeHtml(this.localize(personalInfo.location))}</div>
          <h1 class="profileHero__name">${escapeHtml(personalInfo.fullName)}</h1>
        </div>
        <p class="profileHero__headline">
          <strong>${escapeHtml(this.localize(personalInfo.currentJobTitle))}</strong>
          ${this.labels.atCompany} ${escapeHtml(personalInfo.currentCompany)}
        </p>
        <div class="profileHero__actions">
          <a class="button button--primary" href="${personalInfo.linkedinUrl}" target="_blank" rel="noopener">${this.labels.viewOnLinkedin}</a>
          <a class="button button--ghost" href="#contact">${this.labels.contactMe} ›</a>
        </div>
      </div>
    `;
  }

  renderQuickStats() {
    const { workExperience, certifications, education } = this.cvData;

    // Years of experience are counted from the earliest job, so the number grows on its own
    const earliestStartDate = workExperience.map((job) => job.startDate).sort()[0];
    const yearsOfExperience = this.dateFormatter.countFullYearsSince(earliestStartDate);
    const latestDegree = education[0];

    return `
      <div class="quickStats">
        <div class="quickStats__item">
          <strong class="quickStats__value">${this.labels.formatYearsPlus(yearsOfExperience)}</strong>
          <span class="quickStats__label">${this.labels.statYearsLabel}</span>
        </div>
        <div class="quickStats__item">
          <strong class="quickStats__value">${certifications.length}</strong>
          <span class="quickStats__label">${this.labels.statCertificatesLabel}</span>
        </div>
        <div class="quickStats__item">
          <strong class="quickStats__value">${latestDegree.startYear}–${latestDegree.endYear.slice(2)}</strong>
          <span class="quickStats__label">${this.labels.statEducationLabel}</span>
        </div>
      </div>
    `;
  }

  renderAboutSection() {
    return `
      <section class="cvSection" id="despre" aria-labelledby="aboutTitle">
        <h2 class="cvSection__title" id="aboutTitle">${this.labels.sectionAbout}</h2>
        <p class="aboutText">${escapeHtml(this.localize(this.cvData.aboutMe))}</p>
      </section>
    `;
  }

  renderExperienceSection() {
    const jobItems = this.cvData.workExperience.map((job) => this.renderJobItem(job)).join("");

    return `
      <section class="cvSection" id="experienta" aria-labelledby="experienceTitle">
        <h2 class="cvSection__title" id="experienceTitle">${this.labels.sectionExperience}</h2>
        <ul class="timelineList">${jobItems}</ul>
      </section>
    `;
  }

  renderJobItem(job) {
    const isCurrentJob = job.endDate === null;
    const periodText = `${this.dateFormatter.formatMonthYear(job.startDate)} – ${this.dateFormatter.formatMonthYear(job.endDate)}`;
    const durationText = this.dateFormatter.formatDuration(job.startDate, job.endDate);

    return `
      <li class="timelineItem">
        ${this.renderLogo(job.logoInitials, job.logoColor)}
        <div>
          <h3 class="timelineItem__title">${escapeHtml(this.localize(job.jobTitle))}</h3>
          <p class="timelineItem__subtitle">${escapeHtml(job.companyName)}</p>
          ${job.location ? `<p class="timelineItem__location">${escapeHtml(this.localize(job.location))}</p>` : ""}
          ${isCurrentJob ? `<span class="currentBadge">${this.labels.currentBadge}</span>` : ""}
        </div>
        <div class="timelineItem__period">${periodText}<br>${durationText}</div>
      </li>
    `;
  }

  renderEducationSection() {
    const schoolItems = this.cvData.education
      .map(
        (school) => `
        <li class="timelineItem">
          ${this.renderLogo(school.logoInitials, school.logoColor)}
          <div>
            <h3 class="timelineItem__title">${escapeHtml(this.localize(school.schoolName))}</h3>
            <p class="timelineItem__subtitle">${escapeHtml(this.localize(school.degreeName))}</p>
          </div>
          <div class="timelineItem__period">${school.startYear} – ${school.endYear}</div>
        </li>
      `
      )
      .join("");

    return `
      <section class="cvSection" id="educatie" aria-labelledby="educationTitle">
        <h2 class="cvSection__title" id="educationTitle">${this.labels.sectionEducation}</h2>
        <ul class="timelineList">${schoolItems}</ul>
      </section>
    `;
  }

  renderCertificationsSection() {
    const certificateCards = this.cvData.certifications
      .map((certificate) => {
        const levelName = this.labels.skillLevelNames[certificate.skillLevel - 1];
        const levelBars = [1, 2, 3]
          .map((level) => `<span class="${level <= certificate.skillLevel ? "isFilled" : ""}"></span>`)
          .join("");

        return `
          <div class="certificateCard">
            <span class="certificateCard__level">${levelName}</span>
            <span class="certificateCard__name">${escapeHtml(certificate.certificateName)}</span>
            <div class="certificateCard__levelBars" role="img" aria-label="${levelName}">${levelBars}</div>
            <span class="certificateCard__issuer">
              ${escapeHtml(certificate.issuedBy)} · ${this.labels.issuedOn} ${this.dateFormatter.formatMonthYear(certificate.issueDate)}
            </span>
          </div>
        `;
      })
      .join("");

    return `
      <section class="cvSection" id="certificari" aria-labelledby="certificationsTitle">
        <h2 class="cvSection__title" id="certificationsTitle">${this.labels.sectionCertifications}</h2>
        <div class="certificateGrid">${certificateCards}</div>
      </section>
    `;
  }

  renderSkillsSection() {
    const skillTags = this.localize(this.cvData.skills)
      .map((skill) => `<li>${escapeHtml(skill)}</li>`)
      .join("");

    return `
      <section class="cvSection" aria-labelledby="skillsTitle">
        <h2 class="cvSection__title" id="skillsTitle">${this.labels.sectionSkills}</h2>
        <ul class="skillTags">${skillTags}</ul>
      </section>
    `;
  }

  renderContactSection() {
    return `
      <section class="cvSection" id="contact" aria-labelledby="contactTitle">
        <div class="contactCard">
          <h2 class="cvSection__title" id="contactTitle">${this.labels.contactTitle}</h2>
          <p>${this.labels.contactText}</p>
          <a class="button button--primary" href="${this.cvData.personalInfo.linkedinUrl}" target="_blank" rel="noopener">${this.labels.viewOnLinkedin}</a>
        </div>
      </section>
    `;
  }

  renderLogo(initials, backgroundColor) {
    return `<div class="timelineItem__logo" style="background:${backgroundColor}" aria-hidden="true">${escapeHtml(initials)}</div>`;
  }
}
