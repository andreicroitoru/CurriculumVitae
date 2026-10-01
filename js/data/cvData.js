// All the content of the CV lives here.
// To update the site, edit this file and push - nothing else needs to change.
//
// Text that differs per language is an object: { ro: "...", en: "..." }.
// Dates are "YYYY-MM" (or just "YYYY"). endDate: null means "present".

export const cvData = {
  personalInfo: {
    fullName: "Andrei Croitoru",
    avatarInitials: "AC",
    linkedinUrl: "https://www.linkedin.com/in/andrei-croitoru-04aa43162",
    location: { ro: "București, România", en: "Bucharest, Romania" },
    currentJobTitle: { ro: "Low Code Engineer", en: "Low Code Engineer" },
    currentCompany: "Plant an App",
  },

  aboutMe: {
    ro: "Sociabil și atent la detalii, cu talent pentru a consolida relații profesionale. Concentrat pe livrarea celor mai bune rezultate și motivat să învăț lucruri noi și să-mi dezvolt în continuare pregătirea tehnică și analitică.",
    en: "Outgoing and detail-oriented, proficient at consolidating professional relationships. Focused on delivering the best possible results and deeply motivated to learn new skills and further improve my technical and analytical background.",
  },

  workExperience: [
    {
      jobTitle: { ro: "Low Code Engineer", en: "Low Code Engineer" },
      companyName: "Plant an App",
      location: { ro: "București, România", en: "Bucharest, Romania" },
      startDate: "2018-06",
      endDate: null,
      logoInitials: "PA",
      logoColor: "#2f9e5b",
    },
    {
      jobTitle: { ro: "Web Application Developer", en: "Web Application Developer" },
      companyName: "DNN Sharp",
      location: null,
      startDate: "2018-06",
      endDate: null,
      logoInitials: "DS",
      logoColor: "#0a66c2",
    },
  ],

  education: [
    {
      schoolName: {
        ro: "Universitatea POLITEHNICA din București",
        en: "University POLITEHNICA of Bucharest",
      },
      degreeName: {
        ro: "Licență în Informatică",
        en: "Bachelor's Degree, Computer Science",
      },
      startYear: "2014",
      endYear: "2019",
      logoInitials: "UPB",
      logoColor: "#8e1b2c",
    },
  ],

  // skillLevel: 1 = Basic, 2 = Intermediate, 3 = Advanced (HackerRank levels)
  certifications: [
    { certificateName: "SQL", skillLevel: 3, issuedBy: "HackerRank", issueDate: "2024-08" },
    { certificateName: "SQL", skillLevel: 2, issuedBy: "HackerRank", issueDate: "2024-08" },
    { certificateName: "SQL", skillLevel: 1, issuedBy: "HackerRank", issueDate: "2024-08" },
    { certificateName: "CSS", skillLevel: 1, issuedBy: "HackerRank", issueDate: "2024-08" },
  ],

  skills: {
    ro: ["Platforme low-code", "Plant an App", "DNN Sharp", "Aplicații web", "SQL", "CSS", "Analiză tehnică"],
    en: ["Low-code platforms", "Plant an App", "DNN Sharp", "Web applications", "SQL", "CSS", "Technical analysis"],
  },

  lastUpdated: "2026-10",
};
