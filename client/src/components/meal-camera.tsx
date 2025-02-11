import { useRef, useState } from "react";
import { Camera, Barcode, Tag, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { lookupBarcode } from "@/lib/barcode-service";
import type { ProductInfo } from "@/lib/barcode-service";
import { useToast } from "@/hooks/use-toast";

type ScanMode = "food" | "barcode" | "label" | "gallery";

interface MealCameraProps {
  onCapture: (imageBase64: string, productInfo?: ProductInfo) => void;
}

export default function MealCamera({ onCapture }: MealCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ScanMode>("food");
  const [isProcessing, setIsProcessing] = useState(false);
  const [timestamp] = useState(() => new Date());
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        // If exact environment camera fails, try without exact constraint
        const fallbackConstraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Error",
        description: "Please make sure you've granted camera permissions in your browser settings.",
        variant: "destructive"
      });
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        setIsProcessing(true);
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageBase64 = canvasRef.current.toDataURL("image/jpeg").split(",")[1];

        if (mode === "barcode") {
          try {
            // For demo purposes, using a sample barcode
            const productInfo = await lookupBarcode("3017620425035");
            if (productInfo) {
              onCapture(imageBase64, productInfo);
            }
          } catch (error) {
            console.error("Error processing barcode:", error);
          }
        } else {
          onCapture(imageBase64);
        }

        stopCamera();
        setIsProcessing(false);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "food":
        return "Scan Food";
      case "barcode":
        return "Barcode Scanner";
      case "label":
        return "Food Label";
      case "gallery":
        return "Gallery";
    }
  };

  return (
    <Card className="p-4">
      <div className="text-lg font-semibold mb-4 text-center">
        {getModeTitle()}
        <div className="text-sm text-muted-foreground">
          {format(timestamp, "h:mm a")}
        </div>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Mode-specific overlays */}
        {mode === "barcode" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-20 border-2 border-primary rounded-lg" />
          </div>
        )}
        {mode === "label" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary rounded-lg" />
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="flex justify-center mt-4 gap-4">
        {!isStreaming ? (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <Button 
            onClick={captureImage}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Take Photo"}
          </Button>
        )}
      </div>

      {/* Mode selector */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex justify-around max-w-md mx-auto">
          <Button
            variant={mode === "food" ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => setMode("food")}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Scan Food</span>
          </Button>
          <Button
            variant={mode === "barcode" ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => setMode("barcode")}
          >
            <Barcode className="h-5 w-5" />
            <span className="text-xs">Barcode</span>
          </Button>
          <Button
            variant={mode === "label" ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => setMode("label")}
          >
            <Tag className="h-5 w-5" />
            <span className="text-xs">Food Label</span>
          </Button>
          <Button
            variant={mode === "gallery" ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => setMode("gallery")}
          >
            <Image className="h-5 w-5" />
            <span className="text-xs">Gallery</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}