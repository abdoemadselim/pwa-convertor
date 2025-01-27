"use client";

import { useState, Suspense, lazy } from "react";
import AnimatedLogo from "./components/AnimatedLogo";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import LoadingOverlay from "./components/LoadingOverlay";
import Footer from "./components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PWAConverterForm = lazy(() => import("./components/PWAConverterForm"));
const VideoDemonstration = lazy(
  () => import("./components/VideoDemonstration")
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <ServiceWorkerRegistration />
      <LoadingOverlay isLoading={isLoading} />
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 md:p-16">
        <Card className="w-full max-w-6xl bg-gray-800/30 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-8">
              <AnimatedLogo />
              <h1 className="mt-4 text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                PWA Forge
              </h1>
              <p className="mt-2 text-center text-gray-400 text-xl">
                Transform any website into a Progressive Web App with just a few
                clicks
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Suspense
                fallback={<div className="text-center">Loading form...</div>}>
                <PWAConverterForm setIsLoading={setIsLoading} />
              </Suspense>
              <Suspense
                fallback={<div className="text-center">Loading video...</div>}>
                <VideoDemonstration />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
