import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import BlockConfirmationDialog from '../components/BlockConfirmationDialog';
import BookingDetailsDialog from '../components/BookingDetailsDialog';
import BookingReportDialog from '../components/BookingReportDialog';
import ViewSessionDialog from '../components/ViewSessionDialog';
import BlockVendorDialog from '../components/BlockVendorDialog';
import VendorDetailsDialog from '../components/VendorDetailsDialog';

interface ReportsProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

interface BookingReport {
  id: string;
  dateTime: string;
  user: string;
  userInitials: string;
  entity: string;
  vendorGuide: string;
  status: string;
  paymentMode: string;
  amount: number;
}

interface UserActivity {
  userName: string;
  userInitials: string;
  userType: string;
  activity: string;
  pageTarget: string;
  deviceOS: string;
  ipAddress: string;
  location: string;
  timestamp: string;
}

interface VendorReport {
  vendorName: string;
  vendorInitials: string;
  type: string;
  categoryTag: string;
  totalBookings: number;
  revenue: number;
  avgRating: number;
  complaintCount: number;
  lastActiveDate: string;
}

interface FeedbackComplaint {
  user: string;
  userInitials: string;
  type: string;
  entity: string;
  description: string;
  status: string;
  date: string;
}

interface Comment {
  name: string;
  userInitials: string;
  type: string;
  entityName: string;
  comment: string;
  rating: number;
  date: string;
}

interface EventReport {
  name: string;
  date: string;
  type: string;
  icon: string;
  count: number;
}

interface FootfallLog {
  siteName: string;
  siteInitials: string;
  date: string;
  totalVisitors: number;
  peakHours: string;
  domestic: number;
  international: number;
  revenue: number;
}

interface SentimentReport {
  date: string;
  source: string;
  category: string;
  feedback: string;
  sentiment: string;
  site: string;
  user: string;
  userInitials: string;
}

interface AuthenticationReport {
  user: string;
  userInitials: string;
  role: string;
  activity: string;
  deviceOS: string;
  ipAddress: string;
  location: string;
  dateTime: string;
  status: string;
}

interface AdPerformance {
  adName: string;
  subtitle: string;
  platform: string;
  views: number;
  clicks: number;
  ctr: number;
  budget: number;
  spent: number;
  status: string;
}

