
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function BudgetTransparency() {
  const budgetData = [
    { name: 'Education', value: 25, color: '#0052CC' },
    { name: 'Healthcare', value: 20, color: '#00B8D9' },
    { name: 'Infrastructure', value: 30, color: '#36B37E' },
    { name: 'Agriculture', value: 15, color: '#FF8B00' },
    { name: 'Defense', value: 10, color: '#6554C0' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, 'Budget Allocation']}
                labelFormatter={(index) => budgetData[index].name}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {budgetData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="text-sm">
                <span>{item.name}</span>
                <span className="ml-1 text-muted-foreground">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
