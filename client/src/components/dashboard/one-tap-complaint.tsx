import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Mic, Send, MapPin, FileText, AlertCircle, Clock, User, Building2, MapPin as MapPinIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { generateComplaintDetails, classifyText, initializeModel } from "@/lib/ai-detection";
// Use data layer directly to persist complaints
import { addReport, addKarma } from "@/lib/data";

// Google Maps type definitions
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        Circle: new (options: any) => any;
        Animation: {
          DROP: any;
        };
      };
    };
    initMap: () => void;
  }
}

// Knowledge Park, Greater Noida coordinates
const KNOWLEDGE_PARK_COORDS = {
  lat: 28.4744,
  lng: 77.5040
};

interface ComplaintStatus {
  id: string;
  title: string;
  type: string;
  location: string;
  assignedTo: string;
  department: string;
  startTime: Date;
  status: 'pending' | 'in-progress' | 'resolved';
}

interface ComplaintDetails {
  category: string;
  department: string;
  departmentDetails: {
    head: string;
    contact: string;
    email: string;
    workingHours: string;
    responseTime: string;
  };
  deadline: number;
  priority: string;
  description: string;
  confidence: number;
  detectedObjects: string[];
}

export function OneTapComplaint() {
  const [isRecording, setIsRecording] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showBriefComplaint, setShowBriefComplaint] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentComplaint, setCurrentComplaint] = useState<ComplaintStatus | null>(null);
  const MAX_DEADLINE_HOURS = 48;
  const MAX_DEADLINE_DAYS = MAX_DEADLINE_HOURS / 24;
  const MAX_SECONDS = MAX_DEADLINE_HOURS * 60 * 60;
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS); // max 48 hours in seconds
  const [briefComplaint, setBriefComplaint] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    contactNumber: "",
  });
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState<ComplaintDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Google Maps script
  const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Try to get user's geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPosition(coords);
          setSelectedLocation(coords);
        },
        () => {
          // ignore, keep defaults
        },
        { timeout: 5000 }
      );
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Preload AI model in background (best-effort). If it fails, fallbacks will be used.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await initializeModel();
        if (!ok && mounted) {
          toast({ title: 'AI model unavailable', description: 'Image analysis may fallback to text-based routing', variant: 'default' });
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showMap) {
      // Initialize map when dialog opens
      const initMap = () => {
        const center = selectedLocation ?? userPosition ?? KNOWLEDGE_PARK_COORDS;
        const map = new window.google.maps.Map(document.getElementById("map") as HTMLElement, {
          center,
          zoom: 15,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // marker for selected location
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          title: "Selected location",
          animation: window.google.maps.Animation.DROP,
        });

        // click to change location
        map.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          setSelectedLocation({ lat, lng });
        });

        // show circle for context
        new window.google.maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.6,
          strokeWeight: 1,
          fillColor: "#FF0000",
          fillOpacity: 0.08,
          map,
          center,
          radius: 200,
        });
      };

      // Wait for Google Maps to load
      if (window.google && window.google.maps) {
        initMap();
      } else {
        window.initMap = initMap;
      }
    }
  }, [showMap]);

  // Reverse geocode selectedLocation to human readable address
  useEffect(() => {
    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
        if (key) {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === "OK" && data.results && data.results.length > 0) {
            setSelectedAddress(data.results[0].formatted_address);
            return;
          }
        }

        // Fallback to Nominatim (OpenStreetMap)
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const nomRes = await fetch(nomUrl, { headers: { "Accept": "application/json" } });
        const nomData = await nomRes.json();
        if (nomData && nomData.display_name) {
          setSelectedAddress(nomData.display_name);
          return;
        }
        setSelectedAddress(null);
      } catch (e) {
        console.error("Reverse geocode failed", e);
        setSelectedAddress(null);
      }
    };

    if (selectedLocation) {
      reverseGeocode(selectedLocation.lat, selectedLocation.lng);
    } else if (userPosition) {
      reverseGeocode(userPosition.lat, userPosition.lng);
    }
  }, [selectedLocation, userPosition]);

  // compute compass direction from user's position to the selected location
  const computeDirection = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const dLon = toRad(to.lng - from.lng);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = toDeg(Math.atan2(y, x));
    brng = (brng + 360) % 360;

    // convert bearing to cardinal direction
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round((brng % 360) / 22.5) % 16;
    return directions[index];
  };

  useEffect(() => {
    if (currentComplaint) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentComplaint]);

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showComplaintStatus = (complaintData: Partial<ComplaintStatus>) => {
    const newComplaint: ComplaintStatus = {
      id: Math.random().toString(36).substr(2, 9),
      title: complaintData.title || "Quick Complaint",
      type: complaintData.type || "General",
      location: "Knowledge Park, Greater Noida",
      assignedTo: "Rajesh Kumar",
      department: "Public Works Department",
      startTime: new Date(),
      status: 'pending',
      ...complaintData
    };
    setCurrentComplaint(newComplaint);
    setShowStatusDialog(true);
    // ensure the status dialog shows time left up to the maximum
    setTimeLeft(MAX_SECONDS);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setSelectedPhotos(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);

      // Analyze image
      setIsAnalyzing(true);
      const details = await generateComplaintDetails(file);
      setComplaintDetails(details);
      setShowDetails(true);

      if (details.confidence && details.confidence >= 0.45) {
        toast({
          title: "AI Analysis Complete",
          description: `Detected as ${details.category} issue with ${Math.round(details.confidence * 100)}% confidence`,
        });
      } else {
        toast({
          title: "AI Analysis (fallback)",
          description: `Image analysis unavailable or low confidence; using fallback routing (confidence ${Math.round((details.confidence || 0) * 100)}%)`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComplaint = () => {
    if (!complaintText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your complaint details",
        variant: "destructive",
      });
      return;
    }
    
    showComplaintStatus({
      title: complaintText,
      type: "Quick Complaint"
    });
    
    setComplaintText("");
    setSelectedPhotos([]);
  };

  const handleSubmitBriefComplaint = () => {
    if (!briefComplaint.title || !briefComplaint.description || !briefComplaint.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    showComplaintStatus({
      title: briefComplaint.title,
      type: briefComplaint.category,
    });

    setBriefComplaint({
      title: "",
      description: "",
      category: "",
      priority: "",
      contactNumber: "",
    });
    setShowBriefComplaint(false);
  };

  const handleSubmit = () => {
    if (!complaintText && selectedPhotos.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a complaint or upload an image",
        variant: "destructive",
      });
      return;
    }

    // Persist complaint to localStorage via data layer and run AI classification
    try {
      const lat = selectedLocation?.lat ?? KNOWLEDGE_PARK_COORDS.lat;
      const lng = selectedLocation?.lng ?? KNOWLEDGE_PARK_COORDS.lng;

      let direction: string | undefined = undefined;
      if (userPosition) {
        direction = computeDirection(userPosition, { lat, lng });
      }

      // Determine department and deadline
      let deptInfo: any = null;
      if (complaintDetails) {
        deptInfo = {
          department: complaintDetails.department,
          departmentDetails: complaintDetails.departmentDetails,
          deadlineDays: complaintDetails.deadline,
          priority: complaintDetails.priority,
        };
      } else if (complaintText) {
        // use simple text classifier fallback
        try {
          deptInfo = classifyText(complaintText);
          deptInfo = {
            department: deptInfo.department,
            departmentDetails: deptInfo.departmentDetails,
            deadlineDays: deptInfo.deadline,
            priority: deptInfo.priority,
          };
        } catch (e) {
          deptInfo = null;
        }
      }

      const assignedAt = new Date().toISOString();
  // clamp deadline to a maximum of MAX_DEADLINE_DAYS (48 hours)
  const rawDeadlineDays = typeof deptInfo?.deadlineDays === 'number' ? deptInfo.deadlineDays : (deptInfo?.deadlineDays ? Number(deptInfo.deadlineDays) : undefined);
  const deadlineDays = Math.min(rawDeadlineDays ?? 7, MAX_DEADLINE_DAYS);
  const dueBy = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();

      const report = addReport({
        title: complaintText || "Image complaint",
        description: complaintDetails?.description || "",
        lat,
        lng,
        direction,
        address: selectedAddress ?? undefined,
        department: deptInfo?.department,
        departmentDetails: deptInfo?.departmentDetails,
        deadlineDays,
        assignedAt,
        dueBy,
        status: "in-progress",
      });

      // Award small karma for reporting
      try {
        addKarma(10);
      } catch (e) {}

      // Show toast with department and deadline
      toast({
        title: "Complaint Submitted",
        description: `Complaint ${report.id} tagged to ${report.department || "General Administration"} — due in ${deadlineDays} days`,
      });

      // Set current complaint dialog and timer
      const start = new Date(assignedAt);
      const end = new Date(dueBy);
  // ensure secsLeft does not exceed MAX_SECONDS
  const secsLeft = Math.max(0, Math.min(MAX_SECONDS, Math.round((end.getTime() - Date.now()) / 1000)));
      setCurrentComplaint({
        id: report.id,
        title: report.title,
        type: complaintDetails?.category || "Reported",
        location: selectedAddress ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        assignedTo: report.departmentDetails?.head ?? "TBD",
        department: report.department || "General Administration",
        startTime: start,
        status: report.status as any,
      });
      setTimeLeft(secsLeft);
      setShowStatusDialog(true);
    } catch (e) {
      console.error(e);
      toast({
        title: "Submission failed",
        description: "Could not save complaint locally",
        variant: "destructive",
      });
    }

    // Reset form
    setComplaintText("");
    setSelectedPhotos([]);
    setComplaintDetails(null);
    setShowDetails(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <span>One-Tap AI Complaint</span>
            <span className="ml-2 text-xs bg-gov-blue/10 text-gov-blue px-2 py-1 rounded">AI-Powered</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Describe your issue (e.g., 'There's a large pothole on MG Road')"
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-md">
                <label className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    id="photo-upload"
                  />
                  <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Camera className="h-8 w-8 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Click to upload photo</p>
                        <p className="text-xs text-gray-500">or drag and drop</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing image...</span>
                </div>
              )}

              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 w-full">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full relative",
                  isRecording && "border-red-500"
                )}
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className="h-4 w-4" />
                {isRecording && (
                  <span className="absolute h-2 w-2 rounded-full bg-red-500 top-1 right-1"></span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="font-medium text-green-600">Location detected:</span>
            <div className="flex-1 min-w-0">
              <span className="truncate block">
                {selectedAddress
                  ? selectedAddress
                  : selectedLocation
                  ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                  : userPosition
                  ? `${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}`
                  : "Knowledge Park, Greater Noida"}
              </span>
            </div>

            <Dialog open={showMap} onOpenChange={setShowMap}>
              <DialogTrigger asChild>
                <button className="ml-0 md:ml-3 text-xs text-blue-600 underline flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>Change</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Live Location</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div id="map" className="w-full h-[400px] rounded-lg" />
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Location Details:</p>
                    <ul className="space-y-1">
                      <li>• Click on the map to move the marker and change the complaint location</li>
                      <li>• Selected address will appear on the main card</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </CardFooter>
      </Card>

      {/* Brief Complaint Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <span>Detailed Complaint</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBriefComplaint(true)}
            >
              File New Complaint
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Brief Complaint Dialog */}
      <Dialog open={showBriefComplaint} onOpenChange={setShowBriefComplaint}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>File a Detailed Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                placeholder="Enter a brief title for your complaint"
                value={briefComplaint.title}
                onChange={(e) => setBriefComplaint({ ...briefComplaint, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={briefComplaint.category}
                onValueChange={(value) => setBriefComplaint({ ...briefComplaint, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={briefComplaint.priority}
                onValueChange={(value) => setBriefComplaint({ ...briefComplaint, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint"
                value={briefComplaint.description}
                onChange={(e) => setBriefComplaint({ ...briefComplaint, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="Enter your contact number"
                value={briefComplaint.contactNumber}
                onChange={(e) => setBriefComplaint({ ...briefComplaint, contactNumber: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Fields marked with * are required</span>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowBriefComplaint(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitBriefComplaint}>
                Submit Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Analysis Results</DialogTitle>
            <DialogDescription>
              Based on the image analysis, here are the details of your complaint:
            </DialogDescription>
          </DialogHeader>
          {complaintDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Category</h4>
                  <p className="text-sm text-muted-foreground">{complaintDetails.category}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Priority</h4>
                  <p className="text-sm text-muted-foreground capitalize">{complaintDetails.priority}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Department Information</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Department:</span> {complaintDetails.department}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Head:</span> {complaintDetails.departmentDetails.head}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Contact:</span> {complaintDetails.departmentDetails.contact}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {complaintDetails.departmentDetails.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Working Hours:</span> {complaintDetails.departmentDetails.workingHours}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Response Time:</span> {complaintDetails.departmentDetails.responseTime}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Expected Resolution</h4>
                <p className="text-sm text-muted-foreground">
                  This issue will be resolved within {complaintDetails.deadline} days
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{complaintDetails.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Detected Objects</h4>
                <div className="flex flex-wrap gap-2">
                  {complaintDetails.detectedObjects.map((obj, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Confidence Score</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={complaintDetails.confidence * 100} className="h-2" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(complaintDetails.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      

      {/* Complaint Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Complaint Status</DialogTitle>
          </DialogHeader>
          {currentComplaint && (
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{currentComplaint.title}</h3>
                    <p className="text-sm text-muted-foreground">Complaint ID: {currentComplaint.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatTimeLeft(timeLeft)}</span>
                  </div>
                </div>

                <Progress value={(MAX_SECONDS - timeLeft) / MAX_SECONDS * 100} className="h-2" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Type</span>
                    </div>
                    <p className="text-sm">{currentComplaint.type}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-sm">{currentComplaint.location}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assigned To</span>
                    </div>
                    <p className="text-sm">{currentComplaint.assignedTo}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Department</span>
                    </div>
                    <p className="text-sm">{currentComplaint.department}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      currentComplaint.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      currentComplaint.status === 'in-progress' && "bg-blue-100 text-blue-800",
                      currentComplaint.status === 'resolved' && "bg-green-100 text-green-800"
                    )}>
                      {currentComplaint.status.charAt(0).toUpperCase() + currentComplaint.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
