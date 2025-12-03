import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Calendar, Clock, Phone, MapPin, Smile, Camera, FileText, CreditCard, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PatientDashboardProps {
  patientId: string;
}

export function PatientDashboard({ patientId }: PatientDashboardProps) {
  // Mock patient data based on ID
  const getPatientData = (id: string) => {
    const patients = {
      "1": {
        id: "1",
        name: "Sarah Johnson",
        age: 28,
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, Anytown, ST 12345",
        avatar: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        treatmentType: "Cosmetic Enhancement",
        progress: 65,
        nextAppointment: "September 22, 2025 at 2:00 PM",
        dentist: "Dr. Emily Rodriguez",
        beforePhoto: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        afterPhoto: "https://images.unsplash.com/photo-1655807946138-811bb2340d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBiZWZvcmUlMjBhZnRlciUyMHNtaWxlfGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      "2": {
        id: "2",
        name: "Michael Chen", 
        age: 34,
        email: "michael.chen@email.com",
        phone: "+1 (555) 987-6543",
        address: "456 Oak Ave, Springfield, ST 67890",
        avatar: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkyODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        treatmentType: "Orthodontic Alignment",
        progress: 35,
        nextAppointment: "September 18, 2025 at 10:30 AM", 
        dentist: "Dr. James Wilson",
        beforePhoto: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkyODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        afterPhoto: "https://images.unsplash.com/photo-1655807946138-811bb2340d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBiZWZvcmUlMjBhZnRlciUyMHNtaWxlfGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      },
      "3": {
        id: "3", 
        name: "Margaret Davis",
        age: 67,
        email: "margaret.davis@email.com",
        phone: "+1 (555) 246-8135",
        address: "789 Pine St, Riverside, ST 13579",
        avatar: "https://images.unsplash.com/photo-1663250037699-f8a33a5ab655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTMzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        treatmentType: "Complete Smile Makeover",
        progress: 80,
        nextAppointment: "September 20, 2025 at 3:30 PM",
        dentist: "Dr. Sarah Thompson", 
        beforePhoto: "https://images.unsplash.com/photo-1663250037699-f8a33a5ab655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwd29tYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTMzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        afterPhoto: "https://images.unsplash.com/photo-1655807946138-811bb2340d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBiZWZvcmUlMjBhZnRlciUyMHNtaWxlfGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      }
    };
    return patients[id as keyof typeof patients] || patients["1"];
  };

  const patient = getPatientData(patientId);

  const upcomingTasks = [
    { task: "Take pre-treatment photos", date: "Today", priority: "high" },
    { task: "Review treatment plan", date: "Tomorrow", priority: "medium" },
    { task: "Schedule follow-up", date: "Sep 25", priority: "low" }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-white text-blue-600">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {patient.name.split(' ')[0]}!</h1>
            <p className="text-blue-100">Your smile transformation journey is {patient.progress}% complete</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treatment Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Treatment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-blue-500" />
                Current Treatment: {patient.treatmentType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Treatment Progress</span>
                  <span>{patient.progress}%</span>
                </div>
                <Progress value={patient.progress} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Next: {patient.nextAppointment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>Dr: {patient.dentist}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Before/After Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Your Smile Transformation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Before Treatment</h4>
                  <div className="relative">
                    <ImageWithFallback
                      src={patient.beforePhoto}
                      alt="Before treatment"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Projected Result</h4>
                  <div className="relative">
                    <ImageWithFallback
                      src={patient.afterPhoto}
                      alt="After treatment"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                    />
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                      Enhanced
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white text-center">
                <h3 className="font-semibold mb-1">✨ Your Perfect Smile Journey ✨</h3>
                <p className="text-blue-100 text-sm">
                  See your transformation coming to life with each appointment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Treatment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: "Initial Consultation", status: "completed", date: "Aug 15, 2025" },
                  { step: "Treatment Planning", status: "completed", date: "Aug 22, 2025" },
                  { step: "First Treatment Session", status: "in-progress", date: "Sep 15, 2025" },
                  { step: "Progress Check", status: "upcoming", date: "Sep 22, 2025" },
                  { step: "Final Session", status: "planned", date: "Oct 15, 2025" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' :
                      item.status === 'upcoming' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.step}</div>
                      <div className="text-xs text-muted-foreground">{item.date}</div>
                    </div>
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : 'outline'}
                      className={
                        item.status === 'completed' ? 'bg-green-100 text-green-700' :
                        item.status === 'in-progress' ? 'border-blue-200 text-blue-700' :
                        'text-muted-foreground'
                      }
                    >
                      {item.status === 'completed' ? 'Done' :
                       item.status === 'in-progress' ? 'Current' :
                       item.status === 'upcoming' ? 'Next' : 'Planned'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                <Phone className="w-4 h-4 mr-2" />
                Call Clinic
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Treatment Plan
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.task}</div>
                    <div className="text-xs text-muted-foreground">{task.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Total Treatment</span>
                  <span className="font-medium">$1,120</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Paid</span>
                  <span className="text-green-600">$728</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Remaining</span>
                  <span>$392</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Make Payment
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+1 (555) 123-CARE</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>123 Dental Plaza, Suite 100</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Mon-Fri: 8AM-6PM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}