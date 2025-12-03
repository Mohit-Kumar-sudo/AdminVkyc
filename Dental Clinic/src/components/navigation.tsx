import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, Calendar, FileText, Image, Settings, UserCog, User, RotateCcw } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'dentist' | 'patient';
  patientId?: string;
  onSwitchRole: () => void;
}

export function Navigation({ activeTab, onTabChange, userRole, patientId, onSwitchRole }: NavigationProps) {
  const patientTabs = [
    { value: "dashboard", label: "Dashboard", icon: User },
    { value: "treatment", label: "My Treatment", icon: FileText },
    { value: "appointments", label: "Appointments", icon: Calendar },
    { value: "gallery", label: "My Photos", icon: Image }
  ];

  const dentistTabs = [
    { value: "patients", label: "Patients", icon: Users },
    { value: "consultations", label: "Consultations", icon: Calendar },
    { value: "treatment", label: "Treatment Plans", icon: FileText },
    { value: "gallery", label: "Gallery", icon: Image },
    { value: "settings", label: "Settings", icon: Settings }
  ];

  const tabs = userRole === 'patient' ? patientTabs : dentistTabs;

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                DentalCare Pro
              </h1>
              {userRole === 'patient' && patientId && (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                  Patient View
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
              <TabsList className={`grid w-full ${userRole === 'patient' ? 'grid-cols-4' : 'grid-cols-5'} bg-blue-50 border border-blue-100`}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <Button 
              variant="outline" 
              size="sm"
              onClick={onSwitchRole}
              className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {userRole === 'dentist' ? <User className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
              <span className="hidden sm:inline">
                Switch to {userRole === 'dentist' ? 'Patient' : 'Dentist'} View
              </span>
              <RotateCcw className="w-3 h-3 sm:hidden" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}