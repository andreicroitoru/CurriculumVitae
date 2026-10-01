export class DateFormatter {
  constructor(labels, today = new Date()) {
    this.labels = labels;
    this.today = today;
  }

  // "2018-06" -> { year: 2018, month: 6 }. Month is null for "2018".
  static parseYearMonth(dateString) {
    const [year, month] = dateString.split("-").map(Number);
    return { year, month: month || null };
  }

  // "2018-06" -> "iun. 2018" / "Jun 2018", null -> "Prezent" / "Present"
  formatMonthYear(dateString) {
    if (!dateString) return this.labels.present;

    const { year, month } = DateFormatter.parseYearMonth(dateString);
    if (!month) return String(year);

    return `${this.labels.shortMonthNames[month - 1]} ${year}`;
  }

  // Same rule LinkedIn uses: the starting month counts as a full month,
  // so Jun 2018 -> Oct 2026 shows "8 yrs 5 mos", not "8 yrs 4 mos".
  formatDuration(startDate, endDate) {
    const totalMonths = this.countMonthsBetween(startDate, endDate) + 1;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const parts = [];
    if (years > 0) parts.push(this.labels.formatYears(years));
    if (months > 0) parts.push(this.labels.formatMonths(months));
    return parts.join(" ");
  }

  countFullYearsSince(startDate) {
    return Math.floor(this.countMonthsBetween(startDate, null) / 12);
  }

  countMonthsBetween(startDate, endDate) {
    const start = DateFormatter.parseYearMonth(startDate);
    const end = endDate
      ? DateFormatter.parseYearMonth(endDate)
      : { year: this.today.getFullYear(), month: this.today.getMonth() + 1 };

    return (end.year - start.year) * 12 + ((end.month || 1) - (start.month || 1));
  }
}
