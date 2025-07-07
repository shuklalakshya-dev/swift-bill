"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation, easeInOut } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  FileText, Download, Share2, Calculator,
  Smartphone, Shield, Menu, X, ChevronRight
} from "lucide-react";
import TrueFocus from "@/components/TrueFocus";
import ScrollFloat from "@/components/ScrollFloat";
import Silk from "@/components/Silk";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState("perspective(1000px) rotateY(0deg) rotateX(0deg)");

  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mouse movement for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      // Update transform style here instead of in the JSX
      const rotateY = (e.clientX - window.innerWidth / 2) / 100;
      const rotateX = (window.innerHeight / 2 - e.clientY) / 100;
      setTransform(`perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Feature card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: easeInOut // Use the imported easing function
      }
    })
  };

  return (
    


    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50  overflow-x-hidden">
      {/* Floating Elements */}

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-[15%] w-64 h-64 rounded-full bg-gradient-to-r from-blue-300/20 to-indigo-300/20 blur-3xl animate-blob"></div>
        <div className="absolute top-2/3 right-[15%] w-80 h-80 rounded-full bg-gradient-to-r from-indigo-300/20 to-purple-300/20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-r from-purple-300/20 to-pink-300/20 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? "bg-[#702963] backdrop-blur-lg shadow-md" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-lg blur-[2px] opacity-30 rotate-3"></div>
                  <div className="relative bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </motion.div>
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-3 text-2xl font-bold bg-white text-transparent bg-clip-text"
              >
                SwiftBill
              </motion.span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {["Features", "Contact", "Login", "SignUp"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <Link
                    href={item === "Features" ? "#features" : `/${item.toLowerCase().replace(" ", "-")}`}
                    className="relative text-white font-medium hover:text-blue-300 transition-colors group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-white/80 shadow-sm"
                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isMenuOpen ? "auto" : 0, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden bg-white border-t"
        >
          <div className="px-4 py-2 space-y-1">
            {["Features", "Pricing", "Login", "Sign Up"].map((item) => (
              <Link
                key={item}
                href={item === "Features" ? "#features" : item === "Contact" ? "contact" : `/${item.toLowerCase().replace(" ", "-")}`}
                className="block py-2 px-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-36 pb-24 relative">
        {/* Add Silk as background */}
        <div className="absolute inset-0 z-5 overflow-hidden">
          <Silk 
            speed={2.5}
            scale={1.5}
            color="#702963" 
            noiseIntensity={1.2}
            rotation={0.2}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: -50}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center md:text-left"
            >
              <div className="inline-block mb-4 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                🚀 GST Ready Invoice Generator
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {/* <span className="block">Generate Professional</span> */}
                {/* <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">Invoices in Minutes</span> */}
           

<TrueFocus
sentence="Generate Professional Invoices in Minutes"
manualMode={false}
blurAmount={5}
borderColor="yellow"
animationDuration={1.5}
pauseBetweenAnimations={1}
/>
              </h1>
              <p className="text-xl text-gray-200 mb-8 md:max-w-lg">
                Create GST-ready invoices in ₹ (INR), download as PDF, and share instantly. Perfect for Indian
                freelancers and small businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/create">
                  <Button
                    size="lg"
                    className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      Generate Invoice Free
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

             
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative"
              style={{ transform }}
            >
              <div className="relative w-full h-full max-w-lg mx-auto">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

                {/* Invoice preview mockup */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 relative backdrop-blur-sm border border-white/20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="h-4 w-24 bg-gray-200 rounded"><span className="flex items-center justify-center h-full text-black">INVOICE</span></div>
                        <div className="h-3 w-16 bg-gray-100 rounded mt-1"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-6 w-20 bg-blue-100 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="h-3 w-16 bg-gray-200 rounded mb-2"><p className="">GST NO.-#01928373636171</p></div>
                        <div className="h-4 w-32 bg-gray-100 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-4 w-40 bg-gray-100 rounded"></div>
                            <div className="h-4 w-16 bg-gray-100 rounded"></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-2 border-t border-dashed border-gray-200">
                        <div className="flex justify-between">
                          <div className="h-5 w-20 bg-gray-200 rounded"></div>
                          <div className="h-5 w-24 bg-blue-100 rounded font-medium"><span className="flex items-center justify-center text-blue-700">Rs.5600</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <div className="h-10 flex-1 rounded-lg bg-blue-600"><p className="flex items-center justify-center h-full text-white">Download</p></div>
                    <div className="h-10 flex-1 rounded-lg bg-gray-100"><p className="flex items-center justify-center h-full text-blue-600">Share</p></div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
                  <span className="text-xs font-bold text-gray-900 px-2">GST Ready!</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0S75.8,50.93,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-4">
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Professional Invoicing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Indian businesses with GST compliance in mind
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calculator className="h-12 w-12 text-white" />,
                title: "GST Ready",
                description: "Automatic GST calculations with support for 0%, 5%, 12%, and 18% tax rates",
                gradient: "from-blue-500 to-indigo-600"
              },
              {
                icon: <Download className="h-12 w-12 text-white" />,
                title: "PDF Download",
                description: "Generate professional PDF invoices instantly with your branding",
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                icon: <Smartphone className="h-12 w-12 text-white" />,
                title: "WhatsApp Share",
                description: "Share invoices directly via WhatsApp with a single click",
                gradient: "from-purple-500 to-pink-600"
              },
              {
                icon: <Share2 className="h-12 w-12 text-white" />,
                title: "Email Integration",
                description: "Send invoices directly to clients via email with PDF attachment",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: <Shield className="h-12 w-12 text-white" />,
                title: "Secure & Private",
                description: "Your data is encrypted and secure. We never share your information",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                icon: <FileText className="h-12 w-12 text-white" />,
                title: "Custom Branding",
                description: "Add your logo and customize invoice templates to match your brand",
                gradient: "from-orange-500 to-amber-600"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
              >
                <Card className="h-full overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="h-full flex flex-col">
                      <div className={`p-5 bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                        <div className="relative h-16 w-16">
                          <div className="absolute inset-0 rounded-full bg-white/20 blur-md transform group-hover:scale-110 transition-transform duration-300"></div>
                          <div className="relative h-full w-full flex items-center justify-center">
                            {feature.icon}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 text-center flex-grow">
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                      <div className="px-6 pb-6">
                        <div className="w-1/3 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full transform origin-left group-hover:w-full transition-all duration-300"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-blue-400/30">
              {[
                { label: "Invoices Generated", value: "250K+" },
                { label: "Active Users", value: "10K+" },
                { label: "GST Calculations", value: "₹50M+" },
                { label: "Time Saved", value: "120K+ hrs" }
              ].map((stat, i) => (
                <div key={stat.label} className="p-8 text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workflow/Demo Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
              Simple Workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Create Invoices in 3 Easy Steps</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intuitive interface makes invoicing a breeze - no accounting knowledge required
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
            {/* Connecting line between steps */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-blue-500 to-indigo-100 z-0"></div>

            {[
              {
                step: "01",
                title: "Enter Details",
                description: "Fill in your business and client information along with invoice items"
              },
              {
                step: "02",
                title: "Preview & Customize",
                description: "See exactly how your invoice will look and make any final adjustments"
              },
              {
                step: "03",
                title: "Download & Share",
                description: "Save as PDF, email to your client, or share via WhatsApp instantly"
              }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative z-10"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col items-center text-center relative">
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mt-6 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/create">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Your First Invoice
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Businesses Across India</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about SwiftBill
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "SwiftBill has simplified our invoicing process enormously. The GST calculations alone save us hours every month.",
                name: "Priya Sharma",
                title: "Founder, Design Studio"
              },
              {
                quote: "The ability to share invoices directly via WhatsApp has improved our payment collection time by 40%.",
                name: "Rahul Verma",
                title: "Freelance Developer"
              },
              {
                quote: "Clean interface, perfect for small business owners who don't have time to learn complicated accounting software.",
                name: "Ananya Patel",
                title: "E-commerce Entrepreneur"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative"
              >
                <div className="absolute -top-5 -left-5 text-6xl text-blue-200 font-serif">"</div>
                <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 relative z-10">
                  <p className="text-gray-700 mb-6 relative z-10">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>

        {/* Animated shapes */}
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
          <svg viewBox="0 0 1200 120" className="absolute top-0 left-0 w-full h-32 -mt-20">
            <path fill="rgba(255,255,255,0.1)" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            <path fill="rgba(255,255,255,0.05)" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39 116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Create Your First Invoice?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of Indian freelancers and businesses using SwiftBill to streamline their invoicing process.
            </p>
            <Link href="/create">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Creating Invoices - It's Free!
              </Button>
            </Link>
          </motion.div>

       
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">SwiftBill</span>
              </div>
              <p className="text-gray-400 mb-6">Professional invoice generator for Indian businesses with GST compliance built-in.</p>
             
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                {['Features', 'Pricing', 'Templates'].map(link => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase()}`} className="hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                {['Help Center', 'Contact'].map(link => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                {['Privacy Policy', 'Terms of Service', 'GST Information', 'Refund Policy'].map(link => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="mb-4">&copy; 2025 SwiftBill. All rights reserved.</p>
            <div className="flex items-center justify-center">
              <span>Made with</span>
              <svg className="h-5 w-5 mx-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>in India</span>
              <span className="ml-2">🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Add keyframes for blob animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(20px, -20px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}