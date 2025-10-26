
import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex lg:hidden items-center">
        <span className="font-bold text-xl text-gov-blue">SAARTHI</span>
      </div>
      
      <div className="hidden md:flex items-center space-x-2 w-full max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints, schemes..."
          className="h-9"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gov-orange text-white">
            8
          </Badge>
        </Button>
        
        <ThemeToggle />
        
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gov-blue text-white">RC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
