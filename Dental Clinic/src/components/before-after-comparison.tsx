import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Smile, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface BeforeAfterComparisonProps {
  photos?: {
    before: string;
    after: string;
  };
}

export function BeforeAfterComparison({ photos }: BeforeAfterComparisonProps) {
  // Default demo photos if none provided
  const defaultPhotos = {
    before: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBwYXRpZW50JTIwc21pbGluZyUyMHdvbWFufGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    after: "https://images.unsplash.com/photo-1655807946138-811bb2340d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBiZWZvcmUlMjBhZnRlciUyMHNtaWxlfGVufDF8fHx8MTc1Nzk1NTA1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  };

  const displayPhotos = photos || defaultPhotos;

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-blue-500" />
          Smile Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Before Treatment</h3>
              <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                Current State
              </Badge>
            </div>
            <div className="relative group">
              <ImageWithFallback
                src={displayPhotos.before}
                alt="Before treatment"
                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 group-hover:shadow-lg transition-shadow"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="bg-blue-500 rounded-full p-3 shadow-lg">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* After */}
          <div className="space-y-3 lg:col-start-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">After Treatment</h3>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Projected Result
              </Badge>
            </div>
            <div className="relative group">
              <ImageWithFallback
                src={displayPhotos.after}
                alt="After treatment"
                className="w-full h-64 object-cover rounded-lg border-2 border-green-200 group-hover:shadow-lg transition-shadow"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg"></div>
              <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                Enhanced
              </div>
            </div>
          </div>
        </div>

        {/* Patient Encouragement */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white text-center">
          <h3 className="text-lg font-semibold mb-2">✨ Visualize Your Perfect Smile ✨</h3>
          <p className="text-blue-100">
            See the transformation possible with our advanced dental treatments. 
            Your journey to a confident, beautiful smile starts here.
          </p>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-lg font-semibold text-blue-600">95%</div>
            <div className="text-sm text-muted-foreground">Whiteness</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-lg font-semibold text-blue-600">Perfect</div>
            <div className="text-sm text-muted-foreground">Alignment</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-lg font-semibold text-blue-600">Excellent</div>
            <div className="text-sm text-muted-foreground">Gum Health</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-lg font-semibold text-blue-600">100%</div>
            <div className="text-sm text-muted-foreground">Confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}