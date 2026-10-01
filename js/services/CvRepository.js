// Reads the CV from Supabase and turns the database rows into the shape
// CvRenderer works with (camelCase fields, { ro, en } pairs, "YYYY-MM" dates).
export class CvRepository {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async fetchCv() {
    // All five queries run in parallel, the page needs every one of them anyway
    const [profileResult, experienceResult, educationResult, certificationsResult, skillsResult] = await Promise.all([
      this.supabaseClient.from("profile").select("*").eq("id", 1).single(),
      this.supabaseClient.from("work_experience").select("*").order("sort_order"),
      this.supabaseClient.from("education").select("*").order("sort_order"),
      this.supabaseClient.from("certifications").select("*").order("sort_order"),
      this.supabaseClient.from("skills").select("*").order("sort_order"),
    ]);

    const firstError = [profileResult, experienceResult, educationResult, certificationsResult, skillsResult].find(
      (result) => result.error
    )?.error;
    if (firstError) throw firstError;

    const profileRow = profileResult.data;
    const allUpdateDates = [profileRow, ...experienceResult.data, ...educationResult.data, ...certificationsResult.data]
      .map((row) => row.updated_at)
      .sort();

    return {
      personalInfo: {
        fullName: profileRow.full_name,
        avatarInitials: profileRow.avatar_initials,
        linkedinUrl: profileRow.linkedin_url,
        location: toTranslatedText(profileRow.location_ro, profileRow.location_en),
        currentJobTitle: toTranslatedText(profileRow.current_job_title_ro, profileRow.current_job_title_en),
        currentCompany: profileRow.current_company,
      },
      aboutMe: toTranslatedText(profileRow.about_ro, profileRow.about_en),

      workExperience: experienceResult.data.map((row) => ({
        jobTitle: toTranslatedText(row.job_title_ro, row.job_title_en),
        companyName: row.company_name,
        location: row.location_ro ? toTranslatedText(row.location_ro, row.location_en) : null,
        startDate: toYearMonth(row.start_date),
        endDate: toYearMonth(row.end_date),
        logoInitials: row.logo_initials,
        logoColor: row.logo_color,
      })),

      education: educationResult.data.map((row) => ({
        schoolName: toTranslatedText(row.school_name_ro, row.school_name_en),
        degreeName: toTranslatedText(row.degree_name_ro, row.degree_name_en),
        startYear: String(row.start_year),
        endYear: row.end_year ? String(row.end_year) : "",
        logoInitials: row.logo_initials,
        logoColor: row.logo_color,
      })),

      certifications: certificationsResult.data.map((row) => ({
        certificateName: row.certificate_name,
        skillLevel: row.skill_level,
        issuedBy: row.issued_by,
        issueDate: toYearMonth(row.issue_date),
      })),

      skills: {
        ro: skillsResult.data.map((row) => row.name_ro),
        en: skillsResult.data.map((row) => row.name_en),
      },

      // Most recent change anywhere in the CV, shown in the footer
      lastUpdated: toYearMonth(allUpdateDates[allUpdateDates.length - 1]),
    };
  }
}

// If the English text is missing, fall back to Romanian instead of showing nothing
function toTranslatedText(romanianText, englishText) {
  return { ro: romanianText ?? "", en: englishText || romanianText || "" };
}

// "2018-06-01" or "2026-10-01T12:00:00Z" -> "2018-06"
function toYearMonth(dateValue) {
  return dateValue ? dateValue.slice(0, 7) : null;
}
