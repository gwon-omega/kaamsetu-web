import { useUIStore } from "../store";
import { Card, CardContent } from "../components/ui";

export default function PrivacyPage() {
  const { locale } = useUIStore();
  const isNepali = locale === "ne";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-mountain-900">
        {isNepali ? "गोपनीयता नीति" : "Privacy Policy"}
      </h1>

      <Card>
        <CardContent className="p-5 space-y-3 text-sm text-terrain-500 leading-relaxed">
          <p>
            {isNepali
              ? "फोन, प्रोफाइल र भाडा विवरण सेवा सञ्चालनका लागि मात्र प्रयोग गरिन्छ।"
              : "Phone, profile, and hire details are used only for service operations."}
          </p>
          <p>
            {isNepali
              ? "सुरक्षा उद्देश्यका लागि अनुरोधसँग सम्बन्धित नेटवर्क सन्दर्भ सुरक्षित रूपमा राख्न सकिन्छ।"
              : "Network context related to a request may be stored for security controls."}
          </p>
          <p>
            {isNepali
              ? "कानुनी आवश्यकता बाहेक डाटा तेस्रो पक्षमा साझेदारी गरिँदैन।"
              : "Data is not shared with third parties except legal/compliance obligations."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
