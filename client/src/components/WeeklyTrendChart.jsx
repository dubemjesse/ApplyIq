import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER, CHART_GRID_COLOR, CHART_AXIS_COLOR } from "../utils/chartColors";

const tooltipStyle = {
  background: "#0a1930",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function WeeklyTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
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
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_AXIS_COLOR }} />
        {STATUS_ORDER.map((status) => (
          <Bar
            key={status}
            dataKey={status}
            name={STATUS_LABELS[status]}
            stackId="pipeline"
            fill={STATUS_COLORS[status]}
            stroke="#0a1930"
            strokeWidth={2}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
