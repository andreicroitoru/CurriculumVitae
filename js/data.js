/* ============================================================
   CV DATA — edit here to update the site.
   Every text field has "ro" and "en" versions.
   ============================================================ */
const CV = {
  name: "Andrei Croitoru",
  initials: "AC",
  linkedin: "https://www.linkedin.com/in/andrei-croitoru-04aa43162",
  updated: "2026-10-01",
  location: { ro: "București, România", en: "Bucharest, Romania" },
  role: { ro: "Low Code Engineer", en: "Low Code Engineer" },
  company: "Plant an App",
  about: {
    ro: "Sociabil și atent la detalii, cu talent pentru a consolida relații profesionale. Concentrat pe livrarea celor mai bune rezultate și motivat să învăț lucruri noi și să-mi dezvolt în continuare pregătirea tehnică și analitică.",
    en: "Outgoing and detail-oriented, proficient at consolidating professional relationships. Focused on delivering the best possible results and deeply motivated to learn new skills and further improve my technical and analytical background."
  },
  experience: [
    {
      title: { ro: "Low Code Engineer", en: "Low Code Engineer" },
      org: "Plant an App",
      place: { ro: "București, România", en: "Bucharest, Romania" },
      start: "2018-06", end: null,
      mark: "PA", color: "#2f9e5b"
    },
    {
      title: { ro: "Web Application Developer", en: "Web Application Developer" },
      org: "DNN Sharp",
      place: null,
      start: "2018-06", end: null,
      mark: "DS", color: "#0a66c2"
    }
  ],
  education: [
    {
      degree: { ro: "Licență în Informatică", en: "Bachelor's Degree, Computer Science" },
      org: { ro: "Universitatea POLITEHNICA din București", en: "University POLITEHNICA of Bucharest" },
      start: "2014", end: "2019",
      mark: "UPB", color: "#8e1b2c"
    }
  ],
  // level: 1 = Basic, 2 = Intermediate, 3 = Advanced
  certifications: [
    { name: "SQL", level: 3, issuer: "HackerRank", date: "2024-08" },
    { name: "SQL", level: 2, issuer: "HackerRank", date: "2024-08" },
    { name: "SQL", level: 1, issuer: "HackerRank", date: "2024-08" },
    { name: "CSS", level: 1, issuer: "HackerRank", date: "2024-08" }
  ],
  skills: {
    ro: ["Platforme low-code", "Plant an App", "DNN Sharp", "Aplicații web", "SQL", "CSS", "Analiză tehnică"],
    en: ["Low-code platforms", "Plant an App", "DNN Sharp", "Web applications", "SQL", "CSS", "Technical analysis"]
  }
};