const Reports: React.FC<ReportsProps> = ({ onPageChange, onLogout }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState('booking-reports');
  const [activeFilter, setActiveFilter] = useState('all');
  const [eventView, setEventView] = useState('month');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showBookingDetailsDialog, setShowBookingDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingReport | null>(null);
  const [showBookingReportDialog, setShowBookingReportDialog] = useState(false);
  const [showViewSessionDialog, setShowViewSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserActivity | null>(null);
  const [showBlockVendorDialog, setShowBlockVendorDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorReport | null>(null);
  const [showVendorDetailsDialog, setShowVendorDetailsDialog] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  const handleBookingDetailsClick = (booking: BookingReport) => {
    setSelectedBooking(booking);
    setShowBookingDetailsDialog(true);
  };

  const handleBookingReportClick = (booking: BookingReport) => {
    setSelectedBooking(booking);
    setShowBookingReportDialog(true);
  };

  const handleViewSessionClick = (session: UserActivity) => {
    setSelectedSession(session);
    setShowViewSessionDialog(true);
  };

  const handleBlockUserClick = (session: UserActivity) => {
    setSelectedSession(session);
    setShowBlockDialog(true);
  };

  const handleBlockVendorClick = (vendor: VendorReport) => {
    setSelectedVendor(vendor);
    setShowBlockVendorDialog(true);
  };

  const handleVendorDetailsClick = (vendor: VendorReport) => {
    setSelectedVendor(vendor);
    setShowVendorDetailsDialog(true);
  };

  // Sample data for Booking Reports
  const bookingReports: BookingReport[] = [
    {
      id: '#BK-78942',
      dateTime: 'Jun 13, 2025 - 10:45 AM',
      user: 'Rahul Kumar',
      userInitials: 'RK',
      entity: 'Taj Mahal Heritage Tour',
      vendorGuide: 'Agra Heritage Walks',
      status: 'Confirmed',
      paymentMode: 'UPI',
      amount: 2499
    },
    {
      id: '#BK-78941',
      dateTime: 'Jun 12, 2025 - 04:30 PM',
      user: 'Ananya Patel',
      userInitials: 'AP',
      entity: 'Mysore Palace Evening Light Show',
      vendorGuide: 'Karnataka Tourism',
      status: 'Confirmed',
      paymentMode: 'Credit Card',
      amount: 1200
    },
    {
      id: '#BK-78940',
      dateTime: 'Jun 12, 2025 - 01:15 PM',
      user: 'Vikram Reddy',
      userInitials: 'VR',
      entity: 'Rajasthan Heritage Hotel Package',
      vendorGuide: 'Royal Retreats',
      status: 'Cancelled',
      paymentMode: 'Wallet',
      amount: 12500
    },
    {
      id: '#BK-78939',
      dateTime: 'Jun 11, 2025 - 11:20 AM',
      user: 'Shreya Desai',
      userInitials: 'SD',
      entity: 'Kerala Backwaters Houseboat',
      vendorGuide: 'Alleppey Cruises',
      status: 'Refunded',
      paymentMode: 'UPI',
      amount: 8750
    },
    {
      id: '#BK-78938',
      dateTime: 'Jun 10, 2025 - 09:45 AM',
      user: 'Priya Joshi',
      userInitials: 'PJ',
      entity: 'Varanasi Ganga Aarti Experience',
      vendorGuide: 'Banaras Cultural Tours',
      status: 'Confirmed',
      paymentMode: 'Credit Card',
      amount: 3200
    }
  ];

  // Sample data for User Activity
  const userActivities: UserActivity[] = [
    {
      userName: 'Rahul Kumar',
      userInitials: 'RK',
      userType: 'Tourist',
      activity: 'Booking',
      pageTarget: 'Taj Mahal Heritage Tour',
      deviceOS: 'iPhone 15 Pro · iOS 18.1',
      ipAddress: '103.25.178.45',
      location: 'Delhi',
      timestamp: 'Jun 13, 2025 · 10:45 AM'
    },
    {
      userName: 'Ananya Patel',
      userInitials: 'AP',
      userType: 'Tourist',
      activity: 'Login',
      pageTarget: 'Mobile App',
      deviceOS: 'Samsung Galaxy S23 · Android 14',
      ipAddress: '45.118.132.89',
      location: 'Mumbai',
      timestamp: 'Jun 13, 2025 · 09:30 AM'
    },
    {
      userName: 'Priya Joshi',
      userInitials: 'PJ',
      userType: 'Tourist',
      activity: 'Wishlist',
      pageTarget: 'Rajasthan Heritage Hotel Package',
      deviceOS: 'MacBook Pro · macOS 15.2',
      ipAddress: '122.176.47.98',
      location: 'Bangalore',
      timestamp: 'Jun 12, 2025 · 08:15 PM'
    },
    {
      userName: 'Vikram Reddy',
      userInitials: 'VR',
      userType: 'Tourist',
      activity: 'Review',
      pageTarget: 'Kerala Backwaters Houseboat',
      deviceOS: 'iPad Air · iPadOS 18.0',
      ipAddress: '59.92.114.76',
      location: 'Hyderabad',
      timestamp: 'Jun 12, 2025 · 06:40 PM'
    },
    {
      userName: 'Shreya Desai',
      userInitials: 'SD',
      userType: 'Tourist',
      activity: 'Booking',
      pageTarget: 'Varanasi Ganga Aarti Experience',
      deviceOS: 'OnePlus 12 · Android 14',
      ipAddress: '117.242.35.188',
      location: 'Kolkata',
      timestamp: 'Jun 12, 2025 · 05:20 PM'
    }
  ];

  // Sample data for Vendor Reports
  const vendorReports: VendorReport[] = [
    {
      vendorName: 'AH Agra Heritage Walks',
      vendorInitials: 'AH',
      type: 'Local Guide',
      categoryTag: 'Heritage',
      totalBookings: 248,
      revenue: 620000,
      avgRating: 4.8,
      complaintCount: 2,
      lastActiveDate: 'Jun 13, 2025 · 10:45 AM'
    },
    {
      vendorName: 'KT Karnataka Tourism',
      vendorInitials: 'KT',
      type: 'Event Organizer',
      categoryTag: 'Government',
      totalBookings: 412,
      revenue: 845000,
      avgRating: 4.6,
      complaintCount: 5,
      lastActiveDate: 'Jun 12, 2025 · 04:30 PM'
    },
    {
      vendorName: 'RR Royal Retreats',
      vendorInitials: 'RR',
      type: 'Hotel',
      categoryTag: 'Luxury',
      totalBookings: 156,
      revenue: 1950000,
      avgRating: 4.9,
      complaintCount: 1,
      lastActiveDate: 'Jun 12, 2025 · 01:15 PM'
    },
    {
      vendorName: 'AC Alleppey Cruises',
      vendorInitials: 'AC',
      type: 'Tour Operator',
      categoryTag: 'Eco-Tourism',
      totalBookings: 203,
      revenue: 1775000,
      avgRating: 4.7,
      complaintCount: 3,
      lastActiveDate: 'Jun 11, 2025 · 11:20 AM'
    },
    {
      vendorName: 'BC Banaras Cultural Tours',
      vendorInitials: 'BC',
      type: 'Local Guide',
      categoryTag: 'Religious',
      totalBookings: 175,
      revenue: 325000,
      avgRating: 4.5,
      complaintCount: 4,
      lastActiveDate: 'Jun 10, 2025 · 09:45 AM'
    }
  ];

  // Sample data for Feedback & Complaints
  const feedbackComplaints: FeedbackComplaint[] = [
    {
      user: 'Vikram Reddy',
      userInitials: 'VR',
      type: 'Complaint',
      entity: 'Royal Retreats',
      description: 'Room was not as shown in pictures. The view was completely different and amenities were missing...',
      status: 'Open',
      date: 'Jun 12, 2025'
    },
    {
      user: 'Shreya Desai',
      userInitials: 'SD',
      type: 'Complaint',
      entity: 'Alleppey Cruises',
      description: 'The houseboat had cleanliness issues and the food quality was below average. Staff was not responsive...',
      status: 'In Progress',
      date: 'Jun 11, 2025'
    },
    {
      user: 'Rahul Kumar',
      userInitials: 'RK',
      type: 'Suggestion',
      entity: 'Platform',
      description: 'It would be great if the app could include a feature to download tickets offline for areas with poor connectivity.',
      status: 'Open',
      date: 'Jun 10, 2025'
    },
    {
      user: 'Ananya Patel',
      userInitials: 'AP',
      type: 'Feedback',
      entity: 'Karnataka Tourism',
      description: 'The Mysore Palace light show was absolutely spectacular! The guide was knowledgeable and the entire experience was magical.',
      status: 'Closed',
      date: 'Jun 09, 2025'
    },
    {
      user: 'Priya Joshi',
      userInitials: 'PJ',
      type: 'Complaint',
      entity: 'Banaras Cultural Tours',
      description: 'The guide was 30 minutes late for the Ganga Aarti tour and rushed through explanations. Very disappointing.',
      status: 'Open',
      date: 'Jun 08, 2025'
    }
  ];

  // Sample data for Comments
  const comments: Comment[] = [
    {
      name: 'Aditya Mehta',
      userInitials: 'AM',
      type: 'Heritage Site',
      entityName: 'Taj Mahal',
      comment: 'Amazing! The intricate marble work and the symmetry of the building...',
      rating: 5.0,
      date: 'Jun 15, 2025'
    },
    {
      name: 'Sanjay Kumar',
      userInitials: 'SK',
      type: 'Vendor',
      entityName: 'Royal Retreats',
      comment: 'Fantastic Rajasthani experience. The staff was very courteous and...',
      rating: 4.5,
      date: 'Jun 14, 2025'
    },
    {
      name: 'Riya Patel',
      userInitials: 'RP',
      type: 'Event',
      entityName: 'Mysore Dasara Festival',
      comment: 'Spectacular! The elephant parade and cultural performances were...',
      rating: 4.8,
      date: 'Jun 13, 2025'
    },
    {
      name: 'Vikram Khanna',
      userInitials: 'VK',
      type: 'Local Guide',
      entityName: 'Kerala Backwaters Tour',
      comment: 'Knowledgeable about the local ecosystem and culture. He made the...',
      rating: 5.0,
      date: 'Jun 12, 2025'
    },
    {
      name: 'Neha Sharma',
      userInitials: 'NS',
      type: 'Heritage Site',
      entityName: 'Hampi Ruins',
      comment: 'The historical significance and architectural brilliance of Hampi is awe-inspiring. The stone...',
      rating: 4.7,
      date: 'Jun 11, 2025'
    }
  ];

  // Sample data for Event Reports
  const eventReports: EventReport[] = [
    // Q1 2025
    { name: 'Tourism Summit 2025', date: '2025-01-15', type: 'Admin', icon: 'ri-building-line', count: 1 },
    { name: 'Classical Dance Festival', date: '2025-01-28', type: 'Cultural', icon: 'ri-music-line', count: 1 },
    { name: 'Rajasthan Desert Festival', date: '2025-02-10', type: 'Festival', icon: 'ri-heart-line', count: 1 },
    { name: 'Hampi Heritage Walk', date: '2025-03-05', type: 'Heritage', icon: 'ri-leaf-line', count: 1 },
    { name: 'Handicraft Exhibition', date: '2025-03-20', type: 'Artisan', icon: 'ri-tools-line', count: 1 },
    
    // Q2 2025
    { name: 'Guide Training Program', date: '2025-04-12', type: 'Admin', icon: 'ri-building-line', count: 1 },
    { name: 'Buddha Purnima Festival', date: '2025-05-01', type: 'Festival', icon: 'ri-heart-line', count: 1 },
    { name: 'Folk Music Night', date: '2025-05-15', type: 'Cultural', icon: 'ri-music-line', count: 1 },
    { name: 'Goa Beach Festival', date: '2025-06-01', type: 'Admin', icon: 'ri-building-line', count: 1 },
    { name: 'Rajasthan Folk Festival', date: '2025-06-13', type: 'Artisan', icon: 'ri-tools-line', count: 1 },
    
    // Q3 2025
    { name: 'Taj Mahal Moonlight Tour', date: '2025-07-08', type: 'Heritage', icon: 'ri-leaf-line', count: 1 },
    { name: 'Independence Day Special', date: '2025-08-15', type: 'Festival', icon: 'ri-heart-line', count: 1 },
    { name: 'Onam Celebrations', date: '2025-08-30', type: 'Cultural', icon: 'ri-music-line', count: 1 },
    { name: 'Textile Exhibition', date: '2025-09-20', type: 'Artisan', icon: 'ri-tools-line', count: 1 },
    
    // Q4 2025
    { name: 'Dussehra Festival', date: '2025-10-02', type: 'Festival', icon: 'ri-heart-line', count: 1 },
    { name: 'Tourism Awards 2025', date: '2025-10-15', type: 'Admin', icon: 'ri-building-line', count: 1 },
    { name: 'Khajuraho Temple Tour', date: '2025-11-12', type: 'Heritage', icon: 'ri-leaf-line', count: 1 },
    { name: 'Christmas Cultural Night', date: '2025-12-25', type: 'Cultural', icon: 'ri-music-line', count: 1 },
    
    // Additional events for calendar view
    { name: 'Classical Dance Festival', date: '2025-06-02', type: 'Cultural Performance', icon: 'ri-music-line', count: 1 },
    { name: 'World Heritage Day', date: '2025-06-06', type: 'Admin Event', icon: 'ri-building-line', count: 1 },
    { name: 'Artisan Exhibition', date: '2025-06-13', type: 'Artisan Event', icon: 'ri-leaf-line', count: 4 },
    { name: 'Taj Mahal Special Tour', date: '2025-06-14', type: 'Heritage Walk', icon: 'ri-building-line', count: 1 },
    { name: 'Kerala Food Festival', date: '2025-06-16', type: 'Food Event', icon: 'ri-restaurant-line', count: 2 },
    { name: 'Mysore Palace Music Night', date: '2025-06-19', type: 'Cultural Performance', icon: 'ri-music-line', count: 1 },
    { name: 'Eco Tourism Workshop', date: '2025-06-22', type: 'Admin Event', icon: 'ri-leaf-line', count: 3 },
    { name: 'Varanasi Cultural Event', date: '2025-06-25', type: 'Cultural Performance', icon: 'ri-heart-line', count: 1 },
    { name: 'Backwaters Festival', date: '2025-06-28', type: 'Vendor Festival', icon: 'ri-building-line', count: 2 },
    { name: 'Festival', date: '2025-06-29', type: 'Cultural Performance', icon: 'ri-heart-line', count: 3 },
    { name: 'Heritage Walk', date: '2025-06-29', type: 'Heritage Walk', icon: 'ri-leaf-line', count: 3 }
  ];

  // Sample data for Footfall Logs
  const footfallLogs: FootfallLog[] = [
    {
      siteName: 'Taj Mahal',
      siteInitials: 'TM',
      date: 'Aug 07, 2025',
      totalVisitors: 12458,
      peakHours: '09:00 - 11:00',
      domestic: 8945,
      international: 3513,
      revenue: 2491600
    },
    {
      siteName: 'Mysore Palace',
      siteInitials: 'MP',
      date: 'Aug 07, 2025',
      totalVisitors: 8756,
      peakHours: '10:00 - 12:00',
      domestic: 7234,
      international: 1522,
      revenue: 1313400
    },
    {
      siteName: 'Hampi Ruins',
      siteInitials: 'HR',
      date: 'Aug 07, 2025',
      totalVisitors: 4567,
      peakHours: '08:00 - 10:00',
      domestic: 3890,
      international: 677,
      revenue: 685050
    },
    {
      siteName: 'Khajuraho Temples',
      siteInitials: 'KT',
      date: 'Aug 07, 2025',
      totalVisitors: 3245,
      peakHours: '09:30 - 11:30',
      domestic: 2567,
      international: 678,
      revenue: 486750
    },
    {
      siteName: 'Sun Temple',
      siteInitials: 'ST',
      date: 'Aug 07, 2025',
      totalVisitors: 2890,
      peakHours: '07:00 - 09:00',
      domestic: 2345,
      international: 545,
      revenue: 433500
    }
  ];

  // Sample data for Sentiment Reports
  const sentimentReports: SentimentReport[] = [
    {
      date: 'Aug 07, 2025',
      source: 'Review',
      category: 'Service',
      feedback: 'The guide was extremely knowledgeable and made the tour very engaging...',
      sentiment: 'Positive',
      site: 'Taj Mahal',
      user: 'Rahul Kumar',
      userInitials: 'RK'
    },
    {
      date: 'Aug 07, 2025',
      source: 'Feedback',
      category: 'Facilities',
      feedback: 'The restroom facilities need improvement and better maintenance...',
      sentiment: 'Negative',
      site: 'Mysore Palace',
      user: 'Ananya Patel',
      userInitials: 'AP'
    },
    {
      date: 'Aug 07, 2025',
      source: 'Review',
      category: 'Experience',
      feedback: 'The site was well-maintained but the crowd management could be better...',
      sentiment: 'Neutral',
      site: 'Hampi Ruins',
      user: 'Vikram Reddy',
      userInitials: 'VR'
    },
    {
      date: 'Aug 07, 2025',
      source: 'Feedback',
      category: 'Accessibility',
      feedback: 'The new ramp installations have made it much easier for wheelchair access...',
      sentiment: 'Positive',
      site: 'Khajuraho Temples',
      user: 'Shreya Desai',
      userInitials: 'SD'
    },
    {
      date: 'Aug 07, 2025',
      source: 'Review',
      category: 'Value',
      feedback: 'The entry fee is quite reasonable considering the historical significance...',
      sentiment: 'Positive',
      site: 'Sun Temple',
      user: 'Priya Joshi',
      userInitials: 'PJ'
    }
  ];

  // Sample data for Authentication Report
  const authenticationReports: AuthenticationReport[] = [
    {
      user: 'Sanjay Kumar',
      userInitials: 'SK',
      role: 'Admin',
      activity: 'Login',
      deviceOS: 'MacBook Pro · macOS 15.2',
      ipAddress: '103.25.178.45',
      location: 'Mumbai, India',
      dateTime: 'Aug 07, 2025 · 10:45 AM',
      status: 'Success'
    },
    {
      user: 'Riya Patel',
      userInitials: 'RP',
      role: 'Manager',
      activity: 'Logout',
      deviceOS: 'iPhone 15 Pro · iOS 18.1',
      ipAddress: '45.118.132.89',
      location: 'Delhi, India',
      dateTime: 'Aug 07, 2025 · 10:30 AM',
      status: 'Success'
    },
    {
      user: 'Amit Kumar',
      userInitials: 'AK',
      role: 'Vendor',
      activity: 'Login',
      deviceOS: 'Samsung Galaxy S23 · Android 14',
      ipAddress: '122.176.47.98',
      location: 'Bangalore, India',
      dateTime: 'Aug 07, 2025 · 10:15 AM',
      status: 'Failed'
    },
    {
      user: 'Neha Sharma',
      userInitials: 'NS',
      role: 'Staff',
      activity: 'Login',
      deviceOS: 'Windows 11 · Chrome',
      ipAddress: '59.92.114.76',
      location: 'Hyderabad, India',
      dateTime: 'Aug 07, 2025 · 10:00 AM',
      status: 'Success'
    },
    {
      user: 'Vikram Khanna',
      userInitials: 'VK',
      role: 'Tourist',
      activity: 'Logout',
      deviceOS: 'iPad Air · iPadOS 18.0',
      ipAddress: '117.242.35.188',
      location: 'Kolkata, India',
      dateTime: 'Aug 07, 2025 · 09:45 AM',
      status: 'Success'
    }
  ];

  // Sample data for Ad Performance
  const adPerformance: AdPerformance[] = [
    {
      adName: 'Taj Mahal Special Tour',
      subtitle: 'Heritage Campaign',
      platform: 'Website',
      views: 12458,
      clicks: 845,
      ctr: 6.78,
      budget: 25000,
      spent: 18750,
      status: 'Active'
    },
    {
      adName: 'Kerala Backwaters',
      subtitle: 'Summer Escape',
      platform: 'Mobile App',
      views: 8956,
      clicks: 623,
      ctr: 6.96,
      budget: 20000,
      spent: 15400,
      status: 'Paused'
    },
    {
      adName: 'Rajasthan Desert Safari',
      subtitle: 'Adventure Series',
      platform: 'Website',
      views: 15789,
      clicks: 1245,
      ctr: 7.89,
      budget: 30000,
      spent: 30000,
      status: 'Completed'
    },
    {
      adName: 'Varanasi Spiritual Tour',
      subtitle: 'Cultural Experience',
      platform: 'Mobile App',
      views: 9845,
      clicks: 756,
      ctr: 7.68,
      budget: 22000,
      spent: 16500,
      status: 'Active'
    },
    {
      adName: 'Hampi Heritage Walk',
      subtitle: 'History Unveiled',
      platform: 'Website',
      views: 7856,
      clicks: 534,
      ctr: 6.80,
      budget: 18000,
      spent: 12600,
      status: 'Active'
    }
  ];

  const renderBookingReports = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Booking ID</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <span>Date & Time</span>
                  <i className="ri-arrow-down-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor/Guide</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookingReports.map((booking, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.dateTime}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{booking.userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{booking.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.entity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.vendorGuide}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.paymentMode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{booking.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleBookingDetailsClick(booking)}>
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => handleBookingReportClick(booking)}>
                      <i className="ri-file-list-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">Showing 1-5 of 42 bookings</p>
      </div>
    </div>
  );

  const renderUserActivity = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>User Name</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page/Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device & OS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userActivities.map((activity, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{activity.userInitials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                      <div className="text-sm text-gray-500">{activity.userType}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.activity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.pageTarget}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.deviceOS}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.ipAddress} · {activity.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.timestamp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700" onClick={() => handleViewSessionClick(activity)}>
                      View Session
                    </button>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => handleBlockUserClick(activity)}>
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 124 activities</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">25</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVendorReports = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>Vendor Name</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Tag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Generated (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendorReports.map((vendor, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{vendor.vendorInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{vendor.vendorName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    vendor.categoryTag === 'Heritage' ? 'bg-blue-100 text-blue-800' :
                    vendor.categoryTag === 'Government' ? 'bg-purple-100 text-purple-800' :
                    vendor.categoryTag === 'Luxury' ? 'bg-yellow-100 text-yellow-800' :
                    vendor.categoryTag === 'Eco-Tourism' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {vendor.categoryTag}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.totalBookings}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{vendor.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill ${i < Math.floor(vendor.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-900">{vendor.avgRating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.complaintCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.lastActiveDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleVendorDetailsClick(vendor)}>
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => handleBlockVendorClick(vendor)}>
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 78 vendors</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">16</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedbackComplaints = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbackComplaints.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{item.userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.entity}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <i className="ri-check-line text-lg"></i>
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      <i className="ri-reply-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">Showing 1-5 of 36 items</p>
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>Name</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map((comment, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{comment.userInitials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{comment.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    comment.type === 'Heritage Site' ? 'bg-blue-100 text-blue-800' :
                    comment.type === 'Vendor' ? 'bg-yellow-100 text-yellow-800' :
                    comment.type === 'Event' ? 'bg-purple-100 text-purple-800' :
                    comment.type === 'Local Guide' ? 'bg-green-100 text-green-800' :
                    comment.type === 'Food' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {comment.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comment.entityName}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{comment.comment}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ri-star-fill ${i < Math.floor(comment.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-900">{comment.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 15 comments</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">15</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventReports = () => (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Event Reports Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setEventView('month')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              eventView === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setEventView('year')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              eventView === 'year'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Year View
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>All Sites</option>
              <option>Taj Mahal</option>
              <option>Mysore Palace</option>
              <option>Hampi Ruins</option>
              <option>Khajuraho Temples</option>
              <option>Sun Temple</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <i className="ri-download-line"></i>
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Year View */}
      {eventView === 'year' ? (
        <div className="year-view-grid">
          {/* Q1 2025 */}
          <div className="quarter-section">
            <h3 className="quarter-header q1">Q1 2025</h3>
            
            {/* January */}
            <div className="month-section">
              <h4 className="month-title">January</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">15</span>
                  <span className="event-tag admin">Admin</span>
                  <span className="event-name">Tourism Summit 2025</span>
                </div>
                <div className="event-item">
                  <span className="event-date">28</span>
                  <span className="event-tag cultural">Cultural</span>
                  <span className="event-name">Classical Dance Festival</span>
                </div>
              </div>
            </div>
            
            {/* February */}
            <div className="month-section">
              <h4 className="month-title">February</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">10</span>
                  <span className="event-tag festival">Festival</span>
                  <span className="event-name">Rajasthan Desert Festival</span>
                </div>
              </div>
            </div>
            
            {/* March */}
            <div className="month-section">
              <h4 className="month-title">March</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">5</span>
                  <span className="event-tag heritage">Heritage</span>
                  <span className="event-name">Hampi Heritage Walk</span>
                </div>
                <div className="event-item">
                  <span className="event-date">20</span>
                  <span className="event-tag artisan">Artisan</span>
                  <span className="event-name">Handicraft Exhibition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Q2 2025 */}
          <div className="quarter-section">
            <h3 className="quarter-header q2">Q2 2025</h3>
            
            {/* April */}
            <div className="month-section">
              <h4 className="month-title">April</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">12</span>
                  <span className="event-tag admin">Admin</span>
                  <span className="event-name">Guide Training Program</span>
                </div>
              </div>
            </div>
            
            {/* May */}
            <div className="month-section">
              <h4 className="month-title">May</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">1</span>
                  <span className="event-tag festival">Festival</span>
                  <span className="event-name">Buddha Purnima Festival</span>
                </div>
                <div className="event-item">
                  <span className="event-date">15</span>
                  <span className="event-tag cultural">Cultural</span>
                  <span className="event-name">Folk Music Night</span>
                </div>
              </div>
            </div>
            
            {/* June */}
            <div className="month-section">
              <h4 className="month-title">June</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">1</span>
                  <span className="event-tag admin">Admin</span>
                  <span className="event-name">Goa Beach Festival</span>
                </div>
                <div className="event-item">
                  <span className="event-date">13</span>
                  <span className="event-tag artisan">Artisan</span>
                  <span className="event-name">Rajasthan Folk Festival</span>
                </div>
              </div>
            </div>
          </div>

          {/* Q3 2025 */}
          <div className="quarter-section">
            <h3 className="quarter-header q3">Q3 2025</h3>
            
            {/* July */}
            <div className="month-section">
              <h4 className="month-title">July</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">8</span>
                  <span className="event-tag heritage">Heritage</span>
                  <span className="event-name">Taj Mahal Moonlight Tour</span>
                </div>
              </div>
            </div>
            
            {/* August */}
            <div className="month-section">
              <h4 className="month-title">August</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">15</span>
                  <span className="event-tag festival">Festival</span>
                  <span className="event-name">Independence Day Special</span>
                </div>
                <div className="event-item">
                  <span className="event-date">30</span>
                  <span className="event-tag cultural">Cultural</span>
                  <span className="event-name">Onam Celebrations</span>
                </div>
              </div>
            </div>
            
            {/* September */}
            <div className="month-section">
              <h4 className="month-title">September</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">20</span>
                  <span className="event-tag artisan">Artisan</span>
                  <span className="event-name">Textile Exhibition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Q4 2025 */}
          <div className="quarter-section">
            <h3 className="quarter-header q4">Q4 2025</h3>
            
            {/* October */}
            <div className="month-section">
              <h4 className="month-title">October</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">2</span>
                  <span className="event-tag festival">Festival</span>
                  <span className="event-name">Dussehra Festival</span>
                </div>
                <div className="event-item">
                  <span className="event-date">15</span>
                  <span className="event-tag admin">Admin</span>
                  <span className="event-name">Tourism Awards 2025</span>
                </div>
              </div>
            </div>
            
            {/* November */}
            <div className="month-section">
              <h4 className="month-title">November</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">12</span>
                  <span className="event-tag heritage">Heritage</span>
                  <span className="event-name">Khajuraho Temple Tour</span>
                </div>
              </div>
            </div>
            
            {/* December */}
            <div className="month-section">
              <h4 className="month-title">December</h4>
              <div className="space-y-2">
                <div className="event-item">
                  <span className="event-date">25</span>
                  <span className="event-tag cultural">Cultural</span>
                  <span className="event-name">Christmas Cultural Night</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Month View Calendar */
        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="calendar-nav">
            <button 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
              className="calendar-nav-button"
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>
            
            <span className="calendar-title">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            
            <button 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
              className="calendar-nav-button"
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Days of the week */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
            
            {/* Calendar dates */}
            {(() => {
              const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
              const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay());
              
              const dates = [];
              for (let i = 0; i < 42; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                
                const eventsForDate = eventReports.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getDate() === currentDate.getDate() && 
                         eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
                });
                
                const isCurrentMonth = currentDate.getMonth() === selectedDate.getMonth();
                const isToday = currentDate.toDateString() === new Date().toDateString();
                
                dates.push(
                  <div
                    key={i}
                    className={`min-h-[80px] p-2 border border-gray-200 ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'ring-2 ring-orange-500' : ''}`}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {currentDate.getDate()}
                    </div>
                    
                    {eventsForDate.map((event, index) => (
                      <div key={index} className="mt-1 text-xs bg-blue-100 text-blue-800 p-1 rounded truncate">
                        <i className={`${event.icon} mr-1`}></i>
                        {event.name}
                      </div>
                    ))}
                    
                    {eventsForDate.length > 0 && (
                      <div className="mt-1 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {eventsForDate.length}
                      </div>
                    )}
                  </div>
                );
              }
              return dates;
            })()}
          </div>
        </div>
      )}
    </div>
  );

  const renderFootfallLogs = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>Site Name</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visitors</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peak Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domestic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">International</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {footfallLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{log.siteInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{log.siteName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.totalVisitors}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.peakHours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.domestic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.international}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{log.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 5 footfall logs</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">5</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSentimentReports = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>Date</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sentimentReports.map((report, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{report.feedback}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    report.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                    report.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.site}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{report.userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{report.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 10 sentiment reports</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">10</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuthenticationReport = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>User</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device & OS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {authenticationReports.map((report, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{report.userInitials}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{report.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.activity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.deviceOS}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.ipAddress} · {report.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.dateTime}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    report.status === 'Success' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 10 authentication reports</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">10</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdPerformance = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                  <span>Ad Name</span>
                  <i className="ri-arrow-up-s-line ml-1 text-gray-400"></i>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtitle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adPerformance.map((ad, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{ad.adName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.subtitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.platform}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.views}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.clicks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.ctr.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{ad.budget.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{ad.spent.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ad.status === 'Active' ? 'bg-green-100 text-green-800' :
                    ad.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ad.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-forbid-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Showing 1-5 of 10 ad performance reports</p>
          <div className="flex items-center space-x-1">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">2</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">3</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">4</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">10</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (activeReportTab) {
      case 'booking-reports':
        return renderBookingReports();
      case 'user-activity':
        return renderUserActivity();
      case 'vendor-reports':
        return renderVendorReports();
      case 'feedback-complaints':
        return renderFeedbackComplaints();
      case 'comments':
        return renderComments();
      case 'event-reports':
        return renderEventReports();
      case 'footfall-logs':
        return renderFootfallLogs();
      case 'sentiment-reports':
        return renderSentimentReports();
      case 'authentication-report':
        return renderAuthenticationReport();
      case 'ad-performance':
        return renderAdPerformance();
      default:
        return renderBookingReports();
    }
  };

  const renderFilters = () => {
    if (activeReportTab === 'vendor-reports') {
      return (
        <div className="flex space-x-2 mb-6">
          {['All Vendors', 'Artisans', 'Hotels', 'Event Organizers', 'Local Guides', 'Food Vendors', 'Retailers'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter === 'All Vendors' ? 'all' : filter.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (filter === 'All Vendors' && activeFilter === 'all') || 
                (filter !== 'All Vendors' && activeFilter === filter.toLowerCase())
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      );
    }
    
    if (activeReportTab === 'feedback-complaints') {
      return (
        <div className="flex space-x-2 mb-6">
          {['All', 'Complaints', 'Suggestions', 'Feedback'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter === 'All' ? 'all' : filter.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (filter === 'All' && activeFilter === 'all') || 
                (filter !== 'All' && activeFilter === filter.toLowerCase())
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      );
    }

    if (activeReportTab === 'comments') {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {['All', 'Heritage Sites', 'Vendors', 'Events', 'Local Guides', 'Food'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter === 'All' ? 'all' : filter.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (filter === 'All' && activeFilter === 'all') || 
                  (filter !== 'All' && activeFilter === filter.toLowerCase())
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeReportTab === 'footfall-logs') {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>All Sites</option>
              <option>Taj Mahal</option>
              <option>Mysore Palace</option>
              <option>Hampi Ruins</option>
              <option>Khajuraho Temples</option>
              <option>Sun Temple</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <i className="ri-download-line"></i>
            <span>Export Data</span>
          </button>
        </div>
      );
    }

    if (activeReportTab === 'sentiment-reports') {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {['All', 'Positive', 'Neutral', 'Negative'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter === 'All' ? 'all' : filter.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (filter === 'All' && activeFilter === 'all') || 
                  (filter !== 'All' && activeFilter === filter.toLowerCase())
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
            
            <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
              <i className="ri-download-line"></i>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      );
    }

    if (activeReportTab === 'authentication-report') {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Vendor</option>
              <option>Staff</option>
              <option>Tourist</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search user or device..."
                className="px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <i className="ri-download-line"></i>
            <span>Export Report</span>
          </button>
        </div>
      );
    }

    if (activeReportTab === 'ad-performance') {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>All Platforms</option>
              <option>Website</option>
              <option>Mobile App</option>
              <option>Social Media</option>
            </select>
            
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="dd-mm-yyyy"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="absolute right-2 top-2 text-gray-400">
                <i className="ri-calendar-line"></i>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search ads..."
                className="px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
            <i className="ri-download-line"></i>
            <span>Export Report</span>
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="reports" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#FDF8F4] shadow-sm py-4 px-6">
          <div className="flex items-center">
            <div className="flex items-center text-sm text-gray-500">
              <a href="#" className="hover:text-primary">Admin</a>
              <i className="ri-arrow-right-s-line mx-2"></i>
              <span className="text-gray-700 font-medium">Reports</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Report Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'booking-reports', label: 'Booking Reports' },
                  { id: 'user-activity', label: 'User Activity' },
                  { id: 'vendor-reports', label: 'Vendor Reports' },
                  { id: 'feedback-complaints', label: 'Feedback & Complaints' },
                  { id: 'comments', label: 'Comments' },
                  { id: 'event-reports', label: 'Event Reports' },
                  { id: 'footfall-logs', label: 'Footfall Logs' },
                  { id: 'sentiment-reports', label: 'Sentiment Reports' },
                  { id: 'authentication-report', label: 'Authentication Report' },
                  { id: 'ad-performance', label: 'Ad Performance' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReportTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeReportTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Report Content */}
          {renderReportContent()}
        </div>

        {/* Block Confirmation Dialog */}
        {showBlockDialog && selectedSession && (
          <BlockConfirmationDialog
            isOpen={showBlockDialog}
            onClose={() => setShowBlockDialog(false)}
            onConfirm={() => {
              // Handle block user confirmation
              setShowBlockDialog(false);
            }}
            userName={selectedSession.userName}
            userEmail={`${selectedSession.userName.toLowerCase().replace(' ', '.')}@example.com`}
          />
        )}

        {/* Booking Details Dialog */}
        {showBookingDetailsDialog && selectedBooking && (
          <BookingDetailsDialog
            isOpen={showBookingDetailsDialog}
            onClose={() => setShowBookingDetailsDialog(false)}
            bookingData={{
              bookingId: selectedBooking.id,
              dateTime: selectedBooking.dateTime,
              amount: selectedBooking.amount,
              entity: selectedBooking.entity,
              vendorGuide: selectedBooking.vendorGuide,
              paymentMode: selectedBooking.paymentMode,
              customer: selectedBooking.user,
              phone: "+91 98765 43210", // Sample phone
              email: "customer@example.com", // Sample email
              status: selectedBooking.status
            }}
          />
        )}

        {/* Booking Report Dialog */}
        {showBookingReportDialog && selectedBooking && (
          <BookingReportDialog
            isOpen={showBookingReportDialog}
            onClose={() => setShowBookingReportDialog(false)}
            bookingData={{
              bookingId: selectedBooking.id,
              dateTime: selectedBooking.dateTime,
              amount: selectedBooking.amount,
              entity: selectedBooking.entity,
              vendorGuide: selectedBooking.vendorGuide,
              paymentMode: selectedBooking.paymentMode,
              customer: selectedBooking.user,
              phone: "+91 98765 43210", // Sample phone
              email: "customer@example.com", // Sample email
              status: selectedBooking.status
            }}
          />
        )}

        {/* View Session Dialog */}
        {showViewSessionDialog && selectedSession && (
          <ViewSessionDialog
            isOpen={showViewSessionDialog}
            onClose={() => setShowViewSessionDialog(false)}
            sessionData={selectedSession}
          />
        )}

        {/* Block Vendor Dialog */}
        {showBlockVendorDialog && selectedVendor && (
          <BlockVendorDialog
            isOpen={showBlockVendorDialog}
            onClose={() => setShowBlockVendorDialog(false)}
            onConfirm={() => {
              // Handle block vendor confirmation
              setShowBlockVendorDialog(false);
            }}
            vendorName={selectedVendor.vendorName}
            vendorType={selectedVendor.type}
          />
        )}

        {/* Vendor Details Dialog */}
        {showVendorDetailsDialog && selectedVendor && (
          <VendorDetailsDialog
            isOpen={showVendorDetailsDialog}
            onClose={() => setShowVendorDetailsDialog(false)}
            vendorData={selectedVendor}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
