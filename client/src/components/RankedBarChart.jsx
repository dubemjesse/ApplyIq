import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_GRID_COLOR, CHART_AXIS_COLOR } from "../utils/chartColors";

const tooltipStyle = {
  background: "#0a1930",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 12,
};

// Horizontal ranked bar chart for magnitude data (skill gaps, top companies)
// — single sequential hue, sorted by the caller.
export default function RankedBarChart({ data, labelKey, valueKey, color, emptyText }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey={labelKey}
          tick={{ fill: CHART_AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
