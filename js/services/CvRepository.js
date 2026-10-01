import { supabaseConfig } from "../config.js";

// Reads the CV from Supabase and turns the database rows into the shape
// CvRenderer works with (camelCase fields, { ro, en } pairs, "YYYY-MM" dates).
//
// The public page only reads, so it talks to the REST API with plain fetch()
// instead of loading supabase-js (~77 KB, 9 extra requests). admin.html still uses supabase-js for auth.
export class CvRepository {
  async fetchCv() {
    // All five requests run in parallel, the page needs every one of them anyway
    const [profileRows, experienceRows, educationRows, certificationRows, skillRows] = await Promise.all([
      fetchRows("profile", "id=eq.1"),
      fetchRows("work_experience", "order=sort_order"),
      fetchRows("education", "order=sort_order"),
      fetchRows("certifications", "order=sort_order"),
      fetchRows("skills", "order=sort_order"),
    ]);

    const profileRow = profileRows[0];
    if (!profileRow) throw new Error("The profile table is empty - run supabase/seed.sql");

    const allUpdateDates = [profileRow, ...experienceRows, ...educationRows, ...certificationRows]
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

      workExperience: experienceRows.map((row) => ({
        jobTitle: toTranslatedText(row.job_title_ro, row.job_title_en),
        companyName: row.company_name,
        location: row.location_ro ? toTranslatedText(row.location_ro, row.location_en) : null,
        startDate: toYearMonth(row.start_date),
        endDate: toYearMonth(row.end_date),
        logoInitials: row.logo_initials,
        logoColor: row.logo_color,
      })),

      education: educationRows.map((row) => ({
        schoolName: toTranslatedText(row.school_name_ro, row.school_name_en),
        degreeName: toTranslatedText(row.degree_name_ro, row.degree_name_en),
        startYear: String(row.start_year),
        endYear: row.end_year ? String(row.end_year) : "",
        logoInitials: row.logo_initials,
        logoColor: row.logo_color,
      })),

      certifications: certificationRows.map((row) => ({
        certificateName: row.certificate_name,
        skillLevel: row.skill_level,
        issuedBy: row.issued_by,
        issueDate: toYearMonth(row.issue_date),
      })),

      skills: {
        ro: skillRows.map((row) => row.name_ro),
        en: skillRows.map((row) => row.name_en),
      },

      // Most recent change anywhere in the CV, shown in the footer
      lastUpdated: toYearMonth(allUpdateDates[allUpdateDates.length - 1]),
    };
  }
}

async function fetchRows(tableName, queryString) {
  const response = await fetch(`${supabaseConfig.projectUrl}/rest/v1/${tableName}?select=*&${queryString}`, {
    headers: { apikey: supabaseConfig.publishableKey },
    cache: "no-store", // always show the latest data saved from admin.html
  });

  if (!response.ok) {
    throw new Error(`Loading ${tableName} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// If the English text is missing, fall back to Romanian instead of showing nothing
function toTranslatedText(romanianText, englishText) {
  return { ro: romanianText ?? "", en: englishText || romanianText || "" };
}

// "2018-06-01" or "2026-10-01T12:00:00Z" -> "2018-06"
function toYearMonth(dateValue) {
  return dateValue ? dateValue.slice(0, 7) : null;
}
