import AnalyzeButton from "./AnalyzeButton";

type OpenAlexWork = {
  id: string;
  display_name: string;
  publication_year: number;
  cited_by_count: number;
  doi: string | null;
  abstract_inverted_index: Record<string, number[]> | null;
  authorships: {
    author: {
      display_name: string;
    };
  }[];
  primary_location: {
    source: {
      display_name: string;
    } | null;
  } | null;
};

function reconstructAbstract(invertedIndex: Record<string, number[]> | null) {
  if (!invertedIndex) return "No abstract available.";

  const words: string[] = [];

  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      words[position] = word;
    }
  }

  return words.join(" ");
}

async function getPapers(
  query: string,
  fromYear: string,
  paperCount: string
): Promise<OpenAlexWork[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(
    query
  )}&filter=from_publication_date:${fromYear}-01-01&per_page=${paperCount}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch papers");
  }

  const data = await response.json();

  return data.results;
}

function analyzePapers(papers: OpenAlexWork[]) {
  const text = papers
    .map((paper) => {
      const abstract = reconstructAbstract(paper.abstract_inverted_index);
      return `${paper.display_name} ${abstract}`;
    })
    .join(" ")
    .toLowerCase();

  const keywords = [
    "artificial intelligence",
    "machine learning",
    "learning analytics",
    "ethics",
    "students",
    "teachers",
    "higher education",
    "personalization",
    "assessment",
    "chatgpt",
    "generative ai",
    "digital transformation",
  ];

  const themeScores = keywords
    .map((keyword) => {
      const count = text.split(keyword).length - 1;

      return {
        keyword,
        count,
      };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

const publicationTrend = papers.reduce(
  (acc, paper) => {
    const year = paper.publication_year;

    acc[year] = (acc[year] || 0) + 1;

    return acc;
  },
  {} as Record<number, number>
);

  const recentPapers = papers.filter(
    (paper) => paper.publication_year >= 2023
  ).length;

  const averageCitations =
    papers.length > 0
      ? Math.round(
          papers.reduce((sum, paper) => sum + paper.cited_by_count, 0) /
            papers.length
        )
      : 0;

  const topTheme = themeScores[0]?.keyword || "emerging technologies";

  const gapScore = Math.min(
    100,
    Math.max(
      20,
      70 + recentPapers * 3 - averageCitations
    )
  );

const currentYear = new Date().getFullYear();

const papersLastTwoYears = papers.filter(
  (paper) => paper.publication_year >= currentYear - 1
).length;

const papersPreviousTwoYears = papers.filter(
  (paper) =>
    paper.publication_year >= currentYear - 3 &&
    paper.publication_year < currentYear - 1
).length;

const publicationGrowth =
  papersPreviousTwoYears > 0
    ? Math.round(
        ((papersLastTwoYears - papersPreviousTwoYears) /
          papersPreviousTwoYears) *
          100
      )
    : papersLastTwoYears > 0
    ? 100
    : 0;

const citationMomentum = Math.min(100, averageCitations * 2);

const trendScore = Math.min(
  100,
  Math.max(
    10,
    Math.round(
      papersLastTwoYears * 8 +
        Math.max(0, publicationGrowth) * 0.4 +
        citationMomentum * 0.4
    )
  )
);

  return {
    themes:
      themeScores
        .slice(0, 3)
        .map((item) => `${item.keyword} (${item.count})`)
        .join(", ") || "No dominant theme detected",

    limitations:
      averageCitations < 10
        ? "Low citation maturity, possible emerging field"
        : "Existing literature is visible, but deeper comparative studies may be needed",

    futureWork:
      recentPapers >= 5
        ? "Fast-growing recent interest suggests opportunity for updated studies"
        : "More recent empirical studies may be needed",

    publicationTrend,
    gapScore,
    trendScore,
    publicationGrowth,
    papersLastTwoYears,
    averageCitations,

opportunities: [
  {
    title: `${topTheme} Adoption in Under-Studied Educational Contexts`,
    gapType: "Contextual Gap",
    reason:
      "The topic appears in the literature, but many studies focus on broad or well-researched contexts. There may be room for region-specific or institution-specific research.",
    question: `How is ${topTheme} adopted in under-studied higher education institutions?`,
    method:
      "Comparative mixed-methods study using surveys, interviews, and institutional document analysis",
  },
  {
    title: `Long-Term Effects of ${topTheme} on Learning and Institutional Decision-Making`,
    gapType: "Longitudinal Gap",
    reason:
      recentPapers >= 5
        ? "Recent publication activity suggests growing interest, but long-term evidence may still be limited."
        : "The topic does not show strong recent publication density, which may indicate a need for updated empirical studies.",
    question: `What are the long-term effects of ${topTheme} on students, teachers, and academic decision-making?`,
    method:
      "Longitudinal case study across multiple universities over 12–24 months",
  },
  {
    title: `Barriers to Practical Implementation of ${topTheme}`,
    gapType: "Implementation Gap",
    reason:
      averageCitations < 10
        ? "Low citation maturity may indicate an emerging area where practical barriers are not yet fully mapped."
        : "The literature is visible, but implementation challenges may still differ across institutions and regions.",
    question: `Which technical, cultural, ethical, and policy barriers limit the successful implementation of ${topTheme}?`,
    method:
      "Thematic analysis of interviews with academic staff, students, and administrators",
  },
],
  };
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    from?: string;
    count?: string;
  }>;
}) {
  const params = await searchParams;

  const query = params.q || "";
  const fromYear = params.from || "2020";
  const paperCount = params.count || "10";

  const papers = query ? await getPapers(query, fromYear, paperCount) : [];
  const analysis = analyzePapers(papers);

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold">Research Results</h1>

      <p className="mt-4 text-slate-300">
        Topic: <span className="text-blue-400">{query}</span>
        <br />
        From year: <span className="text-blue-400">{fromYear}</span> · Papers:{" "}
        <span className="text-blue-400">{paperCount}</span>
      </p>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Common Themes</p>
          <p className="mt-2 text-lg font-semibold">{analysis.themes}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Possible Limitations</p>
          <p className="mt-2 text-lg font-semibold">{analysis.limitations}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Future Work Signals</p>
          <p className="mt-2 text-lg font-semibold">{analysis.futureWork}</p>
        </div>

  <div className="rounded-2xl border border-blue-800 bg-blue-950 p-5">
  <p className="text-sm text-blue-300">Research Gap Score</p>

  <p className="mt-2 text-4xl font-bold">
    {analysis.gapScore}
    <span className="text-lg text-blue-300">/100</span>
  </p>

  <div className="mt-4 h-3 rounded-full bg-slate-800">
    <div
      className="h-3 rounded-full bg-blue-500"
      style={{
        width: `${analysis.gapScore}%`,
      }}
    />
  </div>
</div>
      </section>

<section className="mt-10 grid gap-5 md:grid-cols-2 items-stretch">

  <AnalyzeButton />

  <div className="h-full rounded-2xl border border-emerald-800 bg-emerald-950 p-6">
    <p className="text-sm text-emerald-300">
      Trend Score
    </p>

    <p className="mt-2 text-5xl font-bold">
      {analysis.trendScore}
      <span className="text-lg text-emerald-300">
        /100
      </span>
    </p>

    <div className="mt-4 h-3 rounded-full bg-slate-800">
      <div
        className="h-3 rounded-full bg-emerald-500"
        style={{
          width: `${analysis.trendScore}%`,
        }}
      />
    </div>

    <div className="mt-5 space-y-2 text-sm">
      <p>
        Publications (last 2 years):
        <span className="ml-2 text-emerald-300">
          {analysis.papersLastTwoYears}
        </span>
      </p>

      <p>
        Growth:
        <span className="ml-2 text-emerald-300">
          {analysis.publicationGrowth}%
        </span>
      </p>

      <p>
        Avg. Citations:
        <span className="ml-2 text-emerald-300">
          {analysis.averageCitations}
        </span>
      </p>
    </div>
  </div>

</section>

<details className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
  <summary className="cursor-pointer text-lg font-semibold">
    📈 Publication Trend
  </summary>

  <div className="mt-4 space-y-2">
    {Object.entries(analysis.publicationTrend)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => (
        <div
          key={year}
          className="flex items-center justify-between"
        >
          <span>{year}</span>

          <span className="text-blue-400">
            {count} papers
          </span>
        </div>
      ))}
  </div>
