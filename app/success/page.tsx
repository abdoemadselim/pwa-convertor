"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [pwaUrl, setPwaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = searchParams.get("pwaUrl");
    if (url) {
      // Simulate a delay to show loading state
      setTimeout(() => {
        setPwaUrl(url);
        setIsLoading(false);
      }, 20000);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="w-full max-w-2xl bg-gray-800/30 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 mb-4 animate-spin" />
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Finalizing Your PWA
              </h1>
              <p className="text-gray-300 mb-6">
                We're putting the finishing touches on your Progressive Web App.
                Just a moment...
              </p>
            </motion.div>
          </CardContent>
        </Card>
      );
    }

    if (!pwaUrl) {
      return (
        <Card className="w-full max-w-2xl bg-gray-800/30 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-yellow-500 text-transparent bg-clip-text">
                Oops! Something Went Wrong
              </h1>
              <p className="text-gray-300 mb-6">
                We couldn't find the PWA URL. Please try converting your website
                again.
              </p>
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Converter
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl bg-gray-800/30 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
              PWA Successfully Created!
            </h1>
            <p className="text-gray-300 mb-6">
              Your Progressive Web App is now ready to use. You can access it
              using the link below:
            </p>
            <div className="bg-gray-700/50 p-4 rounded-md mb-6">
              <a
                href={pwaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all flex items-center justify-center">
                {pwaUrl} <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Converter
                </Link>
              </Button>
              <Button asChild>
                <a
                  href={pwaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center">
                  Visit PWA <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 md:p-24">
        {renderContent()}
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
