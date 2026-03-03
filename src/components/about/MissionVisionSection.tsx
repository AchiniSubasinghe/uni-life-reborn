"use client";

import { Zap, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MissionVisionSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <Card className="card-hover bg-gray-950 border-gray-800 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6 glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-400 leading-relaxed">
                To simplify student life by providing a one-stop platform where
                students can discover, compare, and access all essential
                services near their campus. We believe every student deserves
                easy access to verified, quality services that make their
                university experience better.
              </p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="card-hover bg-gray-950 border-gray-800 rounded-2xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6 glow">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To become the leading student services platform across Sri
                Lanka, expanding to every major university and helping millions
                of students connect with essential services. We envision a
                future where every student has instant access to everything they
                need for a successful university journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
