import React from 'react';
import { Helmet } from 'react-helmet-async';
import useSettings from '../hooks/useSettings';

const SEO = ({ 
  title = "DGW Autospa - Premium Automotive Care in Lagos",
  description = "Expert automotive care services in Lagos: Tyre acquisition, wheel alignment, brake maintenance, and professional auto detailing.",
  keywords = "auto spa Lagos, car maintenance Lagos, tyre acquisition, wheel alignment, wheel balancing, brake service, auto detailing Lagos, DGW Autospa, Deep Gleam On Wheels",
  canonicalUrl = null,
  ogImage = null,
  ogType = "website",
  noIndex = false,
  noFollow = false,
  twitterCard = "summary_large_image",
  author = "DGW Autospa",
  publishedTime = null,
  modifiedTime = null,
  schemaType = "AutoRepair"
}) => {
  const { business } = useSettings();
  const siteTitle = business.businessName || "DGW Autospa";

  // Every page in this app passes its title/description/keywords/author as a
  // plain string that was written with "DGW Autospa" baked in (e.g. "Gallery
  // | DGW Autospa Portfolio"). Rather than edit 15+ page files individually,
  // we swap that literal brand name for whatever is currently set in
  // Settings, right here in one place. If the admin renames the business,
  // every page's title/meta updates automatically.
  const localize = (str) => (typeof str === 'string' ? str.replace(/DGW Autospa/gi, siteTitle) : str);
  const dynamicTitle = localize(title);
  const dynamicDescription = localize(description);
  const dynamicKeywords = localize(keywords);
  const dynamicAuthor = localize(author);

  // Only append " | Site Name" if the page's own title doesn't already
  // mention the brand (most of ours do, after localize() above).
  const fullTitle = dynamicTitle.toLowerCase().includes(siteTitle.toLowerCase())
    ? dynamicTitle
    : `${dynamicTitle} | ${siteTitle}`;

  const phoneDigits = (business.phone || "+2347025887213").replace(/\s/g, "");

  // Site URL: prefer the Settings "Website" field, then the actual host the
  // app is running on, so nothing here is tied to one hardcoded domain and
  // survives being redeployed anywhere.
  const siteUrl = business.website || (typeof window !== 'undefined' ? window.location.origin : '');
  const resolvedCanonicalUrl = canonicalUrl || siteUrl;
  const resolvedOgImage = ogImage || (siteUrl ? `${siteUrl}/images/og-image.jpg` : '');

  // Build robots meta
  let robotsContent = "";
  if (noIndex && noFollow) robotsContent = "noindex, nofollow";
  else if (noIndex) robotsContent = "noindex, follow";
  else if (noFollow) robotsContent = "index, nofollow";
  else robotsContent = "index, follow";

  // Schema.org JSON-LD for Auto Repair Shop — sourced from Settings so it
  // always matches whatever the admin has configured
  const schemaData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": siteTitle,
    "alternateName": business.tagline || "Deep Gleam On Wheels Autospa",
    "description": business.description || dynamicDescription,
    "url": resolvedCanonicalUrl,
    "logo": business.logo || (siteUrl ? `${siteUrl}/images/logo.png` : ''),
    "image": resolvedOgImage,
    "telephone": phoneDigits,
    "email": business.email || "deepgleamonwheels@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address || "4, Ibrahim Odofin Street, Idado Estate, Lekki Peninsula II, Lagos",
      "addressRegion": "Lagos",
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "6.5244",
      "longitude": "3.3792"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "19:00"
      }
    ],
    "priceRange": "₦₦",
    "sameAs": [
      business.instagram || "https://instagram.com/deepgleamonwheels",
      business.facebook || "https://facebook.com/DeepGleamOnWheelsAutospa",
      business.tiktok || "https://tiktok.com/@dgwautospa"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": phoneDigits,
      "contactType": "customer service",
      "availableLanguage": ["English"]
    }
  };

  // Add article specific schema if applicable
  const articleSchema = ogType === "article" && publishedTime ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": dynamicTitle,
    "description": dynamicDescription,
    "author": {
      "@type": "Organization",
      "name": dynamicAuthor
    },
    "publisher": {
      "@type": "Organization",
      "name": siteTitle,
      "logo": {
        "@type": "ImageObject",
        "url": business.logo || (siteUrl ? `${siteUrl}/images/logo.png` : '')
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "image": resolvedOgImage
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={dynamicDescription} />
      <meta name="keywords" content={dynamicKeywords} />
      <meta name="author" content={dynamicAuthor} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={resolvedCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={dynamicDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedCanonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_NG" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={dynamicDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:site" content="@dgwautospa" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#1E3A8A" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Favicon Links — uses the uploaded business logo when available.
          Note: since this is a client-rendered SPA, the very first paint
          (before React/Helmet mounts) still uses whatever is in index.html;
          this only overrides it once the app has loaded. */}
      {business.logo ? (
        <>
          <link rel="icon" type="image/png" href={business.logo} />
          <link rel="shortcut icon" href={business.logo} />
          <link rel="apple-touch-icon" href={business.logo} />
        </>
      ) : (
        <>
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        </>
      )}
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEO;