import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CheckCircle, Clock, Calendar, DollarSign } from "lucide-react";

interface TreatmentStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  cost: number;
  status: 'pending' | 'in-progress' | 'completed';
  date?: string;
}

export function TreatmentPlan() {
  const treatmentSteps: TreatmentStep[] = [
    {
      id: '1',
      title: 'Initial Consultation & X-rays',
      description: 'Comprehensive examination and diagnostic imaging',
      duration: '1 hour',
      cost: 150,
      status: 'completed',
      date: 'Sept 10, 2025'
    },
    {
      id: '2',
      title: 'Professional Teeth Cleaning',
      description: 'Deep cleaning and plaque removal preparation',
      duration: '45 minutes',
      cost: 120,
      status: 'in-progress',
      date: 'Sept 18, 2025'
    },
    {
      id: '3',
      title: 'Teeth Whitening (Session 1)',
      description: 'First whitening treatment session',
      duration: '1.5 hours',
      cost: 300,
      status: 'pending',
      date: 'Sept 25, 2025'
    },
    {
      id: '4',
      title: 'Clear Aligner Fitting',
      description: 'Custom aligner measurement and fitting',
      duration: '30 minutes',
      cost: 200,
      status: 'pending',
      date: 'Oct 2, 2025'
    },
    {
      id: '5',
      title: 'Teeth Whitening (Session 2)',
      description: 'Second whitening treatment for optimal results',
      duration: '1.5 hours',
      cost: 250,
      status: 'pending',
      date: 'Oct 9, 2025'
    },
    {
      id: '6',
      title: 'Final Assessment & Photos',
      description: 'Treatment completion evaluation and documentation',
      duration: '30 minutes',
      cost: 100,
      status: 'pending',
      date: 'Dec 15, 2025'
    }
  ];

  const totalCost = treatmentSteps.reduce((sum, step) => sum + step.cost, 0);
  const completedSteps = treatmentSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / treatmentSteps.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Pending</Badge>;
    }
  };

  return (
    <Card className="bg-white border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Treatment Plan & Timeline
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {completedSteps} of {treatmentSteps.length} steps completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Steps */}
        <div className="space-y-4">
          {treatmentSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                step.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : step.status === 'in-progress'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${step.cost}
                      </span>
                      {step.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {step.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Treatment Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalCost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6-8 months</div>
              <div className="text-sm text-muted-foreground">Treatment Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          <h4 className="font-medium">Payment Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="font-medium text-sm">Full Payment</div>
              <div className="text-xs text-muted-foreground">5% discount • ${(totalCost * 0.95).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="font-medium text-sm">Monthly Plan</div>
              <div className="text-xs text-muted-foreground">12 months • ${Math.round(totalCost / 12)}/month</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}