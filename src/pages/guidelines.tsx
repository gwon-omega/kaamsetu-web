import { useUIStore } from "../store";
import { Card, CardContent } from "../components/ui";

export default function GuidelinesPage() {
  const { locale } = useUIStore();
  const isNepali = locale === "ne";

  const items = [
    isNepali
      ? "सम्मानजनक भाषा र सुरक्षित व्यवहार अपनाउनुहोस्।"
      : "Use respectful language and safe behavior.",
    isNepali
      ? "प्रोफाइल र काम विवरणमा गलत सूचना नदिनुहोस्।"
      : "Do not provide misleading profile or work details.",
    isNepali
      ? "समय, दर र कामको दायरा पहिले नै स्पष्ट गर्नुहोस्।"
      : "Clarify schedule, rate, and scope before confirmation.",
    isNepali
      ? "विवाद वा समस्या भए आधिकारिक सहयोग च्यानल प्रयोग गर्नुहोस्।"
      : "Use official support channels for disputes or issues.",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-mountain-900">
        {isNepali ? "मार्गदर्शन" : "Usage Guidelines"}
      </h1>

      <Card>
        <CardContent className="p-5">
          <ul className="space-y-3 text-sm text-terrain-500 leading-relaxed">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-crimson-700">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
