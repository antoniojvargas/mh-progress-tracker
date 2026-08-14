import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartMetric, chartMetrics, DailyLog } from '../../types/daily-log';
const colors = ['#42675D', '#E69C7A', '#8579B5'];
export const TrendsChart = ({ logs, metrics }: { logs: DailyLog[]; metrics: ChartMetric[] }) => (
  <div className="h-[310px] w-full" role="img" aria-label="Gráfica de tendencias de bienestar">
    <ResponsiveContainer><LineChart data={logs} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
      <XAxis dataKey="logDate" tickFormatter={(date) => new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))} tick={{ fill: '#66767A', fontSize: 12 }} axisLine={false} tickLine={false}/>
      <YAxis domain={[0, 'auto']} tick={{ fill: '#66767A', fontSize: 12 }} axisLine={false} tickLine={false}/>
      <Tooltip labelFormatter={(date) => new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(`${date}T12:00:00`))} formatter={(value, key) => [value, chartMetrics[key as ChartMetric]]} contentStyle={{ border: 0, borderRadius: 12, boxShadow: '0 12px 30px rgba(47,70,65,.16)' }}/>
      {metrics.map((metric, index) => <Line key={metric} type="monotone" dataKey={metric} name={chartMetrics[metric]} stroke={colors[index]} strokeWidth={3} dot={{ r: 3, strokeWidth: 0, fill: colors[index] }} activeDot={{ r: 5 }} />)}
    </LineChart></ResponsiveContainer>
  </div>
);

