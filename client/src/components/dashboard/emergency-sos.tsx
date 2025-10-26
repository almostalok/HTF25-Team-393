
import { Phone, PhoneCall, Flame, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function EmergencySOS() {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();
  
  const handleSOSClick = () => {
    if (!isActive) {
      setIsActive(true);
      toast({
        title: "Emergency SOS Activated",
        description: "Your location has been shared with emergency services",
        variant: "destructive",
      });
      
      // Reset after some time in a real app, would connect to emergency services
      setTimeout(() => {
        setIsActive(false);
      }, 5000);
    }
  };

  const emergencyContacts = [
    {
      name: "Police",
      number: "100",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      name: "Ambulance",
      number: "108",
      icon: <PhoneCall className="h-4 w-4" />,
    },
    {
      name: "Fire",
      number: "101",
      icon: <Flame className="h-4 w-4" />,
    },
  ];

  return (
    <Card className="border-red-100 dark:border-red-900">
      <CardHeader className="bg-red-50 dark:bg-red-900/30">
        <CardTitle className="text-lg font-medium text-red-800 dark:text-red-400 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Emergency Services
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <Button
              className={`btn-sos h-20 w-20 ${isActive ? "animate-pulse-urgent" : ""}`}
              onClick={handleSOSClick}
            >
              <span className="text-lg">SOS</span>
            </Button>
            {isActive && (
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ripple"></div>
                <div className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ripple animation-delay-1000"></div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-center mb-6 max-w-xs">
            Press the SOS button to alert emergency services with your current location
          </p>
          
          <div className="grid grid-cols-3 gap-3 w-full">
            {emergencyContacts.map((contact) => (
              <Button
                key={contact.name}
                variant="outline"
                className="flex flex-col items-center h-auto py-3 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => {
                  toast({
                    title: `Calling ${contact.name}`,
                    description: `Dialing ${contact.number}...`,
                  });
                }}
              >
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 mb-2">
                  {contact.icon}
                </div>
                <span className="text-xs font-medium">{contact.name}</span>
                <span className="text-xs mt-1">{contact.number}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
