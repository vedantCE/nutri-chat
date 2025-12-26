import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/ChatContainer";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-safe/5 rounded-full blur-3xl" />
      </div>
      
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
