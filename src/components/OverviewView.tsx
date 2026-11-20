import {
  ADVANTAGES,
  LIMITATIONS,
  LITERATURE_SURVEY,
  PROJECT_CREDITS,
  RESEARCH_GAPS,
  SDG_GOALS,
  SYSTEM_REFERENCES,
} from '../data/presentationData.ts';

export function OverviewView() {
  return (
    <div className="space-y-8">
      {/* Header & Abstract */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <p className="text-xs text-slate-500">
          {PROJECT_CREDITS.institution} · {PROJECT_CREDITS.course}
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1.5 max-w-3xl">
          TruthGraph: Fake News Detection Using Text and Propagation Graphs
        </h2>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-3xl">
          Traditional fake news classifiers rely primarily on article prose and frequently miss sophisticated misinformation written in neutral, journalistic language. TruthGraph combines Natural Language Processing (NLP) for headline and content analysis with Graph Neural Networks (GNNs) that model how articles spread across social networks, fusing both feature representations to classify news as Real or Fake.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200 text-xs">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Supervisor</h3>
            <p className="text-slate-700">{PROJECT_CREDITS.supervisor}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Presented By</h3>
            <ul className="space-y-1 text-slate-700">
              {PROJECT_CREDITS.presenters.map((person) => (
                <li key={person.regNo} className="flex items-center justify-between max-w-xs">
                  <span>{person.name}</span>
                  <span className="font-mono tabular-nums text-slate-500">{person.regNo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Literature Survey Table */}
      <section className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Literature Survey</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Foundational graph-based and multimodal misinformation detection research reviewed for TruthGraph
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-3 px-6 font-medium">Author(s) & Year</th>
                <th className="py-3 px-4 font-medium">Techniques Used</th>
                <th className="py-3 px-4 font-medium">Existing Work</th>
                <th className="py-3 px-6 font-medium">Key Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LITERATURE_SURVEY.map((entry) => (
                <tr key={entry.authors} className="hover:bg-slate-50 align-top">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{entry.authors}</div>
                    <div className="text-slate-500 mt-0.5">{entry.venue}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{entry.techniques}</td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-xs">
                    {entry.existingWork}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 leading-relaxed max-w-xs">
                    {entry.findings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Research Gaps + SDG Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Research Gaps Addressed</h3>
          <dl className="divide-y divide-slate-100">
            {RESEARCH_GAPS.map((gap) => (
              <div key={gap.title} className="py-3 first:pt-0 last:pb-0">
                <dt className="text-xs font-semibold text-slate-900">{gap.title}</dt>
                <dd className="text-xs text-slate-600 mt-1 leading-relaxed">{gap.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Industry Relevance & SDG Alignment
          </h3>
          <dl className="divide-y divide-slate-100">
            {SDG_GOALS.map((sdg) => (
              <div key={sdg.code} className="py-3 first:pt-0 last:pb-0">
                <dt className="text-xs font-semibold text-slate-900">
                  <span className="font-mono text-blue-700 mr-2">{sdg.code}</span>
                  {sdg.title}
                </dt>
                <dd className="text-xs text-slate-600 mt-1 leading-relaxed">{sdg.description}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1.5">Software Stack</h4>
              <ul className="space-y-1 text-slate-600 list-disc pl-4">
                {PROJECT_CREDITS.softwareStack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1.5">Hardware Baseline</h4>
              <ul className="space-y-1 text-slate-600 list-disc pl-4">
                {PROJECT_CREDITS.hardwareStack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Advantages vs Limitations */}
      <section className="bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-3">System Advantages</h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
            {ADVANTAGES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Known Limitations</h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Academic References */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-3">References</h3>
        <ol className="space-y-2 text-xs text-slate-600 list-decimal pl-5 leading-relaxed">
          {SYSTEM_REFERENCES.map((ref) => (
            <li key={ref}>{ref}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
