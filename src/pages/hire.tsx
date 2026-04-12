import { useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useUIStore } from "../store";
import { Button, Card, CardContent, Input } from "../components/ui";
import { ArrowLeft, Calendar, Database } from "lucide-react";
import {
  createIpFingerprint,
  hasHireIpLock,
  isSupabaseConfigured,
  resolveClientIpAddress,
  setHireIpLock,
} from "../lib";
import { useCreateHireMutation } from "../hooks";
import NepaliDate from "nepali-date";

export default function HirePage() {
  const { workerId } = useParams({ from: "/hire/$workerId" });
  const { locale } = useUIStore();
  const isNepali = locale === "ne";
  const backendConfigured = isSupabaseConfigured();
  const createHireMutation = useCreateHireMutation();

  const [workDate, setWorkDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [description, setDescription] = useState("");
  const [agreedRateNpr, setAgreedRateNpr] = useState<number | "">("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!backendConfigured) {
      setSubmitError(
        isNepali
          ? "भाडा अनुरोध सेवा अहिले उपलब्ध छैन।"
          : "Hire request service is currently unavailable.",
      );
      return;
    }

    if (!description.trim()) {
      setSubmitError(
        isNepali ? "कामको विवरण आवश्यक छ।" : "Work description is required.",
      );
      return;
    }

    if (!workDate) {
      setSubmitError(
        isNepali ? "काम मिति आवश्यक छ।" : "Work date is required.",
      );
      return;
    }

    const hirerIp = await resolveClientIpAddress();

    if (hirerIp && hasHireIpLock(workerId, hirerIp)) {
      setSubmitError(
        isNepali
          ? "यस कामदारलाई यो IP बाट पहिले नै अनुरोध पठाइएको छ।"
          : "This worker has already been requested from this IP.",
      );
      return;
    }

    try {
      const ipFingerprint = createIpFingerprint();

      await createHireMutation.mutateAsync({
        workerId,
        hirerIp: hirerIp ?? undefined,
        ipFingerprint,
        workDescription: description.trim(),
        agreedRateNpr:
          agreedRateNpr === "" ? undefined : Math.max(500, agreedRateNpr),
        workDate: new Date(workDate),
        workDurationDays: duration,
      });

      if (hirerIp) {
        setHireIpLock(workerId, hirerIp, ipFingerprint);
      }
      setIsSuccess(true);
    } catch (error) {
      const fallback = isNepali
        ? "भाडा अनुरोध पठाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।"
        : "Unable to send hire request. Please try again.";
      setSubmitError(error instanceof Error ? error.message : fallback);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-mountain-900 mb-2">
              {isNepali ? "अनुरोध सफलतापूर्वक पठाइयो" : "Request Sent"}
            </h1>
            <p className="text-terrain-500 mb-6">
              {isNepali
                ? "कामदारलाई तपाईंको अनुरोध पठाइएको छ।"
                : "Your hire request has been sent to the worker."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/profile">
                <Button>{isNepali ? "मेरो प्रोफाइल" : "My Profile"}</Button>
              </Link>
              <Link to="/search">
                <Button variant="outline">
                  {isNepali ? "फेरि खोज्नुहोस्" : "Search Again"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        to="/worker/$workerId"
        params={{ workerId }}
        className="inline-flex items-center gap-2 text-sm text-terrain-500 hover:text-crimson-700"
      >
        <ArrowLeft className="w-4 h-4" />
        {isNepali ? "फिर्ता" : "Back"}
      </Link>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-xl font-bold text-mountain-900 mb-6">
            {isNepali ? "भाडा अनुरोध" : "Hire Request"}
          </h1>

          {!backendConfigured && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 mt-0.5" />
                <span>
                  {isNepali
                    ? "अहिलेलाई भाडा अनुरोध सेवा अस्थायी रूपमा बन्द छ।"
                    : "Hire requests are temporarily unavailable right now."}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-mountain-700 mb-1.5">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {isNepali ? "काम मिति" : "Work Date"}
                </div>
                {workDate && (
                  <span className="text-xs text-terrain-500 font-normal ml-auto">
                    (वि.सं.{" "}
                    {new NepaliDate(new Date(workDate)).format("YYYY-MM-DD")})
                  </span>
                )}
              </label>
              <Input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mountain-700 mb-1.5">
                {isNepali ? "अवधि (दिन)" : "Duration (days)"}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-terrain-300 px-3"
              >
                {[1, 2, 3, 5, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} {isNepali ? "दिन" : "days"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mountain-700 mb-1.5">
                {isNepali ? "दैनिक दर (रु)" : "Daily Rate (NPR)"}
              </label>
              <Input
                type="number"
                min={500}
                value={agreedRateNpr}
                onChange={(e) => {
                  const value = e.target.value;
                  setAgreedRateNpr(value ? Number(value) : "");
                }}
                placeholder={isNepali ? "वैकल्पिक" : "Optional"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-mountain-700 mb-1.5">
                {isNepali ? "विवरण" : "Description"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-terrain-300 px-3 py-2"
                required
              />
            </div>

            <div className="bg-terrain-50 rounded-lg p-4">
              <div className="flex justify-between gap-2">
                <span>{isNepali ? "दर" : "Rate"}</span>
                <span className="font-medium text-terrain-700 text-right">
                  {agreedRateNpr === ""
                    ? isNepali
                      ? "कामदारसँग छलफल गरी निश्चित गरिनेछ"
                      : "Will be agreed directly with the worker"
                    : `रु ${Number(agreedRateNpr).toLocaleString("en-IN")}/day`}
                </span>
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createHireMutation.isPending || !backendConfigured}
            >
              {createHireMutation.isPending
                ? isNepali
                  ? "पठाउँदै..."
                  : "Sending..."
                : isNepali
                  ? "पठाउनुहोस्"
                  : "Send Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
