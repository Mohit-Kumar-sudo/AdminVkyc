import { Button } from "./ui/button";
import { Save, Share2, FileText, Send, Download, Calendar } from "lucide-react";
import { useState } from "react";

export function ActionButtons() {
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleSaveConsultation = () => {
    setSaving(true);
    // Simulate save operation
    setTimeout(() => {
      setSaving(false);
      // In a real app, show success toast
    }, 1500);
  };

  const handleShareWithPatient = () => {
    setSharing(true);
    // Simulate share operation
    setTimeout(() => {
      setSharing(false);
      // In a real app, show success toast
    }, 1000);
  };

  const handleGenerateTreatmentPlan = () => {
    // In a real app, this would generate a PDF or open a new view
    console.log("Generating treatment plan...");
  };

  const handleScheduleAppointment = () => {
    // In a real app, this would open a calendar/scheduling interface
    console.log("Opening appointment scheduler...");
  };

  const handleDownloadReport = () => {
    // In a real app, this would download a PDF report
    console.log("Downloading consultation report...");
  };

  return (
    <div className="bg-white border-t border-blue-100 p-6 sticky bottom-0 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Primary Actions */}
          <Button
            onClick={handleSaveConsultation}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Consultation"}
          </Button>

          <Button
            onClick={handleShareWithPatient}
            disabled={sharing}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {sharing ? "Sharing..." : "Share with Patient"}
          </Button>

          <Button
            onClick={handleGenerateTreatmentPlan}
            variant="outline"
            className="border-green-200 text-green-600 hover:bg-green-50 flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Treatment Plan
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button
              onClick={handleScheduleAppointment}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Schedule</span>
            </Button>

            <Button
              onClick={handleDownloadReport}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Send className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Email</span>
            </Button>
          </div>
        </div>

        {/* Quick Actions Info */}
        <div className="flex justify-center mt-4">
          <div className="text-xs text-muted-foreground text-center max-w-md">
            <p>All changes are automatically saved. Use "Share with Patient" to send consultation results via secure email.</p>
          </div>
        </div>
      </div>
    </div>
  );
}