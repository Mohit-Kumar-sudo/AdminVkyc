import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Search, Plus, Calendar, Phone, Mail, MapPin, Clock, Eye } from "lucide-react";
import { useState } from "react";

interface PatientsListProps {
  onSelectPatient: (patientId: string) => void;
}

export function PatientsList({ onSelectPatient }: PatientsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    {
      id: "1",
      name: "Sarah Johnson",
      age: 28,
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      lastVisit: "September 10, 2025",
      nextAppointment: "September 22, 2025",
      treatmentType: "Cosmetic Enhancement",
      status: "Active Treatment",
      priority: "medium",
      avatar: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "2",
      name: "Michael Chen",
      age: 34,
      email: "michael.chen@email.com", 
      phone: "+1 (555) 987-6543",
      lastVisit: "September 8, 2025",
      nextAppointment: "September 18, 2025",
      treatmentType: "Orthodontic Treatment",
      status: "In Progress",
      priority: "high",
      avatar: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkyODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "3", 
      name: "Margaret Davis",
      age: 67,
      email: "margaret.davis@email.com",
      phone: "+1 (555) 246-8135",
      lastVisit: "September 12, 2025", 
      nextAppointment: "September 20, 2025",
      treatmentType: "Complete Smile Makeover",
      status: "Final Phase",
      priority: "low",
      avatar: "https://images.unsplash.com/photo-1663250037699-f8a33a5ab655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTMzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "4",
      name: "David Rodriguez", 
      age: 42,
      email: "david.rodriguez@email.com",
      phone: "+1 (555) 369-2580",
      lastVisit: "September 5, 2025",
      nextAppointment: "September 25, 2025", 
      treatmentType: "Routine Maintenance",
      status: "Scheduled",
      priority: "low",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXZpZCUyMHJvZHJpZ3VleiUyMG1hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1Nzk1NTMzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: "5",
      name: "Lisa Thompson",
      age: 35,
      email: "lisa.thompson@email.com",
      phone: "+1 (555) 147-9632",
      lastVisit: "August 28, 2025",
      nextAppointment: "September 30, 2025",
      treatmentType: "Dental Implants",
      status: "Consultation",
      priority: "medium",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b72d1e1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXNhJTIwdGhvbXBzb24lMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1Nzk1NTMzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active Treatment":
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Final Phase":
        return "bg-green-100 text-green-700 border-green-200";
      case "Consultation":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patient Management</h1>
          <p className="text-muted-foreground">Manage your patients and their treatment plans</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, treatment, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-semibold text-blue-600">{patients.length}</div>
            <div className="text-xs text-blue-600">Total Patients</div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityColor(patient.priority)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">Age {patient.age}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.phone}</span>
                </div>
              </div>

              <div className="p-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">{patient.treatmentType}</div>
                <div className="text-xs text-muted-foreground">Current treatment</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Last visit</div>
                  <div className="font-medium">{patient.lastVisit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Next appointment</div>
                  <div className="font-medium">{patient.nextAppointment}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-muted-foreground">Active Treatments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">2</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}