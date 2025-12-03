import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, Camera, X } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PhotoUploadProps {
  onPhotosUploaded: (photos: { before: string; after: string }) => void;
}

export function PhotoUpload({ onPhotosUploaded }: PhotoUploadProps) {
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFileUpload = (file: File, type: 'before' | 'after') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'before') {
        setBeforePhoto(result);
      } else {
        setAfterPhoto(result);
      }
      
      // Ensure we call onPhotosUploaded after both images are available.
      // Use the most up-to-date values by reading the local variables rather
      // than relying on React state updates which may be async.
      const newBefore = type === 'before' ? result : beforePhoto;
      const newAfter = type === 'after' ? result : afterPhoto;
      if (newBefore && newAfter) {
        onPhotosUploaded({ before: newBefore, after: newAfter });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0], type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <Card className="bg-white border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-500" />
          Patient Photography
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo */}
          <div className="space-y-8">
            <label className="block text-sm font-medium">Before Photo</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
              }`}
              onDrop={(e) => handleDrop(e, 'before')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {beforePhoto ? (
                <div className="relative">
                  <ImageWithFallback
                    src={beforePhoto}
                    alt="Before photo"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0"
                    onClick={() => setBeforePhoto(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute left-2 top-2">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={async () => {
                        if (!beforePhoto) return;
                        setGenerating(true);
                        try {
                          const resp = await fetch('/api/generate-after-photo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageData: beforePhoto })
                          });

                          if (resp.ok) {
                            const json = await resp.json();
                            if (json.generatedImage) {
                              setAfterPhoto(json.generatedImage);
                              onPhotosUploaded({ before: beforePhoto, after: json.generatedImage });
                              return;
                            }
                          }

                          // Fallback to client-side mock if server didn't return a generated image
                          const generated = await generateAfterFromBefore(beforePhoto);
                          setAfterPhoto(generated);
                          onPhotosUploaded({ before: beforePhoto, after: generated });
                        } catch (err) {
                          // On any error, fallback to client-side generation
                          try {
                            const generated = await generateAfterFromBefore(beforePhoto);
                            setAfterPhoto(generated);
                            onPhotosUploaded({ before: beforePhoto, after: generated });
                          } catch (err2) {
                            console.error('Auto-generate failed:', err, err2);
                          }
                        } finally {
                          setGenerating(false);
                        }
                      }}
                      className="bg-white/80"
                    >
                      {generating ? 'Generating...' : 'Auto-generate After Photo'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="before-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'before');
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('before-upload')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* After Photo */}
          <div className="space-y-8">
            <label className="block text-sm font-medium">After Photo</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-blue-200 hover:border-blue-300'
              }`}
              onDrop={(e) => handleDrop(e, 'after')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {afterPhoto ? (
                <div className="relative">
                  <ImageWithFallback
                    src={afterPhoto}
                    alt="After photo"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0"
                    onClick={() => setAfterPhoto(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="after-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'after');
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('after-upload')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {beforePhoto && afterPhoto && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm text-center">
              ✓ Both photos uploaded successfully! Scroll down to see the comparison.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// key on the server.
async function generateAfterFromBefore(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Simple brightness/contrast adjustment
        const brightness = 20; // increase brightness
        const contrast = 1.05; // slight contrast boost
        // Apply adjustments
        for (let i = 0; i < data.length; i += 4) {
          // RGB
          for (let c = 0; c < 3; c++) {
            let v = data[i + c];
            // brightness
            v = v + brightness;
            // contrast
            v = ((v - 128) * contrast) + 128;
            // clamp
            data[i + c] = Math.max(0, Math.min(255, Math.round(v)));
          }
          // slightly increase saturation by moving pixels away from gray
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;
          data[i] = Math.max(0, Math.min(255, Math.round(r + (r - avg) * 0.08)));
          data[i + 1] = Math.max(0, Math.min(255, Math.round(g + (g - avg) * 0.06)));
          data[i + 2] = Math.max(0, Math.min(255, Math.round(b + (b - avg) * 0.04)));
        }
        ctx.putImageData(imageData, 0, 0);
        // Optionally, add a subtle vignette or whitening overlay if needed.
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}