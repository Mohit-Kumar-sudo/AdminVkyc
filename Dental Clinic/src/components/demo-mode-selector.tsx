import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { UserCog, User, ArrowRight, Info } from "lucide-react";
import { DemoGuide } from "./demo-guide";

interface DemoModeSelectorProps {
  onSelectMode: (mode: 'dentist' | 'patient', patientId?: string) => void;
}

export function DemoModeSelector({ onSelectMode }: DemoModeSelectorProps) {
  const samplePatients = [
    {
      id: "1",
      name: "Sarah Johnson",
      age: 28,
      condition: "Teeth whitening consultation",
      avatar: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "2", 
      name: "Michael Chen",
      age: 34,
      condition: "Orthodontic treatment planning",
      avatar: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkyODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "3",
      name: "Margaret Davis", 
      age: 67,
      condition: "Complete smile makeover",
      avatar: "https://images.unsplash.com/photo-1663250037699-f8a33a5ab655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTMzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            DentalCare Pro Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our dental consultation platform from different perspectives. 
            Choose your role to explore the tailored interface and workflow.
          </p>
        </div>

        {/* Demo Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dentist Mode */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3>Dentist Portal</h3>
                  <Badge variant="secondary" className="mt-1">Professional Interface</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access the full clinical interface with patient management, consultation tools, 
                treatment planning, and before/after visualizations.
              </p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Key Features:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Patient profile management</li>
                  <li>• Photo upload & analysis</li>
                  <li>• Treatment plan creation</li>
                  <li>• Cost estimation</li>
                  <li>• Notes & documentation</li>
                  <li>• Patient communication</li>
                </ul>
              </div>

              <Button 
                onClick={() => onSelectMode('dentist')}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Enter as Dentist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Patient Mode */}
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3>Patient Portal</h3>
                  <Badge variant="secondary" className="mt-1 border-green-200 text-green-700 bg-green-50">Patient View</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Experience the patient-facing interface with consultation results, 
                treatment visualization, and appointment management.
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Demo Patients:</h4>
                <div className="space-y-2">
                  {samplePatients.map((patient) => (
                    <Button
                      key={patient.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 border-green-200 hover:bg-green-50"
                      onClick={() => onSelectMode('patient', patient.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-green-100">
                          <img 
                            src={patient.avatar} 
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">{patient.condition}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Guide */}
        <DemoGuide />

        {/* Info Card */}
        <Card className="bg-white border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <strong>Demo Navigation Tips:</strong> Switch between roles anytime using the user icon in the top navigation. 
                Each role provides a different perspective of the same consultation data, 
                demonstrating how the platform serves both healthcare providers and patients.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}