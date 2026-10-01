// UI labels for both languages. The CV content itself comes from Supabase.

export const supportedLanguages = ["ro", "en"];
export const defaultLanguage = "ro";

export const translations = {
  ro: {
    navAbout: "Despre",
    navExperience: "Experiență",
    navEducation: "Educație",
    navCertifications: "Certificări",
    navContact: "Contact",

    atCompany: "la",
    viewOnLinkedin: "Vezi pe LinkedIn",
    contactMe: "Contactează-mă",

    sectionAbout: "Despre",
    sectionExperience: "Experiență",
    sectionEducation: "Educație",
    sectionCertifications: "Certificări",
    sectionSkills: "Competențe",

    statYearsLabel: "experiență în dezvoltare web și low-code",
    statCertificatesLabel: "certificări HackerRank, de la SQL Basic la Advanced",
    statEducationLabel: "licență în Informatică, Politehnica București",

    currentBadge: "ACTUAL",
    present: "Prezent",
    issuedOn: "Emis",
    skillLevelNames: ["Basic", "Intermediate", "Advanced"],

    contactTitle: "Hai să vorbim",
    contactText: "Sunt deschis la proiecte și colaborări. Cel mai rapid mă găsești pe LinkedIn.",

    loadingCv: "Se încarcă CV-ul…",
    loadingFailed: "Nu am putut încărca CV-ul. Reîncearcă în câteva momente.",

    footerSource: "Sursă: profilul LinkedIn",
    footerUpdated: "Actualizat",

    shortMonthNames: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
    formatYears: (count) => (count === 1 ? "1 an" : `${count} ani`),
    formatMonths: (count) => (count === 1 ? "1 lună" : `${count} luni`),
    formatYearsPlus: (count) => `${count}+ ani`,
  },

  en: {
    navAbout: "About",
    navExperience: "Experience",
    navEducation: "Education",
    navCertifications: "Certifications",
    navContact: "Contact",

    atCompany: "at",
    viewOnLinkedin: "View on LinkedIn",
    contactMe: "Get in touch",

    sectionAbout: "About",
    sectionExperience: "Experience",
    sectionEducation: "Education",
    sectionCertifications: "Certifications",
    sectionSkills: "Skills",

    statYearsLabel: "building web and low-code applications",
    statCertificatesLabel: "HackerRank certificates, SQL Basic through Advanced",
    statEducationLabel: "BSc in Computer Science, POLITEHNICA Bucharest",

    currentBadge: "CURRENT",
    present: "Present",
    issuedOn: "Issued",
    skillLevelNames: ["Basic", "Intermediate", "Advanced"],

    contactTitle: "Let's talk",
    contactText: "Open to projects and collaborations. LinkedIn is the fastest way to reach me.",

    loadingCv: "Loading CV…",
    loadingFailed: "Couldn't load the CV. Please try again in a moment.",

    footerSource: "Source: LinkedIn profile",
    footerUpdated: "Updated",

    shortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    formatYears: (count) => (count === 1 ? "1 yr" : `${count} yrs`),
    formatMonths: (count) => (count === 1 ? "1 mo" : `${count} mos`),
    formatYearsPlus: (count) => `${count}+ yrs`,
  },
};
