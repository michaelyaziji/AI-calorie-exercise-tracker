import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Progress } from "@shared/schema";

interface ProgressChartProps {
  data: Progress[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map(p => ({
    date: format(new Date(p.timestamp), "MMM d"),
    weight: p.weight
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
