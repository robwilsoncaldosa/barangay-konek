export interface Feature {
  title: string
  description: string
  content: string
  badge?: {
    text: string
    variant: 'beta' | 'coming-soon'
  }
}

export const featuresData: Feature[] = [
  {
    title: "Resident Management",
    description: "Maintain comprehensive resident records and profiles",
    content: "Keep track of all residents with detailed profiles, contact information, and household data for better community management.",
    badge: {
      text: "Beta Development",
      variant: "beta"
    }
  },
  {
    title: "Document Processing",
    description: "Streamline certificate and clearance requests",
    content: "Handle barangay clearances, certificates, and other document requests digitally with automated workflows and tracking.",
    badge: {
      text: "Beta Development",
      variant: "beta"
    }
  },
  {
    title: "Complaint Management",
    description: "Track and resolve community issues efficiently",
    content: "Receive, categorize, and manage resident complaints with proper documentation and resolution tracking.",
    badge: {
      text: "Coming Soon",
      variant: "coming-soon"
    }
  },
  {
    title: "Event Management",
    description: "Organize and promote community events",
    content: "Plan, schedule, and manage barangay events with RSVP tracking and community notifications.",
    badge: {
      text: "Coming Soon",
      variant: "coming-soon"
    }
  },
  {
    title: "Financial Tracking",
    description: "Monitor barangay finances and budgets",
    content: "Keep track of barangay funds, expenses, and budget allocations with transparent financial reporting.",
    badge: {
      text: "Coming Soon",
      variant: "coming-soon"
    }
  },
  {
    title: "Analytics & Reports",
    description: "Generate insights from community data",
    content: "Access detailed reports and analytics to make informed decisions about community development and resource allocation.",
    badge: {
      text: "Coming Soon",
      variant: "coming-soon"
    }
  }
]