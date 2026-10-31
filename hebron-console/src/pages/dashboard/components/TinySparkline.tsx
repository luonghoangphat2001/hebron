import { Line, LineChart, ResponsiveContainer } from 'recharts';

type Props = {
  data: number[];
  color: string;
  className?: string;
};

const TinySparkline = ({ data, color, className = 'h-10 w-full' }: Props) => {
  if (!data.length) return null;

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data.map((value, index) => ({ index, value }))} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line type='linear' dataKey='value' stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TinySparkline;
