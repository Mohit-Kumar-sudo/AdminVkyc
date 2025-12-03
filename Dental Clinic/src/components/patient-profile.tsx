import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Phone, Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PatientProfileProps {
  patient: {
    id: string;
    name: string;
    age: number;
    email: string;
    phone: string;
    address: string;
    lastVisit: string;
    nextAppointment: string;
    treatmentHistory: string[];
    avatar: string;
  };
}

export function PatientProfile({ patient }: PatientProfileProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="w-16 h-16 border-2 border-blue-200">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl">{patient.name}</h2>
            <p className="text-muted-foreground">Age {patient.age}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-blue-500" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{patient.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Last visit: {patient.lastVisit}</span>
          </div>
        </div>
        
        <div>
          <h4 className="mb-2">Treatment History</h4>
          <div className="flex flex-wrap gap-2">
            {patient.treatmentHistory.map((treatment, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                {treatment}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Next Appointment: {patient.nextAppointment}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}