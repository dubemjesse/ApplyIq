import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER, CHART_GRID_COLOR, CHART_AXIS_COLOR } from "../utils/chartColors";

const tooltipStyle = {
  background: "#0a1930",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function StatusBreakdownChart({ totals }) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: totals[status] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
          axisLine={{ stroke: CHART_GRID_COLOR }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
