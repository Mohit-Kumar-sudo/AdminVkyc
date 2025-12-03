import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FileText, Save, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export function DoctorNotes() {
  const [notes, setNotes] = useState(`Patient presents with mild dental staining and slight misalignment of front teeth. 

Recommended treatment plan:
1. Professional teeth whitening (2-3 sessions)
2. Minor orthodontic correction with clear aligners
3. Regular cleaning and maintenance schedule

Patient is motivated and has good oral hygiene habits. Expected treatment duration: 6-8 months with excellent prognosis for achieving desired aesthetic results.

Follow-up scheduled for next week to discuss treatment options and timeline.`);

  const [lastSaved, setLastSaved] = useState("2 minutes ago");

  const handleSave = () => {
    setLastSaved("Just now");
    // In a real app, this would save to a database
  };

  return (
    <Card className="bg-white border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Doctor's Notes & Assessment
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last saved: {lastSaved}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Assessment Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Assessment</label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
              <AlertCircle className="w-3 h-3 mr-1" />
              Mild Staining
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              Minor Misalignment
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              Good Oral Hygiene
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
              Motivated Patient
            </Badge>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Detailed Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px] border-blue-100 focus:border-blue-300"
            placeholder="Enter detailed assessment notes, treatment observations, and recommendations..."
          />
        </div>

        {/* Priority Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Low Priority</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Routine maintenance</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">Medium Priority</span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">Cosmetic improvement</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-800">High Priority</span>
            </div>
            <p className="text-xs text-red-600 mt-1">Immediate attention</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}