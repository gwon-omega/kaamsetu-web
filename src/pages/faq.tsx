import { useUIStore } from "../store";
import { Card, CardContent } from "../components/ui";

export default function FaqPage() {
  const { locale } = useUIStore();
  const isNepali = locale === "ne";

  const faqItems = [
    {
      q: isNepali ? "कामदार कसरी खोज्ने?" : "How do I search workers?",
      a: isNepali
        ? "खोज पृष्ठमा स्थान र काम वर्ग फिल्टर प्रयोग गर्नुहोस्।"
        : "Use filters on Search page for location and job category.",
    },
    {
      q: isNepali ? "भाडा अनुरोध सुरक्षित छ?" : "Is hire request secure?",
      a: isNepali
        ? "प्रमाणीकरण, डेटाबेस नीति र IP-आधारित नियम लागू हुने संरचना छ।"
        : "The flow is designed with auth, DB policies, and IP-based controls.",
    },
    {
      q: isNepali ? "OTP नआए के गर्ने?" : "What if OTP does not arrive?",
      a: isNepali
        ? "नेटवर्क जाँच गरी केही मिनेटपछि पुन: प्रयास गर्नुहोस्।"
        : "Check signal/network and try again after a short delay.",
    },
    {
      q: isNepali
        ? "एउटै कामदारलाई दोहोर्याएर भाडा लिन मिल्छ?"
        : "Can I hire the same worker repeatedly?",
      a: isNepali
        ? "नीति र अवस्थाअनुसार सीमितता लागू हुन सक्छ।"
        : "Policy-based limits may apply depending on status and location.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-mountain-900">
        {isNepali ? "सामान्य प्रश्नहरू" : "Frequently Asked Questions"}
      </h1>
      {faqItems.map((item) => (
        <Card key={item.q}>
          <CardContent className="p-5">
            <h2 className="text-base font-semibold text-mountain-900">
              {item.q}
            </h2>
            <p className="text-sm text-terrain-500 mt-2">{item.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
