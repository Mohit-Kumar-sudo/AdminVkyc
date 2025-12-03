import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, User, UserCog, Eye, Upload, FileText, Calendar } from "lucide-react";

export function DemoGuide() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Demo Navigation Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dentist Flow */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium">Dentist Workflow</h4>
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              Professional
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span><strong>Patients Tab:</strong> Browse patient list and select a patient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span><strong>Consultations:</strong> Complete consultation workflow with photo upload</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span><strong>Treatment Plans:</strong> Create and manage treatment protocols</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span><strong>Gallery:</strong> View before/after photo collections</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
        </div>

        {/* Patient Flow */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" />
            <h4 className="font-medium">Patient Experience</h4>
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              Personal
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span><strong>Dashboard:</strong> Personal treatment progress and overview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span><strong>My Treatment:</strong> Detailed treatment plan and timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span><strong>Appointments:</strong> Schedule and manage appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span><strong>My Photos:</strong> Personal before/after gallery</span>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium mb-2 text-yellow-800">Try These Key Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-700">
            <div className="flex items-center gap-2">
              <Upload className="w-3 h-3" />
              <span>Upload photos for comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              <span>Review treatment plans</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Track appointment schedules</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              <span>Switch between user roles</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}