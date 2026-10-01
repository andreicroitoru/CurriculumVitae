// Describes every editable table: which columns show up in the admin forms and how.
//
// Field types: text, url, textarea, month, year, number, color, select
// width: "half" puts two fields side by side (RO / EN pairs mostly)

const sortOrderField = {
  name: "sort_order",
  label: "Ordine",
  type: "number",
  width: "half",
  hint: "Numerele mici apar primele",
};

export const editorSchemas = [
  {
    tableName: "profile",
    title: "Profil",
    isSingleRow: true,
    fields: [
      { name: "full_name", label: "Nume complet", type: "text", required: true, width: "half" },
      { name: "avatar_initials", label: "Inițiale avatar", type: "text", required: true, width: "half" },
      { name: "current_job_title_ro", label: "Rol actual (RO)", type: "text", width: "half" },
      { name: "current_job_title_en", label: "Rol actual (EN)", type: "text", width: "half" },
      { name: "current_company", label: "Companie actuală", type: "text", width: "half" },
      { name: "linkedin_url", label: "Link LinkedIn", type: "url", width: "half" },
      { name: "location_ro", label: "Locație (RO)", type: "text", width: "half" },
      { name: "location_en", label: "Locație (EN)", type: "text", width: "half" },
      { name: "about_ro", label: "Despre (RO)", type: "textarea" },
      { name: "about_en", label: "Despre (EN)", type: "textarea" },
    ],
  },
  {
    tableName: "work_experience",
    title: "Experiență",
    newRecordLabel: "Adaugă job",
    describeRecord: (record) => `${record.job_title_ro || "Job nou"} · ${record.company_name || ""}`,
    fields: [
      { name: "job_title_ro", label: "Titlu (RO)", type: "text", required: true, width: "half" },
      { name: "job_title_en", label: "Titlu (EN)", type: "text", required: true, width: "half" },
      { name: "company_name", label: "Companie", type: "text", required: true },
      { name: "location_ro", label: "Locație (RO)", type: "text", width: "half" },
      { name: "location_en", label: "Locație (EN)", type: "text", width: "half" },
      { name: "start_date", label: "Început", type: "month", required: true, width: "half" },
      { name: "end_date", label: "Sfârșit", type: "month", width: "half", hint: "Gol = lucrez încă aici" },
      { name: "logo_initials", label: "Inițiale logo", type: "text", width: "half" },
      { name: "logo_color", label: "Culoare logo", type: "color", width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "education",
    title: "Educație",
    newRecordLabel: "Adaugă școală",
    describeRecord: (record) => record.school_name_ro || "Școală nouă",
    fields: [
      { name: "school_name_ro", label: "Instituție (RO)", type: "text", required: true, width: "half" },
      { name: "school_name_en", label: "Instituție (EN)", type: "text", required: true, width: "half" },
      { name: "degree_name_ro", label: "Diplomă (RO)", type: "text", width: "half" },
      { name: "degree_name_en", label: "Diplomă (EN)", type: "text", width: "half" },
      { name: "start_year", label: "An început", type: "year", required: true, width: "half" },
      { name: "end_year", label: "An absolvire", type: "year", width: "half" },
      { name: "logo_initials", label: "Inițiale logo", type: "text", width: "half" },
      { name: "logo_color", label: "Culoare logo", type: "color", width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "certifications",
    title: "Certificări",
    newRecordLabel: "Adaugă certificare",
    describeRecord: (record) => `${record.certificate_name || "Certificare nouă"} · ${record.issued_by || ""}`,
    fields: [
      { name: "certificate_name", label: "Nume", type: "text", required: true, width: "half" },
      {
        name: "skill_level",
        label: "Nivel",
        type: "select",
        width: "half",
        options: [
          { value: 1, label: "Basic" },
          { value: 2, label: "Intermediate" },
          { value: 3, label: "Advanced" },
        ],
      },
      { name: "issued_by", label: "Emisă de", type: "text", required: true, width: "half" },
      { name: "issue_date", label: "Data emiterii", type: "month", width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "skills",
    title: "Competențe",
    newRecordLabel: "Adaugă competență",
    describeRecord: (record) => record.name_ro || "Competență nouă",
    fields: [
      { name: "name_ro", label: "Nume (RO)", type: "text", required: true, width: "half" },
      { name: "name_en", label: "Nume (EN)", type: "text", required: true, width: "half" },
      sortOrderField,
    ],
  },
];
