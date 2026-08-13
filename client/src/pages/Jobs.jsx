import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useJobs, useScrapeJobs, useMatchJob } from "../hooks/useJobs";
import { useGenerateDocuments, downloadDocument } from "../hooks/useDocuments";
import { useCreateApplication } from "../hooks/useApplications";
import JobCard from "../components/JobCard";
import CVPreview from "../components/CVPreview";
import LoadingSpinner from "../components/LoadingSpinner";

const EXPERIENCE_LEVELS = ["", "Entry", "Mid", "Senior", "Lead", "Executive"];

export default function Jobs() {
  const [filters, setFilters] = useState({});
  const [sortByMatch, setSortByMatch] = useState(false);
  const [generatedFor, setGeneratedFor] = useState(null); // { job, cv, coverLetter }
  const { register, handleSubmit } = useForm({ defaultValues: filters });
  const { data, isLoading, isError } = useJobs(filters);
  const scrapeJobs = useScrapeJobs();
  const matchJob = useMatchJob();
  const generateDocs = useGenerateDocuments();
  const createApplication = useCreateApplication();

  const handleGenerate = (jobId) => {
    const job = data?.jobs.find((j) => j.id === jobId);
    generateDocs.mutate(jobId, {
      onSuccess: (result) => setGeneratedFor({ job, ...result }),
    });
  };

  const sortedJobs = useMemo(() => {
    if (!data?.jobs) return [];
    if (!sortByMatch) return data.jobs;
    return [...data.jobs].sort((a, b) => (b.match?.matchScore ?? -1) - (a.match?.matchScore ?? -1));
  }, [data, sortByMatch]);

  const applyFilters = (values) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v !== undefined)
    );
    if (cleaned.remote !== undefined) cleaned.remote = String(cleaned.remote === true || cleaned.remote === "true");
    setFilters(cleaned);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live from Greenhouse, Lever, and (if configured) LinkedIn/Indeed/Glassdoor via RapidAPI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => scrapeJobs.mutate(filters)}
          disabled={scrapeJobs.isPending}
          className="rounded-md bg-lime px-4 py-2 text-sm font-semibold text-navy hover:bg-lime-light disabled:opacity-60"
        >
          {scrapeJobs.isPending ? "Scraping..." : "Scrape now"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit(applyFilters)}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-navy-light/40 p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Role</label>
          <input
            {...register("role")}
            placeholder="e.g. Frontend Engineer"
            className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Location</label>
          <input
            {...register("location")}
            placeholder="e.g. London"
            className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Min salary</label>
          <input
            type="number"
            {...register("salaryMin")}
            className="w-28 rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-white focus:border-electric focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Experience</label>
          <select
            {...register("experienceLevel")}
            className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-white focus:border-electric focus:outline-none"
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level || "Any"}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-1.5 text-sm text-slate-300">
          <input type="checkbox" {...register("remote")} className="rounded" />
          Remote only
        </label>
        <button
          type="submit"
          className="rounded-md bg-electric px-4 py-1.5 text-sm font-semibold text-navy hover:bg-electric-light"
        >
          Apply filters
        </button>
      </form>

      {scrapeJobs.isSuccess && (
        <p className="mt-3 text-xs text-lime">Scraped and stored {scrapeJobs.data.count} listings.</p>
      )}
      {scrapeJobs.isError && (
        <p className="mt-3 text-xs text-red-400">
          {scrapeJobs.error?.response?.data?.message || "Scrape failed"}
        </p>
      )}

      <div className="mt-6">
        {isLoading && <LoadingSpinner label="Loading jobs..." />}
        {isError && <p className="text-sm text-red-400">Failed to load jobs.</p>}
        {data && data.jobs.length === 0 && (
          <p className="text-sm text-slate-400">
            No jobs stored yet — try "Scrape now" to pull listings from configured sources.
          </p>
        )}
        {data && data.jobs.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">{data.total} total matching listings</p>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={sortByMatch}
                  onChange={(e) => setSortByMatch(e.target.checked)}
                  className="rounded"
                />
                Sort by match score
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onMatch={(jobId) => matchJob.mutate(jobId)}
                  matching={matchJob.isPending && matchJob.variables === job.id}
                  onGenerate={handleGenerate}
                  generating={generateDocs.isPending && generateDocs.variables === job.id}
                  onSave={(jobId) => createApplication.mutate({ jobId })}
                  saving={createApplication.isPending && createApplication.variables?.jobId === job.id}
                  saved={job.match != null}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {generateDocs.isError && (
        <p className="mt-3 text-xs text-red-400">
          {generateDocs.error?.response?.data?.message || "Document generation failed"}
        </p>
      )}

      {generatedFor && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Generated for {generatedFor.job?.title} @ {generatedFor.job?.company}
            </h2>
            <button
              type="button"
              onClick={() => setGeneratedFor(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[
              { doc: generatedFor.cv, title: "CV" },
              { doc: generatedFor.coverLetter, title: "Cover Letter" },
            ].map(({ doc, title }) => (
              <div key={doc.id}>
                <CVPreview title={title} content={doc.content} />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => downloadDocument(doc.id, "pdf", `${title.toLowerCase().replace(" ", "-")}`)}
                    className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadDocument(doc.id, "docx", `${title.toLowerCase().replace(" ", "-")}`)}
                    className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    Download DOCX
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
