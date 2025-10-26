import { FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Scheme {
  id: string;
  title: string;
  description: string;
  sector: string;
  eligibility: string[];
  deadline: string;
}

export function GovernmentSchemes() {
  const schemes: Scheme[] = [
    {
      id: "S-2023-0015",
      title: "PM Kisan Samman Nidhi",
      description: "Financial support for farmers with small landholdings",
      sector: "Agriculture",
      eligibility: ["Small Farmers", "Marginal Farmers"],
      deadline: "Ongoing",
    },
    {
      id: "S-2023-0023",
      title: "PM Awas Yojana",
      description: "Housing subsidy for economically weaker sections",
      sector: "Housing",
      eligibility: ["Low Income", "No House Owner"],
      deadline: "30 June 2023",
    },
    {
      id: "S-2023-0031",
      title: "Skill India Program",
      description: "Vocational training for youth employment",
      sector: "Education",
      eligibility: ["Age 18-35", "Min. 10th Pass"],
      deadline: "15 July 2023",
    },
  ];

  const handleApplyClick = () => {
    window.open("https://www.idfcfirstbank.com/pm-care-fund", "_blank");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Government Schemes</CardTitle>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="p-3 border rounded-lg hover:bg-accent/10 transition-colors cursor-pointer flex justify-between"
            >
              <div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gov-blue mr-2" />
                  <span className="font-medium">{scheme.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {scheme.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {scheme.sector}
                  </Badge>
                  {scheme.eligibility.map((item) => (
                    <Badge 
                      key={item} 
                      variant="secondary" 
                      className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="text-xs text-muted-foreground">
                  Deadline: {scheme.deadline}
                </div>
                <Button size="sm" onClick={handleApplyClick}>Apply Now</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
