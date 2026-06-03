"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [fromYear, setFromYear] = useState("2020");
  const [paperCount, setPaperCount] = useState("10");
  const router = useRouter();

  const handleSearch = () => {
    if (!topic.trim()) return;

    router.push(
      `/research?q=${encodeURIComponent(topic)}&from=${fromYear}&count=${paperCount}`
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
          AI Research Advisor
        </p>

        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          Discover Research Opportunities
        </h1>

        <p className="mb-8 max-w-2xl text-slate-300">
          Find research gaps, limitations, future work opportunities and
          emerging topics.
        </p>

        <div className="grid w-full max-w-2xl gap-3 rounded-2xl bg-white p-3 text-left">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-xl px-4 py-3 text-black outline-none"
            placeholder="Enter research topic..."
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              className="rounded-xl border px-4 py-3 text-black outline-none"
              placeholder="From year"
            />

            <select
              value={paperCount}
              onChange={(e) => setPaperCount(e.target.value)}
              className="rounded-xl border px-4 py-3 text-black outline-none"
            >
              <option value="5">5 papers</option>
              <option value="10">10 papers</option>
              <option value="20">20 papers</option>
              <option value="50">50 papers</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Start Research
          </button>
        </div>
      </section>
    </main>
  );
}