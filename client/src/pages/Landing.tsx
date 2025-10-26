import { Link } from "react-router-dom";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">saaarthi — Interactive Urban Issue Reporter</h1>
              <p className="text-muted-foreground mb-6">
                Empowering citizens to report civic problems such as potholes, broken streetlights, or vandalism directly to local authorities. Geo-tag issues, attach images, and track status to ensure transparency and accountability.
              </p>

              <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 rounded bg-blue-600 text-white">
                  Sign in as Citizen
                </Link>
                <Link to="/authority-login" className="px-4 py-2 rounded border border-slate-200">
                  Authority Login
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Report potholes, broken streetlights, graffiti and more</li>
                <li>• Geo-tag issues and attach photos</li>
                <li>• Community voting and priority scoring</li>
                <li>• Track issue status and authority responses</li>
                <li>• Crowdfunding for urgent local repairs</li>
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded shadow">
                <h4 className="font-medium">Report</h4>
                <p className="text-sm text-muted-foreground">Quickly file an issue with photos and location.</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h4 className="font-medium">Community</h4>
                <p className="text-sm text-muted-foreground">Others can vote to prioritize urgent issues.</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h4 className="font-medium">Resolve</h4>
                <p className="text-sm text-muted-foreground">Authorities update status so everyone can track progress.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
