import { Link } from "react-router-dom";
import { Brain, Users, BarChart3, MessageSquare, Shield, Zap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Assistant",
    description: "Intelligent chat interface with streaming responses for instant administrative support",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Student Management",
    description: "Complete CRUD operations for student records with advanced search and filtering",
    color: "text-secondary",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights with interactive charts showing department distribution and trends",
    color: "text-success",
  },
  {
    icon: MessageSquare,
    title: "Chat History",
    description: "Persistent conversation tracking with search and export capabilities",
    color: "text-warning",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure authentication with admin and user role management",
    color: "text-destructive",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Live data synchronization with modern responsive design",
    color: "text-primary",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Academic Administrator",
    content: "The AI assistant has revolutionized how we handle student inquiries and administrative tasks.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "IT Director",
    content: "Seamless integration and powerful analytics make this the perfect admin solution.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Student Services Manager",
    content: "Intuitive interface and real-time insights have improved our efficiency dramatically.",
    rating: 5,
  },
];

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AI Campus Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-primary hover:bg-gradient-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Star className="mr-1 h-3 w-3" />
            AI-Powered Administration
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Intelligent Campus
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Administration
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your educational institution management with our AI-powered platform. 
            Get instant insights, automate administrative tasks, and enhance student services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary/90 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your campus efficiently with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-custom-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-background ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Education Leaders
            </h2>
            <p className="text-lg text-muted-foreground">
              See what administrators are saying about our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-surface hover:shadow-custom transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Campus Administration?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of institutions already using AI Campus Admin to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AI Campus Admin</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 AI Campus Admin. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};