</details>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Generated Research Opportunities</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {analysis.opportunities.map((item, index) => (
            <article
              key={index}
              className="rounded-2xl border border-blue-800 bg-slate-900 p-6"
            >
              <p className="text-sm font-semibold text-blue-400">
                Opportunity {index + 1}
              </p>

              <h3 className="mt-2 text-xl font-bold">{item.title}</h3>

              <p className="mt-3 inline-block rounded-full bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-300">
              {item.gapType}
              </p>

              <p className="mt-4 text-sm text-slate-400">
              Why this is an opportunity
              </p>

              <p className="mt-1 text-slate-200">
              {item.reason}
            </p>

              <p className="mt-4 text-sm text-slate-400">Research Question</p>
              <p className="mt-1 text-slate-200">{item.question}</p>

              <p className="mt-4 text-sm text-slate-400">
                Suggested Methodology
              </p>
              <p className="mt-1 text-slate-200">{item.method}</p>
            </article>
          ))}
        </div>
      </section>

      <h2 className="mt-12 text-2xl font-bold">Related Papers</h2>

      <section className="mt-5 grid gap-5">
        {papers.map((paper) => {
          const abstract = reconstructAbstract(paper.abstract_inverted_index);

          const authors = paper.authorships
            ?.map((item) => item.author.display_name)
            .slice(0, 3)
            .join(", ");

          const source =
            paper.primary_location?.source?.display_name || "Unknown source";

          return (
            <article
              key={paper.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="mb-2 text-sm text-blue-400">{source}</p>

              <h2 className="text-xl font-semibold">{paper.display_name}</h2>

              <p className="mt-2 text-sm text-slate-400">
                {authors || "Unknown authors"}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Year: {paper.publication_year} · Citations:{" "}
                {paper.cited_by_count}
              </p>

              <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-300">
                {abstract}
              </p>

              {paper.doi && (
                <a
                  href={paper.doi}
                  target="_blank"
                  className="mt-4 inline-block text-sm text-blue-400 underline"
                >
                  Open DOI
                </a>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}