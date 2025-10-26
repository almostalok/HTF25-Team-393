import { ThumbsUp, Users, Plus, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CrowdRequest {
  id: string;
  title: string;
  description: string;
  supporters: number;
  goal: number;
  category: string;
  location?: string;
  createdAt?: string;
}

export function CrowdRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CrowdRequest[]>([
    {
      id: "R-2023-0045",
      title: "New Park in Sector 10",
      description: "Request for development of a community park with play area",
      supporters: 358,
      goal: 500,
      category: "Parks & Recreation",
      location: "Sector 10, City Center",
      createdAt: "2023-05-15",
    },
    {
      id: "R-2023-0062",
      title: "Traffic Signal at City Junction",
      description: "Install traffic lights at the busy intersection",
      supporters: 782,
      goal: 1000,
      category: "Traffic Management",
      location: "Main City Junction",
      createdAt: "2023-05-20",
    },
    {
      id: "R-2023-0078",
      title: "Public Library Renovation",
      description: "Modernize the central library facilities",
      supporters: 215,
      goal: 300,
      category: "Education",
      location: "Central Library, Downtown",
      createdAt: "2023-05-25",
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    goal: "",
  });

  const handleSupport = (requestId: string) => {
    setRequests(requests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          supporters: request.supporters + 1
        };
      }
      return request;
    }));

    toast({
      title: "Support Added",
      description: "Thank you for supporting this request!",
    });
  };

  const handleCreateRequest = () => {
    const newId = `R-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newRequestData: CrowdRequest = {
      id: newId,
      title: newRequest.title,
      description: newRequest.description,
      supporters: 0,
      goal: parseInt(newRequest.goal),
      category: newRequest.category,
      location: newRequest.location,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRequests([newRequestData, ...requests]);
    setNewRequest({
      title: "",
      description: "",
      category: "",
      location: "",
      goal: "",
    });

    toast({
      title: "Request Created",
      description: "Your request has been successfully created!",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Community Requests</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new community request
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Enter request title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe your request"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newRequest.category}
                  onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                    <SelectItem value="Traffic Management">Traffic Management</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal">Support Goal</Label>
                <Input
                  id="goal"
                  type="number"
                  value={newRequest.goal}
                  onChange={(e) => setNewRequest({ ...newRequest, goal: e.target.value })}
                  placeholder="Enter number of supporters needed"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateRequest}>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => {
            const percentage = Math.round((request.supporters / request.goal) * 100);
            
            return (
              <div
                key={request.id}
                className="p-3 border rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{request.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {request.category}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {request.supporters}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="mb-1 text-xs flex justify-between">
                    <span>{request.supporters} supporters</span>
                    <span>{request.goal - request.supporters} needed</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {request.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {request.createdAt}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleSupport(request.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Support
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
