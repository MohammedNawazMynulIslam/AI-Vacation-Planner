// app/components/ExportButton.tsx
"use client";

import { useState } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import ItineraryPDF from "./ItineraryPDF";

interface ExportButtonProps {
  plan: any; // Your MongoDB plan object
}

function PDFContent({ plan }: { plan: any }) {
  // Transform MongoDB data to PDF format
  const pdfPlan = {
    destination: plan.destination,
    days: plan.days,
    description: plan.description,
    highlights: plan.highlights || [],
    gastronomy: plan.gastronomy || "",
    smartTravel: plan.smartTravel || "",
    budget: plan.budget || { min: plan.days * 100, max: plan.days * 200 },
    itinerary: (plan.itinerary || []).map((day: any) => ({
      day: day.day,
      title: day.title,
      image: day.image,
      hotel: day.hotel,
      activities: day.activities || [],
      travelTips: day.travelTips || [],
    })),
    image: plan.image,
    weather: plan.weather,
  };

  return <ItineraryPDF plan={pdfPlan} />;
}

export default function ExportButton({ plan }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Direct download handler (works without PDFDownloadLink wrapper issues)
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<PDFContent plan={plan} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${plan.destination.toLowerCase().replace(/\s+/g, "-")}-itinerary.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-panel border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span className="text-slate-400">Synthesizing PDF...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}