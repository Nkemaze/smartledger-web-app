import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DonutDatum {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutDatum[]
  size?: number
  strokeWidth?: number
  centerLabel?: string
  centerValue?: string
  className?: string
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 16,
  centerLabel,
  centerValue,
  className = '',
}: DonutChartProps) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2 - 4}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(189,202,186,0.3)',
              fontSize: 12,
              background: '#ffffff',
            }}
            formatter={(value: number) => [`${value}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="font-headline text-headline-md text-on-surface">{centerValue}</span>}
          {centerLabel && (
            <span className="font-label text-label-sm text-on-surface-variant uppercase tracking-widest">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function MiniDonut({ value, size = 96, color = '#006b2c' }: { value: number; size?: number; color?: string }) {
  const strokeWidth = 6
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ name: 'value', value }, { name: 'rest', value: 100 - value }]}
            dataKey="value"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#d3e4fe" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
