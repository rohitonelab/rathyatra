import React from 'react';

interface StructuredDataProps {
  type: 'Event' | 'LocalBusiness' | 'BreadcrumbList' | 'Organization';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    let structuredData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };
    
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);
  
  return null;
};

// Event Schema for Rath Yatra
export const RathYatraEventSchema = () => {
  const eventData = {
    '@type': 'Event',
    name: 'जय जगन्नाथ रथ यात्रा 2026',
    description: 'भगवान जगन्नाथ की पवित्र रथ यात्रा का लाइव दर्शन। Jagannath Rath Yatra Live Darshan.',
    startDate: '2026-07-16T09:30:00+05:30',
    endDate: '2026-07-16T17:00:00+05:30',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Jagannath Temple, Puri',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Puri',
        addressRegion: 'Odisha',
        postalCode: '752001',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 19.8108,
        longitude: 85.8335,
      },
    },
    offers: {
      '@type': 'Offer',
      url: 'https://rathyatra.rohitonelab.com',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Jagannath Temple, Puri',
      url: 'https://jagannathtemple.com',
    },
    image: 'https://rathyatra.rohitonelab.com/og-image.jpg',
    url: 'https://rathyatra.rohitonelab.com',
    inLanguage: ['hi', 'en'],
  };
  
  return <StructuredData type="Event" data={eventData} />;
};

// Organization Schema
export const OrganizationSchema = () => {
  const orgData = {
    '@type': 'Organization',
    name: 'Jagannath Rath Yatra Live',
    url: 'https://rathyatra.rohitonelab.com',
    logo: 'https://rathyatra.rohitonelab.com/logo.png',
    description: 'भगवान जगन्नाथ की पवित्र रथ यात्रा का लाइव दर्शन प्लेटफॉर्म',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@rathyatra.rohitonelab.com',
      availableLanguage: ['Hindi', 'English'],
    },
    sameAs: [
      'https://www.youtube.com/channel/jagannath-live',
      'https://www.facebook.com/rathyatra',
      'https://www.twitter.com/rathyatra',
    ],
  };
  
  return <StructuredData type="Organization" data={orgData} />;
};

export default StructuredData;