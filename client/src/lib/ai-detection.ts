import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Define complaint categories and their corresponding keywords
const COMPLAINT_CATEGORIES = {
  INFRASTRUCTURE: {
    keywords: ['pothole', 'road', 'street', 'asphalt', 'concrete', 'damage', 'crack', 'hole', 'broken', 'repair'],
    department: 'Public Works Department',
    departmentDetails: {
      head: 'Mr. Rajesh Kumar',
      contact: '1800-XXX-XXXX',
      email: 'pwd@gnoaida.gov.in',
      workingHours: '9:00 AM - 5:00 PM',
      responseTime: '24 hours'
    },
    deadline: 7,
    priority: 'high',
    description: 'Road infrastructure, street maintenance, and public works'
  },
  SANITATION: {
    keywords: ['garbage', 'trash', 'waste', 'litter', 'dumpster', 'bin', 'dirt', 'clean', 'sweep', 'hygiene'],
    department: 'Sanitation Department',
    departmentDetails: {
      head: 'Mrs. Priya Sharma',
      contact: '1800-XXX-XXXX',
      email: 'sanitation@gnoaida.gov.in',
      workingHours: '6:00 AM - 2:00 PM',
      responseTime: '12 hours'
    },
    deadline: 3,
    priority: 'medium',
    description: 'Waste management, street cleaning, and public hygiene'
  },
  WATER: {
    keywords: ['water', 'leak', 'pipe', 'flood', 'drainage', 'sewage', 'overflow', 'blocked', 'drain', 'waterlogging'],
    department: 'Water Supply Department',
    departmentDetails: {
      head: 'Mr. Amit Singh',
      contact: '1800-XXX-XXXX',
      email: 'water@gnoaida.gov.in',
      workingHours: '8:00 AM - 4:00 PM',
      responseTime: '6 hours'
    },
    deadline: 5,
    priority: 'high',
    description: 'Water supply, drainage, and sewage management'
  },
  ELECTRICITY: {
    keywords: ['electricity', 'power', 'wire', 'cable', 'transformer', 'pole', 'outage', 'spark', 'short circuit', 'fault'],
    department: 'Electricity Department',
    departmentDetails: {
      head: 'Mr. Vikram Patel',
      contact: '1800-XXX-XXXX',
      email: 'power@gnoaida.gov.in',
      workingHours: '24/7',
      responseTime: '2 hours'
    },
    deadline: 4,
    priority: 'high',
    description: 'Power supply, street lighting, and electrical maintenance'
  },
  TRAFFIC: {
    keywords: ['traffic', 'signal', 'light', 'sign', 'road', 'vehicle', 'jam', 'congestion', 'accident', 'parking'],
    department: 'Traffic Department',
    departmentDetails: {
      head: 'Mr. Suresh Verma',
      contact: '1800-XXX-XXXX',
      email: 'traffic@gnoaida.gov.in',
      workingHours: '24/7',
      responseTime: '30 minutes'
    },
    deadline: 5,
    priority: 'medium',
    description: 'Traffic management, road safety, and parking'
  },
  PARKS: {
    keywords: ['park', 'garden', 'tree', 'plant', 'grass', 'playground', 'bench', 'fountain', 'path', 'maintenance'],
    department: 'Parks and Recreation',
    departmentDetails: {
      head: 'Mrs. Meera Gupta',
      contact: '1800-XXX-XXXX',
      email: 'parks@gnoaida.gov.in',
      workingHours: '7:00 AM - 7:00 PM',
      responseTime: '48 hours'
    },
    deadline: 10,
    priority: 'low',
    description: 'Public parks, gardens, and recreational facilities'
  },
  SECURITY: {
    keywords: ['security', 'crime', 'theft', 'vandalism', 'safety', 'police', 'cctv', 'lighting', 'patrol'],
    department: 'Security Department',
    departmentDetails: {
      head: 'Mr. Rakesh Sharma',
      contact: '1800-XXX-XXXX',
      email: 'security@gnoaida.gov.in',
      workingHours: '24/7',
      responseTime: '15 minutes'
    },
    deadline: 2,
    priority: 'high',
    description: 'Public safety, security, and law enforcement'
  },
  EDUCATION: {
    keywords: ['school', 'education', 'classroom', 'building', 'facility', 'playground', 'library', 'computer'],
    department: 'Education Department',
    departmentDetails: {
      head: 'Mrs. Anita Desai',
      contact: '1800-XXX-XXXX',
      email: 'education@gnoaida.gov.in',
      workingHours: '9:00 AM - 5:00 PM',
      responseTime: '72 hours'
    },
    deadline: 14,
    priority: 'medium',
    description: 'Educational facilities and infrastructure'
  },
  HEALTH: {
    keywords: ['hospital', 'clinic', 'medical', 'health', 'ambulance', 'emergency', 'doctor', 'nurse', 'medicine'],
    department: 'Health Department',
    departmentDetails: {
      head: 'Dr. Sunil Kumar',
      contact: '1800-XXX-XXXX',
      email: 'health@gnoaida.gov.in',
      workingHours: '24/7',
      responseTime: '1 hour'
    },
    deadline: 3,
    priority: 'high',
    description: 'Healthcare facilities and medical services'
  }
};

