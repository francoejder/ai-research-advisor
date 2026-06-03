"use client";

import { useState } from "react";

export default function AnalyzeButton() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setResult("");

    const response = await fetch("/api/analyze", {
      method: "POST",
    });

    const data = await response.json();

    setResult(data.result || data.error || "No result returned.");
    setLoading(false);
  }

  return (
    <section className="h-full rounded-2xl border border-blue-800 bg-blue-950 p-6">
      <h2 className="text-2xl font-bold">AI Analysis</h2>

      <p className="mt-2 text-sm text-blue-200">
        Generate research opportunities using OpenAI.
      </p>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>

      {result && (
        <div className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-6 text-slate-200">
          {result}
        </div>
      )}
    </section>
  );
}