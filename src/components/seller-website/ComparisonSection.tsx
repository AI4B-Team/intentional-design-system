interface ComparisonRow {
  label: string;
  traditional: string;
  company: string;
}

interface ComparisonSectionProps {
  companyName: string;
  primaryColor: string;
  accentColor: string;
  rows?: ComparisonRow[];
  headline?: string;
  subheadline?: string;
  traditionalLabel?: string;
  companyLabel?: string;
}

const DEFAULT_ROWS: ComparisonRow[] = [
  { label: "Commissions & Fees", traditional: "6% ($18,000+)", company: "$0" },
  { label: "Closing Costs", traditional: "Seller pays", company: "We pay" },
  { label: "Time to Close", traditional: "60–90 days", company: "3–14 days" },
  { label: "Repairs Required", traditional: "Yes", company: "None" },
  { label: "Showings & Open Houses", traditional: "Required", company: "None" },
  { label: "Certainty of Sale", traditional: "Uncertain", company: "Guaranteed" },
  { label: "Closing Date", traditional: "Buyer decides", company: "You choose" },
];

export function ComparisonSection({ companyName, primaryColor, accentColor, rows, headline, subheadline, traditionalLabel, companyLabel }: ComparisonSectionProps) {
  const displayRows = rows && rows.length > 0 ? rows : DEFAULT_ROWS;
  const resolvedHeadline = (headline || "Why Sellers Choose {companyName}").replace("{companyName}", companyName);
  const resolvedSubheadline = subheadline || "See how we compare to listing with an agent";
  const resolvedCompanyLabel = (companyLabel || companyName).replace("{companyName}", companyName);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          {resolvedHeadline}
        </h2>
        <p className="text-gray-500 text-center mb-10">
          {resolvedSubheadline}
        </p>

        <div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-500" />
                <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                  {traditionalLabel || "Traditional Agent"}
                </th>
                <th
                  className="py-4 px-6 text-center text-sm font-bold"
                  style={{ color: accentColor }}
                >
                  {resolvedCompanyLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr
                  key={index}
                  className={index < displayRows.length - 1 ? "border-b border-gray-100" : ""}
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {row.label}
                  </td>
                  <td className="py-4 px-6 text-center text-sm text-gray-500">
                    {row.traditional}
                  </td>
                  <td
                    className="py-4 px-6 text-center text-sm font-semibold"
                    style={{ color: accentColor }}
                  >
                    {row.company}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