let model: mobilenet.MobileNet | null = null;

// Initialize the model
export async function initializeModel() {
  // Try to load the model with a couple of retries. This is best-effort —
  // if loading fails (no network, large model), callers should fall back to text classification.
  const attempts = 2;
  for (let i = 0; i < attempts; i++) {
    try {
      model = await mobilenet.load();
      console.log('AI model loaded successfully');
      return true;
    } catch (error) {
      console.warn(`AI model load attempt ${i + 1} failed`, error);
      model = null;
      // small delay between attempts
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  console.error('AI model failed to load after retries');
  return false;
}

// Analyze image and detect objects
export async function analyzeImage(imageElement: HTMLImageElement) {
  if (!model) {
    const ok = await initializeModel();
    if (!ok) {
      // model not available
      throw new Error('AI model not available');
    }
  }

  try {
    const predictions = await model!.classify(imageElement);
    return predictions;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

// Determine complaint category based on detected objects
export function determineComplaintCategory(predictions: mobilenet.MobileNetPrediction[]) {
  const detectedObjects = predictions.map(p => p.className.toLowerCase());
  const confidenceThreshold = 0.6; // Minimum confidence threshold
  
  // Find the best matching category
  let bestMatch = {
    category: 'GENERAL',
    confidence: 0,
    details: {
      department: 'General Administration',
      departmentDetails: {
        head: 'Mr. General Manager',
        contact: '1800-XXX-XXXX',
        email: 'general@gnoaida.gov.in',
        workingHours: '9:00 AM - 5:00 PM',
        responseTime: '72 hours'
      },
      deadline: 14,
      priority: 'low',
      description: 'General administrative issues'
    }
  };

  for (const [category, details] of Object.entries(COMPLAINT_CATEGORIES)) {
    const matchCount = details.keywords.filter(keyword => 
      detectedObjects.some(obj => obj.includes(keyword))
    ).length;

    // Calculate confidence based on number of matches and prediction confidence
    const confidence = matchCount / details.keywords.length;
    
    if (confidence > bestMatch.confidence && confidence >= confidenceThreshold) {
      bestMatch = {
        category,
        confidence,
        details
      };
    }
  }

  return bestMatch;
}

// Generate complaint details based on AI analysis
export async function generateComplaintDetails(imageFile: File): Promise<{
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
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    img.onload = async () => {
      try {
        // Try image analysis first. If it fails, we fall back to a conservative GENERAL classification.
        let predictions: any[] | null = null;
        try {
          predictions = await analyzeImage(img);
        } catch (err) {
          console.warn('Image analysis failed', err);
          predictions = null;
        }

        if (predictions && Array.isArray(predictions) && predictions.length > 0) {
          const { category, confidence, details } = determineComplaintCategory(predictions as any);
          const detectedObjects = (predictions as any)
            .slice(0, 3)
            .map((p: any) => `${p.className} (${Math.round((p.probability || p.prob || 0) * 100)}%)`);

          resolve({
            category,
            department: details.department,
            departmentDetails: details.departmentDetails,
            deadline: details.deadline,
            priority: details.priority,
            description: `${details.description}. Detected: ${detectedObjects.join(', ')}`,
            confidence,
            detectedObjects
          });
          return;
        }

        // Fallback: image analysis unavailable or returned no predictions
        resolve({
          category: 'GENERAL',
          department: 'General Administration',
          departmentDetails: {
            head: 'Mr. General Manager',
            contact: '1800-XXX-XXXX',
            email: 'general@gnoaida.gov.in',
            workingHours: '9:00 AM - 5:00 PM',
            responseTime: '72 hours'
          },
          deadline: 14,
          priority: 'low',
          description: 'Image analysis unavailable; please add description for better routing',
          confidence: 0.15,
          detectedObjects: []
        });
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

// Simple text classifier fallback: looks for keywords in a free-text complaint
export function classifyText(text: string) {
  const txt = (text || "").toLowerCase();
  for (const [category, details] of Object.entries(COMPLAINT_CATEGORIES)) {
    for (const kw of details.keywords) {
      if (txt.includes(kw)) {
        return {
          category,
          department: details.department,
          departmentDetails: details.departmentDetails,
          deadline: details.deadline,
          priority: details.priority,
          description: details.description,
          confidence: 0.75,
          detectedObjects: [kw],
        };
      }
    }
  }

  // default
  return {
    category: 'GENERAL',
    department: 'General Administration',
    departmentDetails: {
      head: 'Mr. General Manager',
      contact: '1800-XXX-XXXX',
      email: 'general@gnoaida.gov.in',
      workingHours: '9:00 AM - 5:00 PM',
      responseTime: '72 hours'
    },
    deadline: 14,
    priority: 'low',
    description: 'General administrative issues',
    confidence: 0.2,
    detectedObjects: [] as string[],
  };
}