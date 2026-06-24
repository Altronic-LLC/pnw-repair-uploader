import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UploadView } from "@/views/UploadView";

/**
 * Single-screen app. No router — the kiosk does exactly one thing: navigate
 * folders and upload photos. (Add react-router later only if a second screen
 * is genuinely needed.)
 */
export function App() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-0 flex-1">
        <UploadView />
      </main>
      <Footer />
    </div>
  );
}
