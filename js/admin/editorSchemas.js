// Describes every editable table: sidebar entry, list columns and form fields.
//
// Field types: text, url, textarea, month, year, number, color, select
// optionsFrom: a select whose options are the rows of another table (a nomenclator), e.g. collaboration types
// width: "half" puts two fields side by side in the dialog (RO / EN pairs mostly)
// emptyLabel: what the list shows when the value is null (e.g. end_date -> "Prezent");
//   on a select it also adds an empty first option, so the value can be cleared
// listColumns: which fields show up as columns in the table, in order

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
    icon: "person",
    isSingleRow: true,
    itemName: "profilul",
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
    icon: "briefcase",
    itemName: "job",
    listColumns: ["job_title_ro", "company_name", "collaboration_type_id", "start_date", "end_date", "sort_order"],
    fields: [
      { name: "job_title_ro", label: "Titlu (RO)", type: "text", required: true, width: "half" },
      { name: "job_title_en", label: "Titlu (EN)", type: "text", required: true, width: "half" },
      { name: "company_name", label: "Companie", type: "text", required: true, width: "half" },
      {
        name: "collaboration_type_id",
        label: "Tip colaborare",
        type: "select",
        width: "half",
        optionsFrom: { tableName: "collaboration_types", labelColumn: "name_ro" },
        emptyLabel: "—",
        hint: "Lista se editează în tab-ul „Tipuri colaborare”",
      },
      { name: "location_ro", label: "Locație (RO)", type: "text", width: "half" },
      { name: "location_en", label: "Locație (EN)", type: "text", width: "half" },
      { name: "start_date", label: "Început", type: "month", required: true, width: "half" },
      {
        name: "end_date",
        label: "Sfârșit",
        type: "month",
        width: "half",
        hint: "Gol = lucrez încă aici",
        emptyLabel: "Prezent",
      },
      { name: "logo_initials", label: "Inițiale logo", type: "text", width: "half" },
      { name: "logo_color", label: "Culoare logo", type: "color", width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "education",
    title: "Educație",
    icon: "graduationCap",
    itemName: "școală",
    listColumns: ["school_name_ro", "degree_name_ro", "start_year", "end_year", "sort_order"],
    fields: [
      { name: "school_name_ro", label: "Instituție (RO)", type: "text", required: true, width: "half" },
      { name: "school_name_en", label: "Instituție (EN)", type: "text", required: true, width: "half" },
      { name: "degree_name_ro", label: "Diplomă (RO)", type: "text", width: "half" },
      { name: "degree_name_en", label: "Diplomă (EN)", type: "text", width: "half" },
      { name: "start_year", label: "An început", type: "year", required: true, width: "half" },
      { name: "end_year", label: "An absolvire", type: "year", width: "half", emptyLabel: "În curs" },
      { name: "logo_initials", label: "Inițiale logo", type: "text", width: "half" },
      { name: "logo_color", label: "Culoare logo", type: "color", width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "certifications",
    title: "Certificări",
    icon: "badge",
    itemName: "certificare",
    listColumns: ["certificate_name", "skill_level", "issued_by", "issue_date", "sort_order"],
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
    icon: "sparkles",
    itemName: "competență",
    listColumns: ["name_ro", "name_en", "sort_order"],
    fields: [
      { name: "name_ro", label: "Nume (RO)", type: "text", required: true, width: "half" },
      { name: "name_en", label: "Nume (EN)", type: "text", required: true, width: "half" },
      sortOrderField,
    ],
  },
  {
    tableName: "collaboration_types",
    title: "Tipuri colaborare",
    icon: "contract",
    itemName: "tip de colaborare",
    deleteWarning: "Joburile care îl folosesc rămân fără tip de colaborare.",
    listColumns: ["name_ro", "name_en", "sort_order"],
    fields: [
      { name: "name_ro", label: "Denumire (RO)", type: "text", required: true, hint: "Ex.: Contract individual de muncă - normă întreagă" },
      { name: "name_en", label: "Denumire (EN)", type: "text", required: true, width: "half", hint: "Ce apare pe site în engleză, ex.: Full-time" },
      sortOrderField,
    ],
  },
];
