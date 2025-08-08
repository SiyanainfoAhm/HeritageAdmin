import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ManageViewDetailsDialog from '../components/ManageViewDetailsDialog';
import BlockConfirmationDialog from '../components/BlockConfirmationDialog';

interface HeritageSiteData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface LocalGuideData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface EventOperatorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface EventFestivalData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface ArtisanData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface FoodVendorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface HotelData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface TourOperatorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface ManageProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const Manage: React.FC<ManageProps> = ({ onPageChange, onLogout }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('heritage-sites');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedSite, setSelectedSite] = useState<HeritageSiteData | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<LocalGuideData | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<EventOperatorData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventFestivalData | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanData | null>(null);
  const [selectedFoodVendor, setSelectedFoodVendor] = useState<FoodVendorData | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null);
  const [selectedTourOperator, setSelectedTourOperator] = useState<TourOperatorData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [siteToBlock, setSiteToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [guideToBlock, setGuideToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [operatorToBlock, setOperatorToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [eventToBlock, setEventToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [artisanToBlock, setArtisanToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [foodVendorToBlock, setFoodVendorToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [hotelToBlock, setHotelToBlock] = useState<{ name: string; subtitle: string } | null>(null);
  const [tourOperatorToBlock, setTourOperatorToBlock] = useState<{ name: string; subtitle: string } | null>(null);

  // Mock data for Heritage Sites
  const mockHeritageSites: HeritageSiteData[] = [
    {
      id: '1',
      name: 'Adalaj Stepwell',
      subtitle: '15th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 10, 2025'
    },
    {
      id: '2',
      name: 'Sidi Saiyyed Mosque',
      subtitle: '16th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 28, 2025'
    },
    {
      id: '3',
      name: 'Bhadra Fort',
      subtitle: '15th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Draft',
      createdOn: 'June 2, 2025'
    },
    {
      id: '4',
      name: 'Sarkhej Roza',
      subtitle: '15th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '5',
      name: 'Jama Masjid',
      subtitle: '15th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 5, 2025'
    },
    {
      id: '6',
      name: 'Rani Sipri Mosque',
      subtitle: '16th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '7',
      name: 'Hutheesing Jain Temple',
      subtitle: '19th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 12, 2025'
    },
    {
      id: '8',
      name: 'Calico Museum',
      subtitle: '20th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 8, 2025'
    },
    {
      id: '9',
      name: 'Kankaria Lake',
      subtitle: '15th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 25, 2025'
    },
    {
      id: '10',
      name: 'Law Garden',
      subtitle: '20th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 18, 2025'
    },
    {
      id: '11',
      name: 'Victoria Garden',
      subtitle: '19th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 30, 2025'
    },
    {
      id: '12',
      name: 'Sabarmati Ashram',
      subtitle: '20th Century',
      type: 'Heritage',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 1, 2025'
    }
  ];

  // Mock data for Local Guides
  const mockLocalGuides: LocalGuideData[] = [
    {
      id: '1',
      name: 'Rajesh Patel',
      subtitle: 'Heritage Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 3, 2025'
    },
    {
      id: '2',
      name: 'Sanjay Mehta',
      subtitle: 'Cultural Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 22, 2025'
    },
    {
      id: '3',
      name: 'Priya Desai',
      subtitle: 'History Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 1, 2025'
    },
    {
      id: '4',
      name: 'Amit Shah',
      subtitle: 'Architecture Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 30, 2025'
    },
    {
      id: '5',
      name: 'Neha Gupta',
      subtitle: 'Art Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 25, 2025'
    },
    {
      id: '6',
      name: 'Rahul Sharma',
      subtitle: 'Food Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '7',
      name: 'Kavita Patel',
      subtitle: 'Religious Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 18, 2025'
    },
    {
      id: '8',
      name: 'Vikram Singh',
      subtitle: 'Photography Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '9',
      name: 'Anjali Mehta',
      subtitle: 'Literature Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 12, 2025'
    },
    {
      id: '10',
      name: 'Deepak Kumar',
      subtitle: 'Music Expert',
      type: 'Guide',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 10, 2025'
    }
  ];

  // Mock data for Event Operators
  const mockEventOperators: EventOperatorData[] = [
    {
      id: '1',
      name: 'Garba Fest Organizers',
      subtitle: 'Cultural Events',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 25, 2025'
    },
    {
      id: '2',
      name: 'Navratri Events Ltd.',
      subtitle: 'Festival Management',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 2, 2025'
    },
    {
      id: '3',
      name: 'Kite Festival Group',
      subtitle: 'Annual Event',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Blocked',
      createdOn: 'May 18, 2025'
    },
    {
      id: '4',
      name: 'Diwali Celebrations Co.',
      subtitle: 'Festival Events',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 30, 2025'
    },
    {
      id: '5',
      name: 'Holi Festival Organizers',
      subtitle: 'Cultural Celebrations',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 22, 2025'
    },
    {
      id: '6',
      name: 'Republic Day Events',
      subtitle: 'National Celebrations',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '7',
      name: 'Independence Day Group',
      subtitle: 'Patriotic Events',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 12, 2025'
    },
    {
      id: '8',
      name: 'Christmas Celebrations',
      subtitle: 'Holiday Events',
      type: 'Operator',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 8, 2025'
    }
  ];

  // Mock data for Events/Festivals
  const mockEventsFestivals: EventFestivalData[] = [
    {
      id: '1',
      name: 'Manek Chowk Heritage Walk',
      subtitle: 'Daily Tour',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 5, 2025'
    },
    {
      id: '2',
      name: 'Sarkhej Roza Night Tour',
      subtitle: 'Weekly Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 28, 2025'
    },
    {
      id: '3',
      name: 'Navratri Festival 2025',
      subtitle: 'Annual Festival',
      type: 'Festival',
      location: 'Ahmedabad',
      status: 'Draft',
      createdOn: 'June 1, 2025'
    },
    {
      id: '4',
      name: 'Kite Festival 2026',
      subtitle: 'Annual Festival',
      type: 'Festival',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '5',
      name: 'Diwali Celebrations 2025',
      subtitle: 'Festival Event',
      type: 'Festival',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '6',
      name: 'Holi Color Festival',
      subtitle: 'Cultural Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 12, 2025'
    },
    {
      id: '7',
      name: 'Republic Day Parade',
      subtitle: 'National Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 10, 2025'
    },
    {
      id: '8',
      name: 'Independence Day Celebrations',
      subtitle: 'Patriotic Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 8, 2025'
    },
    {
      id: '9',
      name: 'Christmas Market',
      subtitle: 'Holiday Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 5, 2025'
    }
  ];

  // Mock data for Artisans
  const mockArtisans: ArtisanData[] = [
    {
      id: '1',
      name: 'Rekha Devi',
      subtitle: 'Bandhej Craftsperson',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 1, 2025'
    },
    {
      id: '2',
      name: 'Mohan Kumar',
      subtitle: 'Zari Worker',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Blocked',
      createdOn: 'May 15, 2025'
    },
    {
      id: '3',
      name: 'Sunita Patel',
      subtitle: 'Jute Handicrafts',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 28, 2025'
    },
    {
      id: '4',
      name: 'Rajesh Mehta',
      subtitle: 'Pottery Artist',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '5',
      name: 'Lakshmi Devi',
      subtitle: 'Embroidery Expert',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 12, 2025'
    },
    {
      id: '6',
      name: 'Arun Singh',
      subtitle: 'Wood Carver',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 8, 2025'
    },
    {
      id: '7',
      name: 'Geeta Sharma',
      subtitle: 'Block Print Artist',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 5, 2025'
    },
    {
      id: '8',
      name: 'Vikram Patel',
      subtitle: 'Metal Craftsman',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 2, 2025'
    }
  ];

  // Mock data for Food Vendors
  const mockFoodVendors: FoodVendorData[] = [
    {
      id: '1',
      name: 'Das Khaman House',
      subtitle: 'Street Food',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '2',
      name: 'Bhatiyar Gali Stalls',
      subtitle: 'Street Food',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 2, 2025'
    },
    {
      id: '3',
      name: 'Manek Chowk Food Stalls',
      subtitle: 'Night Food Market',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Blocked',
      createdOn: 'May 25, 2025'
    },
    {
      id: '4',
      name: 'Law Garden Food Court',
      subtitle: 'Street Food',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 18, 2025'
    },
    {
      id: '5',
      name: 'Kankaria Food Zone',
      subtitle: 'Food Court',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '6',
      name: 'Vastrapur Food Market',
      subtitle: 'Street Food',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 12, 2025'
    },
    {
      id: '7',
      name: 'Satellite Food Stalls',
      subtitle: 'Street Food',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 10, 2025'
    },
    {
      id: '8',
      name: 'Navrangpura Food Court',
      subtitle: 'Food Court',
      type: 'Food',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 8, 2025'
    }
  ];

  // Mock data for Hotels
  const mockHotels: HotelData[] = [
    {
      id: '1',
      name: 'House of MG',
      subtitle: 'Heritage Hotel',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 20, 2025'
    },
    {
      id: '2',
      name: 'Divan\'s Heritage',
      subtitle: 'Boutique Homestay',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Blocked',
      createdOn: 'June 1, 2025'
    },
    {
      id: '3',
      name: 'French Haveli',
      subtitle: 'Heritage Homestay',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 28, 2025'
    },
    {
      id: '4',
      name: 'Ahmedabad Heritage Hotel',
      subtitle: 'Heritage Hotel',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '5',
      name: 'Gujarat Tourism Hotel',
      subtitle: 'Government Hotel',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 12, 2025'
    },
    {
      id: '6',
      name: 'Sabarmati Ashram Guest House',
      subtitle: 'Heritage Guest House',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 10, 2025'
    },
    {
      id: '7',
      name: 'Calico Museum Guest House',
      subtitle: 'Museum Guest House',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 8, 2025'
    },
    {
      id: '8',
      name: 'Sarkhej Roza Guest House',
      subtitle: 'Heritage Guest House',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 5, 2025'
    }
  ];

  // Mock data for Tour Operators
  const mockTourOperators: TourOperatorData[] = [
    {
      id: '1',
      name: 'Sabarmati Tours',
      subtitle: 'River Front Packages',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'June 2, 2025'
    },
    {
      id: '2',
      name: 'Pols Tour Company',
      subtitle: 'Heritage Walks',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Blocked',
      createdOn: 'May 25, 2025'
    },
    {
      id: '3',
      name: 'Gujarat Travels',
      subtitle: 'Cultural Tours',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 18, 2025'
    },
    {
      id: '4',
      name: 'Ahmedabad Heritage Tours',
      subtitle: 'Heritage Packages',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 15, 2025'
    },
    {
      id: '5',
      name: 'Stepwell Adventures',
      subtitle: 'Adventure Tours',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Review',
      createdOn: 'May 12, 2025'
    },
    {
      id: '6',
      name: 'Cultural Heritage Tours',
      subtitle: 'Cultural Packages',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 10, 2025'
    },
    {
      id: '7',
      name: 'Gujarat Discovery Tours',
      subtitle: 'Discovery Packages',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 8, 2025'
    },
    {
      id: '8',
      name: 'Heritage Walk Tours',
      subtitle: 'Walking Tours',
      type: 'Tour',
      location: 'Ahmedabad',
      status: 'Active',
      createdOn: 'May 5, 2025'
    }
  ];

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetails = (item: HeritageSiteData | LocalGuideData | EventOperatorData | EventFestivalData | ArtisanData | FoodVendorData | HotelData | TourOperatorData) => {
    if (activeTab === 'heritage-sites') {
      setSelectedSite(item as HeritageSiteData);
    } else if (activeTab === 'local-guides') {
      setSelectedGuide(item as LocalGuideData);
    } else if (activeTab === 'event-operators') {
      setSelectedOperator(item as EventOperatorData);
    } else if (activeTab === 'events-festivals') {
      setSelectedEvent(item as EventFestivalData);
    } else if (activeTab === 'artisans') {
      setSelectedArtisan(item as ArtisanData);
    } else if (activeTab === 'food-vendors') {
      setSelectedFoodVendor(item as FoodVendorData);
    } else if (activeTab === 'hotels') {
      setSelectedHotel(item as HotelData);
    } else if (activeTab === 'tour-operators') {
      setSelectedTourOperator(item as TourOperatorData);
    }
    setShowDetailsDialog(true);
  };

  const handleBlockItem = (item: HeritageSiteData | LocalGuideData | EventOperatorData | EventFestivalData | ArtisanData | FoodVendorData | HotelData | TourOperatorData) => {
    if (activeTab === 'heritage-sites') {
      setSiteToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'local-guides') {
      setGuideToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'event-operators') {
      setOperatorToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'events-festivals') {
      setEventToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'artisans') {
      setArtisanToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'food-vendors') {
      setFoodVendorToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'hotels') {
      setHotelToBlock({ name: item.name, subtitle: item.subtitle });
    } else if (activeTab === 'tour-operators') {
      setTourOperatorToBlock({ name: item.name, subtitle: item.subtitle });
    }
    setShowBlockDialog(true);
  };

  const handleConfirmBlock = () => {
    // Here you would typically make an API call to block the item
    console.log('Item blocked:', 
      activeTab === 'heritage-sites' ? siteToBlock : 
      activeTab === 'local-guides' ? guideToBlock : 
      activeTab === 'event-operators' ? operatorToBlock : 
      activeTab === 'events-festivals' ? eventToBlock :
      activeTab === 'artisans' ? artisanToBlock :
      activeTab === 'food-vendors' ? foodVendorToBlock :
      activeTab === 'hotels' ? hotelToBlock :
      tourOperatorToBlock
    );
    // Update the item status in the mock data
    // For now, we'll just close the dialog
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'heritage-sites':
        return mockHeritageSites;
      case 'local-guides':
        return mockLocalGuides;
      case 'event-operators':
        return mockEventOperators;
      case 'events-festivals':
        return mockEventsFestivals;
      case 'artisans':
        return mockArtisans;
      case 'food-vendors':
        return mockFoodVendors;
      case 'hotels':
        return mockHotels;
      case 'tour-operators':
        return mockTourOperators;
      default:
        return mockHeritageSites;
    }
  };

  // Pagination
  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const navigationTabs = [
    { id: 'heritage-sites', name: 'Heritage Sites' },
    { id: 'local-guides', name: 'Local Guides' },
    { id: 'event-operators', name: 'Event Operators' },
    { id: 'events-festivals', name: 'Events/Festivals' },
    { id: 'artisans', name: 'Artisans' },
    { id: 'food-vendors', name: 'Food Vendors' },
    { id: 'hotels', name: 'Hotels' },
    { id: 'tour-operators', name: 'Tour Operators' }
  ];

  const getTabDisplayName = (tabId: string) => {
    const tab = navigationTabs.find(t => t.id === tabId);
    return tab ? tab.name : 'Heritage Sites';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-orange-100 text-orange-800';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heritage':
        return 'bg-blue-100 text-blue-800';
      case 'Guide':
        return 'bg-purple-100 text-purple-800';
      case 'Operator':
        return 'bg-yellow-100 text-yellow-800';
      case 'Event':
        return 'bg-green-100 text-green-800';
      case 'Festival':
        return 'bg-green-100 text-green-800';
      case 'Artisan':
        return 'bg-blue-100 text-blue-800';
      case 'Food':
        return 'bg-red-100 text-red-800';
      case 'Hotel':
        return 'bg-green-100 text-green-800';
      case 'Tour':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="manage" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Header */}
        <header className="bg-[#FDF8F4] shadow-sm py-4 px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-secondary">Manage</h1>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dynamic Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">{getTabDisplayName(activeTab)}</h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>
                <button 
                  onClick={() => {
                    if (activeTab === 'heritage-sites' && onPageChange) {
                      onPageChange('add-new-heritage');
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-md hover:bg-orange-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Add New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LOCATION
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CREATED ON
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {getInitials(item.name)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdOn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleBlockItem(item)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, currentData.length)}</span> of{' '}
                    <span className="font-medium">{currentData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ManageViewDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        data={
          activeTab === 'heritage-sites' ? selectedSite : 
          activeTab === 'local-guides' ? selectedGuide : 
          activeTab === 'event-operators' ? selectedOperator : 
          activeTab === 'events-festivals' ? selectedEvent :
          activeTab === 'artisans' ? selectedArtisan :
          activeTab === 'food-vendors' ? selectedFoodVendor :
          activeTab === 'hotels' ? selectedHotel :
          selectedTourOperator
        }
      />

      <BlockConfirmationDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleConfirmBlock}
        userName={
          activeTab === 'heritage-sites' ? (siteToBlock?.name || '') : 
          activeTab === 'local-guides' ? (guideToBlock?.name || '') : 
          activeTab === 'event-operators' ? (operatorToBlock?.name || '') : 
          activeTab === 'events-festivals' ? (eventToBlock?.name || '') :
          activeTab === 'artisans' ? (artisanToBlock?.name || '') :
          activeTab === 'food-vendors' ? (foodVendorToBlock?.name || '') :
          activeTab === 'hotels' ? (hotelToBlock?.name || '') :
          (tourOperatorToBlock?.name || '')
        }
        userEmail={
          activeTab === 'heritage-sites' ? (siteToBlock?.subtitle || '') : 
          activeTab === 'local-guides' ? (guideToBlock?.subtitle || '') : 
          activeTab === 'event-operators' ? (operatorToBlock?.subtitle || '') : 
          activeTab === 'events-festivals' ? (eventToBlock?.subtitle || '') :
          activeTab === 'artisans' ? (artisanToBlock?.subtitle || '') :
          activeTab === 'food-vendors' ? (foodVendorToBlock?.subtitle || '') :
          activeTab === 'hotels' ? (hotelToBlock?.subtitle || '') :
          (tourOperatorToBlock?.subtitle || '')
        }
      />
    </div>
  );
};

export default Manage;
