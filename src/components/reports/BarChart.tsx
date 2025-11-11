import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  nameKey: string;
  name: string;
  color?: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({ data, dataKey, nameKey, name, color = '#1976d2' }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} name={name} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;

