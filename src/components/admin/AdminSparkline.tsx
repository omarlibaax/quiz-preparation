import { Line, LineChart, ResponsiveContainer } from 'recharts'

type Point = { i: number; v: number }

export function AdminSparkline({
  values,
  color = '#845adf',
  className = '',
}: {
  values: number[]
  color?: string
  className?: string
}) {
  const data: Point[] = values.map((v, i) => ({ i, v }))
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
