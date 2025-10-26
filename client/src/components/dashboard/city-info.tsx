import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Gauge, Calendar, Phone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: React.ReactNode;
}

interface AQIData {
  value: number;
  level: string;
  description: string;
  color: string;
}

interface CityInfo {
  date: string;
  time: string;
  population: string;
  area: string;
  emergencyContacts: {
    police: string;
    ambulance: string;
    fire: string;
  };
}

export function CityInfo() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - In a real app, this would come from an API
  const weatherData: WeatherData = {
    temperature: 32,
    condition: "Sunny",
    humidity: 65,
    windSpeed: 12,
    precipitation: 0,
    icon: <Sun className="h-8 w-8 text-yellow-500" />
  };

  const aqiData: AQIData = {
    value: 156,
    level: "Unhealthy",
    description: "Air quality is unhealthy. Sensitive groups should reduce outdoor activities.",
    color: "bg-orange-500"
  };

  const cityInfo: CityInfo = {
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: new Date().toLocaleTimeString('en-IN'),
    population: "1.2 Million",
    area: "748 km²",
    emergencyContacts: {
      police: "100",
      ambulance: "102",
      fire: "101"
    }
  };

  const getAQIColor = (value: number) => {
    if (value <= 50) return "bg-green-500";
    if (value <= 100) return "bg-yellow-500";
    if (value <= 150) return "bg-orange-500";
    if (value <= 200) return "bg-red-500";
    if (value <= 300) return "bg-purple-500";
    return "bg-red-700";
  };

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading city information: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Weather Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weather</CardTitle>
          {weatherData.icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
          <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Droplets className="h-4 w-4 mr-1" />
                Humidity
              </span>
              <span>{weatherData.humidity}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <Wind className="h-4 w-4 mr-1" />
                Wind
              </span>
              <span>{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <CloudRain className="h-4 w-4 mr-1" />
                Precipitation
              </span>
              <span>{weatherData.precipitation}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AQI Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
          <Gauge className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{aqiData.value}</div>
            <div className={`px-2 py-1 rounded-full text-xs text-white ${getAQIColor(aqiData.value)}`}>
              {aqiData.level}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{aqiData.description}</p>
          <Progress value={(aqiData.value / 500) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* City Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">City Information</CardTitle>
          <Calendar className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Date:</span> {cityInfo.date}
            </div>
            <div className="text-sm">
              <span className="font-medium">Time:</span> {cityInfo.time}
            </div>
            <div className="text-sm">
              <span className="font-medium">Population:</span> {cityInfo.population}
            </div>
            <div className="text-sm">
              <span className="font-medium">Area:</span> {cityInfo.area}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
          <Phone className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Police:</span>
              <span className="text-red-500">{cityInfo.emergencyContacts.police}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Ambulance:</span>
              <span className="text-red-500">{cityInfo.emergencyContacts.ambulance}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Fire:</span>
              <span className="text-red-500">{cityInfo.emergencyContacts.fire}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 