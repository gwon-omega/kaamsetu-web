import { useUIStore } from "../store";
import { Card, CardContent } from "../components/ui";

export default function TermsPage() {
  const { locale } = useUIStore();
  const isNepali = locale === "ne";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-mountain-900">
        {isNepali ? "सेवा सर्तहरू" : "Terms of Service"}
      </h1>

      <Card>
        <CardContent className="p-5 space-y-3 text-sm text-terrain-500 leading-relaxed">
          <p>
            {isNepali
              ? "यो प्लेटफर्म प्रयोग गर्दा सही जानकारी दिनु प्रयोगकर्ताको दायित्व हो।"
              : "Users are responsible for providing accurate information while using the platform."}
          </p>
          <p>
            {isNepali
              ? "भाडा अनुरोध, स्वीकृति र रद्द प्रक्रियामा प्लेटफर्म नीतिहरू लागू हुन्छन्।"
              : "Platform policies govern hire requests, acceptance, and cancellation behavior."}
          </p>
          <p>
            {isNepali
              ? "दुरुपयोग वा धोखाधडी देखिएमा खाता सीमित गर्न सकिन्छ।"
              : "Accounts may be restricted in case of misuse or fraudulent behavior."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
