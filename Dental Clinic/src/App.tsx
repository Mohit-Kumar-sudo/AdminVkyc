import { useState } from "react";
import { Navigation } from "./components/navigation";
import { PatientProfile } from "./components/patient-profile";
import { PhotoUpload } from "./components/photo-upload";
import { BeforeAfterComparison } from "./components/before-after-comparison";
import { DoctorNotes } from "./components/doctor-notes";
import { TreatmentPlan } from "./components/treatment-plan";
import { CostEstimate } from "./components/cost-estimate";
import { ActionButtons } from "./components/action-buttons";
import { DemoModeSelector } from "./components/demo-mode-selector";
import { PatientDashboard } from "./components/patient-dashboard";
import { PatientsList } from "./components/patients-list";

type UserRole = 'dentist' | 'patient';
type AppMode = 'demo-selector' | 'app';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>("demo-selector");
  const [userRole, setUserRole] = useState<UserRole>("dentist");
  const [currentPatientId, setCurrentPatientId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploadedPhotos, setUploadedPhotos] = useState<{ before: string; after: string } | undefined>();

  // Mock patient data
  const getPatientData = (id: string) => {
    const patients = {
      "1": {
        id: "1",
        name: "Sarah Johnson",
        age: 28,
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, Anytown, ST 12345",
        lastVisit: "August 15, 2025",
        nextAppointment: "September 22, 2025 at 2:00 PM",
        treatmentHistory: ["Routine Cleaning", "Dental Exam", "X-rays"],
        avatar: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      "2": {
        id: "2",
        name: "Michael Chen",
        age: 34,
        email: "michael.chen@email.com",
        phone: "+1 (555) 987-6543",
        address: "456 Oak Ave, Springfield, ST 67890",
        lastVisit: "September 8, 2025",
        nextAppointment: "September 18, 2025 at 10:30 AM",
        treatmentHistory: ["Orthodontic Consultation", "X-rays", "Aligner Fitting"],
        avatar: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkyODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      "3": {
        id: "3",
        name: "Margaret Davis",
        age: 67,
        email: "margaret.davis@email.com",
        phone: "+1 (555) 246-8135",
        address: "789 Pine St, Riverside, ST 13579",
        lastVisit: "September 12, 2025",
        nextAppointment: "September 20, 2025 at 3:30 PM",
        treatmentHistory: ["Full Mouth Reconstruction", "Crown Placement", "Veneers"],
        avatar: "https://images.unsplash.com/photo-1663250037699-f8a33a5ab655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTMzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      }
    };
    return patients[id as keyof typeof patients] || patients["1"];
  };

  const handleSelectMode = (mode: UserRole, patientId?: string) => {
    setUserRole(mode);
    if (mode === 'patient' && patientId) {
      setCurrentPatientId(patientId);
      setActiveTab("dashboard");
    } else {
      setActiveTab("patients");
    }
    setAppMode("app");
  };

  const handleSwitchRole = () => {
    setAppMode("demo-selector");
  };

  const handleSelectPatient = (patientId: string) => {
    setCurrentPatientId(patientId);
    setActiveTab("consultations");
  };

  const handlePhotosUploaded = (photos: { before: string; after: string }) => {
    setUploadedPhotos(photos);
  };

  const renderDentistContent = () => {
    const currentPatient = getPatientData(currentPatientId);
    
    switch (activeTab) {
      case "patients":
        return <PatientsList onSelectPatient={handleSelectPatient} />;
      
      case "consultations":
        return (
          <div className="container mx-auto px-4 py-6 space-y-8 pb-32">
            {/* Patient Profile */}
            <PatientProfile patient={currentPatient} />
            
            {/* Photo Upload */}
            <PhotoUpload onPhotosUploaded={handlePhotosUploaded} />
            
            {/* Before/After Comparison */}
            <BeforeAfterComparison photos={uploadedPhotos} />
            
            {/* Two Column Layout for Notes and Plans */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                <DoctorNotes />
                <CostEstimate />
              </div>
              <div>
                <TreatmentPlan />
              </div>
            </div>
          </div>
        );
      
      case "treatment":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">Treatment Plan Library</h2>
              <p className="text-muted-foreground">Treatment plan templates and protocols would be displayed here</p>
            </div>
          </div>
        );
      
      case "gallery":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">Patient Photo Gallery</h2>
              <p className="text-muted-foreground">Before/after photo collections would be displayed here</p>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">Practice Settings</h2>
              <p className="text-muted-foreground">Clinic configuration and preferences would be displayed here</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderPatientContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PatientDashboard patientId={currentPatientId} />;
      
      case "treatment":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">My Treatment Plan</h2>
              <p className="text-muted-foreground">Detailed treatment plan and progress would be displayed here</p>
            </div>
          </div>
        );
      
      case "appointments":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">My Appointments</h2>
              <p className="text-muted-foreground">Appointment scheduling and history would be displayed here</p>
            </div>
          </div>
        );
      
      case "gallery":
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h2 className="text-xl mb-2">My Treatment Photos</h2>
              <p className="text-muted-foreground">Personal before/after photos would be displayed here</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (appMode === "demo-selector") {
    return <DemoModeSelector onSelectMode={handleSelectMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userRole={userRole}
        patientId={userRole === 'patient' ? currentPatientId : undefined}
        onSwitchRole={handleSwitchRole}
      />
      
      {/* Main Content */}
      <main className="min-h-screen">
        {userRole === 'dentist' ? renderDentistContent() : renderPatientContent()}
      </main>
      
      {/* Action Buttons - Only show on dentist consultations tab */}
      {userRole === 'dentist' && activeTab === "consultations" && <ActionButtons />}
    </div>
  );
}