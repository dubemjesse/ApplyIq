import { useState } from "react";
import {
  useFollowUps,
  useCreateFollowUp,
  useSendFollowUpNow,
  useCancelFollowUp,
} from "../hooks/useFollowUps";

export default function FollowUpsPanel({ applicationId }) {
  const { data: followUps, isLoading } = useFollowUps(applicationId);
  const createFollowUp = useCreateFollowUp(applicationId);
  const sendNow = useSendFollowUpNow(applicationId);
  const cancelFollowUp = useCancelFollowUp(applicationId);
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!scheduledAt) return;
    createFollowUp.mutate(new Date(scheduledAt).toISOString(), {
      onSuccess: () => setScheduledAt(""),
    });
  };

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="text-sm font-semibold text-white">Follow-ups</h3>
      <p className="mt-1 text-xs text-slate-400">
        AI drafts the email when you schedule it; it sends automatically at the scheduled time (or click "Send now").
      </p>

      <form onSubmit={handleSchedule} className="mt-3 flex items-center gap-2">
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-white focus:border-electric focus:outline-none"
        />
        <button
          type="submit"
          disabled={createFollowUp.isPending || !scheduledAt}
          className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
        >
          {createFollowUp.isPending ? "Drafting..." : "Schedule follow-up"}
        </button>
      </form>
      {createFollowUp.isError && (
        <p className="mt-2 text-xs text-red-400">
          {createFollowUp.error?.response?.data?.message || "Failed to schedule follow-up"}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {isLoading && <p className="text-xs text-slate-500">Loading follow-ups...</p>}
        {followUps?.length === 0 && <p className="text-xs text-slate-500">No follow-ups scheduled.</p>}
        {followUps?.map((followUp) => (
          <div key={followUp.id} className="rounded-md bg-navy/60 p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">{followUp.emailSubject}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {followUp.sent
                    ? `Sent ${new Date(followUp.sentAt).toLocaleString()}`
                    : `Scheduled for ${new Date(followUp.scheduledAt).toLocaleString()}`}
                </p>
              </div>
              {!followUp.sent && (
                <div className="flex shrink-0 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => sendNow.mutate(followUp.id)}
                    disabled={sendNow.isPending}
                    className="text-lime hover:underline disabled:opacity-60"
                  >
                    {sendNow.isPending && sendNow.variables === followUp.id ? "Sending..." : "Send now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelFollowUp.mutate(followUp.id)}
                    disabled={cancelFollowUp.isPending}
                    className="text-red-300 hover:underline disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {sendNow.isError && sendNow.variables === followUp.id && (
              <p className="mt-1 text-xs text-red-400">
                {sendNow.error?.response?.data?.message || "Send failed"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
