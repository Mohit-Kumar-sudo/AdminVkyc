import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { DollarSign, CreditCard, Calendar, Percent } from "lucide-react";

interface CostItem {
  id: string;
  service: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export function CostEstimate() {
  const costItems: CostItem[] = [
    {
      id: '1',
      service: 'Initial Consultation & X-rays',
      quantity: 1,
      unitPrice: 150
    },
    {
      id: '2',
      service: 'Professional Teeth Cleaning',
      quantity: 1,
      unitPrice: 120
    },
    {
      id: '3',
      service: 'Teeth Whitening Sessions',
      quantity: 2,
      unitPrice: 275,
      discount: 50
    },
    {
      id: '4',
      service: 'Clear Aligner Treatment',
      quantity: 1,
      unitPrice: 200
    },
    {
      id: '5',
      service: 'Final Assessment & Documentation',
      quantity: 1,
      unitPrice: 100
    }
  ];

  const subtotal = costItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + itemTotal - (item.discount || 0);
  }, 0);

  const insuranceCoverage = 320; // Example insurance coverage
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + tax - insuranceCoverage;

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-500" />
          Cost Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          {costItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.service}</span>
                  {item.discount && (
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                      <Percent className="w-3 h-3 mr-1" />
                      Discount
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} × ${item.unitPrice}
                  {item.discount && ` - $${item.discount} discount`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${(item.quantity * item.unitPrice - (item.discount || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>${tax}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Insurance Coverage</span>
            <span>-${insuranceCoverage}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-blue-600">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Payment Options
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Full Payment (5% discount)</span>
              <span className="font-medium">${Math.round(total * 0.95).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>6-month plan</span>
              <span className="font-medium">${Math.round(total / 6).toLocaleString()}/month</span>
            </div>
            <div className="flex justify-between">
              <span>12-month plan</span>
              <span className="font-medium">${Math.round(total / 12).toLocaleString()}/month</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <h4 className="font-medium">Next Steps</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-blue-500" />
                Schedule Treatment
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                Book your first appointment to begin treatment
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Payment Setup
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                Choose your preferred payment option
              </p>
            </div>
          </div>
        </div>

        {/* Insurance Note */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Insurance Note:</strong> Coverage amounts may vary. We'll verify your benefits before treatment begins.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}