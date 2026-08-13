import { useEffect, useState } from "react";
import { useApplications, useUpdateApplication, useDeleteApplication } from "../hooks/useApplications";
import KanbanBoard from "../components/KanbanBoard";
import LoadingSpinner from "../components/LoadingSpinner";
import FollowUpsPanel from "../components/FollowUpsPanel";

export default function Applications() {
  const { data: applications, isLoading, isError } = useApplications();
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ notes: "", contactName: "", contactEmail: "" });

  useEffect(() => {
    if (!selected) return;
    setForm({
      notes: selected.notes ?? "",
      contactName: selected.contactName ?? "",
      contactEmail: selected.contactEmail ?? "",
    });
  }, [selected]);

  // Keep the detail panel in sync after a status drag or save.
  useEffect(() => {
    if (!selected || !applications) return;
    const fresh = applications.find((a) => a.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [applications]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (id, status) => {
    updateApplication.mutate({ id, status });
  };

  const handleSave = () => {
    updateApplication.mutate({ id: selected.id, ...form });
  };

  const handleDelete = () => {
    deleteApplication.mutate(selected.id, { onSuccess: () => setSelected(null) });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Applications</h1>
      <p className="mt-1 text-sm text-slate-400">
        Drag cards between stages to track your pipeline. Click a card to edit notes and contacts.
      </p>

      <div className="mt-6">
        {isLoading && <LoadingSpinner label="Loading applications..." />}
        {isError && <p className="text-sm text-red-400">Failed to load applications.</p>}
        {applications && applications.length === 0 && (
          <p className="text-sm text-slate-400">
            No applications yet — save a job from the Jobs page to start tracking it here.
          </p>
        )}
        {applications && applications.length > 0 && (
          <KanbanBoard
            applications={applications}
            onStatusChange={handleStatusChange}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        )}
      </div>

      {selected && (
        <div className="mt-8 rounded-xl border border-white/10 bg-navy-light/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{selected.job?.title}</h2>
              <p className="text-sm text-slate-400">{selected.job?.company}</p>
              {selected.appliedAt && (
                <p className="mt-1 text-xs text-slate-500">
                  Applied {new Date(selected.appliedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Contact name</label>
              <input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Contact email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-400">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-md border border-white/10 bg-navy px-3 py-2 text-sm text-white focus:border-electric focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={updateApplication.isPending}
              className="rounded-md bg-electric px-4 py-2 text-sm font-semibold text-navy hover:bg-electric-light disabled:opacity-60"
            >
              {updateApplication.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteApplication.isPending}
              className="rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-60"
            >
              Remove from tracker
            </button>
          </div>

          <FollowUpsPanel applicationId={selected.id} />
        </div>
      )}
    </div>
  );
}
