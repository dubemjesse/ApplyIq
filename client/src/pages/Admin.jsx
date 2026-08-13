import { useAuth } from "../context/AuthContext";
import { useAdminUsers, useUpdateUserRole, useDeleteUser, useAdminAgentRuns, useAdminStats } from "../hooks/useAdmin";
import StatTile from "../components/StatTile";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_STYLES = {
  SUCCESS: "text-lime",
  RUNNING: "text-electric-light",
  FAILED: "text-red-400",
};

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  const { data: runsData, isLoading: runsLoading } = useAdminAgentRuns();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Admin</h1>
      <p className="mt-1 text-sm text-slate-400">Manage users, monitor scraping health, and review agent activity.</p>

      {statsLoading && <LoadingSpinner label="Loading stats..." />}
      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Users" value={stats.usage.totalUsers} />
            <StatTile label="Jobs scraped" value={stats.usage.totalJobListings} />
            <StatTile label="Applications" value={stats.usage.totalApplications} />
            <StatTile label="Documents generated" value={stats.usage.totalGeneratedDocuments} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Scraping health</h2>
              <p className="mt-1 text-xs text-slate-400">Listings currently stored per source, and when each was last scraped.</p>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-1.5 pr-4">Source</th>
                    <th className="py-1.5 pr-4">Listings</th>
                    <th className="py-1.5">Last scraped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {stats.scrapingHealth.map((row) => (
                    <tr key={row.source}>
                      <td className="py-1.5 pr-4">{row.source}</td>
                      <td className="py-1.5 pr-4">{row.count}</td>
                      <td className="py-1.5 text-xs text-slate-400">
                        {row.lastScrapedAt ? new Date(row.lastScrapedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Usage stats</h2>
              <p className="mt-1 text-xs text-slate-400">Derived counts of stored records — not raw API call metering.</p>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-slate-400">Applications matched</dt>
                <dd className="text-right text-slate-200">{stats.usage.totalMatched}</dd>
                <dt className="text-slate-400">Follow-ups drafted</dt>
                <dd className="text-right text-slate-200">{stats.usage.totalFollowUps}</dd>
                <dt className="text-slate-400">Follow-ups sent</dt>
                <dd className="text-right text-slate-200">{stats.usage.sentFollowUps}</dd>
                <dt className="text-slate-400">Agent runs — success</dt>
                <dd className="text-right text-lime">{stats.usage.agentRunsByStatus.SUCCESS}</dd>
                <dt className="text-slate-400">Agent runs — failed</dt>
                <dd className="text-right text-red-400">{stats.usage.agentRunsByStatus.FAILED}</dd>
                <dt className="text-slate-400">Agent runs — running</dt>
                <dd className="text-right text-electric-light">{stats.usage.agentRunsByStatus.RUNNING}</dd>
              </dl>
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Users</h2>
        {usersLoading && <LoadingSpinner label="Loading users..." />}
        {usersData && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-light/40 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Applications</th>
                  <th className="px-4 py-2">Agent runs</th>
                  <th className="px-4 py-2">Joined</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersData.users.map((u) => (
                  <tr key={u.id} className="text-slate-300">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2 text-slate-400">{u.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={u.role}
                        disabled={u.id === currentUser?.id || updateRole.isPending}
                        onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                        className="rounded-md border border-white/10 bg-navy px-2 py-1 text-xs text-white disabled:opacity-50"
                      >
                        <option value="JOBSEEKER">Jobseeker</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">{u._count.applications}</td>
                    <td className="px-4 py-2">{u._count.agentRuns}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {u.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => deleteUser.mutate(u.id)}
                          disabled={deleteUser.isPending}
                          className="text-xs text-red-300 hover:underline disabled:opacity-60"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Agent run log (all users)</h2>
        {runsLoading && <LoadingSpinner label="Loading run log..." />}
        {runsData && runsData.runs.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">No agent runs recorded yet.</p>
        )}
        {runsData && runsData.runs.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-light/40 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Started</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Jobs found</th>
                  <th className="px-4 py-2">Matched</th>
                  <th className="px-4 py-2">Documents</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {runsData.runs.map((run) => (
                  <tr key={run.id} className="text-slate-300">
                    <td className="px-4 py-2 text-xs text-slate-400">{run.user?.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(run.startedAt).toLocaleString()}</td>
                    <td className={`px-4 py-2 font-medium ${STATUS_STYLES[run.status] || ""}`}>{run.status}</td>
                    <td className="px-4 py-2">{run.jobsFound}</td>
                    <td className="px-4 py-2">{run.jobsMatched}</td>
                    <td className="px-4 py-2">{run.documentsGenerated}</td>
                    <td className="px-4 py-2 max-w-xs truncate text-xs text-red-400" title={run.error || ""}>
                      {run.error || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
