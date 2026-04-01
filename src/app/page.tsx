import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Objectives from "@/components/landing/Objectives";
import Methodology from "@/components/landing/Methodology";
import Plans from "@/components/landing/Plans";
import Pricing from "@/components/landing/Pricing";
import Feedbacks from "@/components/landing/Feedbacks";
import BlogTeaser from "@/components/landing/BlogTeaser";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BlogTeaser />
      <Objectives />
      <Methodology />
      <Plans />
      <Pricing />
      <Feedbacks />
      <BlogTeaser />
      <Contact />
      <Footer />
    </main>
  );
}
