import { Link } from "@tanstack/react-router";
import { useUIStore } from "../store";
import { Button, Card, CardContent } from "../components/ui";

export default function HowItWorksPage() {
  const { locale } = useUIStore();
  const isNepali = locale === "ne";

  const steps = [
    {
      title: isNepali ? "स्थान छनोट" : "Select Location",
      body: isNepali
        ? "प्रदेश, जिल्ला र स्थानीय तह छनोट गरी कामदार सूची फिल्टर गर्नुहोस्।"
        : "Filter workers by province, district, and local unit.",
    },
    {
      title: isNepali ? "कामदार तुलना" : "Compare Workers",
      body: isNepali
        ? "रेटिङ, अनुभव, दैनिक दर र उपलब्धता हेरेर निर्णय लिनुहोस्।"
        : "Review ratings, experience, daily rate, and availability.",
    },
    {
      title: isNepali ? "भाडा अनुरोध" : "Send Hire Request",
      body: isNepali
        ? "काम विवरण, मिति र बजेटसहित सुरक्षित अनुरोध पठाउनुहोस्।"
        : "Submit a secure hire request with work details and schedule.",
    },
    {
      title: isNepali ? "स्थिति ट्र्याक" : "Track Status",
      body: isNepali
        ? "अनुरोधको स्थिति, स्वीकृति र समापन रेकर्ड ट्र्याक गर्नुहोस्।"
        : "Track request state, acceptance, and completion history.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-terrain-200 bg-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-mountain-900">
          {isNepali ? "कसरी काम गर्छ" : "How It Works"}
        </h1>
        <p className="text-terrain-500 mt-2">
          {isNepali
            ? "मोबाइल-मैत्री प्रवाह: खोज, तुलना, भाडा, र ट्र्याक।"
            : "Mobile-first flow: search, compare, hire, and track."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardContent className="p-5">
              <div className="text-xs font-semibold text-crimson-700 mb-2">
                {isNepali ? `चरण ${index + 1}` : `Step ${index + 1}`}
              </div>
              <h2 className="text-lg font-semibold text-mountain-900 mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-terrain-500">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/search">
          <Button className="w-full">
            {isNepali ? "कामदार खोज्नुहोस्" : "Find Workers"}
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" className="w-full">
            {isNepali ? "खाता खोल्नुहोस्" : "Create Account"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
