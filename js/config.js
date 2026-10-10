/* ==========================================================
   Crystal Cliff Schools - central configuration
   Edit values here; every page reads from this file.
   Leave a value as "" if unknown. Nothing is invented.
   ========================================================== */

const SCHOOL = {
  /* ---------- Identity ---------- */
  name: "Crystal Cliff Schools",
  shortName: "Crystal Cliff",
  motto: "Our Value Our Treasure",
  founded: 2018,
  tagline: "Nurturing minds. Building character.", // change when the school gives its own
  logo: "assets/logo.png",
  favicon: "assets/favicon.png",

  /* ---------- Contact ---------- */
  contact: {
    phone: "+234 803 898 2612",
    whatsapp: "2348038982612",   // digits only, country code first, no + and no leading 0
    email: "",                   // add when the school email is ready
    address: "",                 // add the full street address after your visit
    city: "",
    country: "Nigeria"
  },

  /* ---------- Location / map ---------- */
  location: {
    lat: null,          // set after you visit the school
    lng: null,
    mapEmbedUrl: "",    // paste the Google Maps embed link once the listing is approved
    mapsLink: ""        // short "share" link from Google Maps
  },

  /* ---------- School hours ---------- */
  hours: {
    timezone: "Africa/Lagos",
    days: [1, 2, 3, 4, 5],    // 0 = Sunday ... 6 = Saturday (confirm the school days)
    open: "07:30",
    close: "16:00"
  },

  /* ---------- Admissions ---------- */
  admissions: {
    open: true,               // shows or hides the "Admissions Open" banner
    session: "",              // e.g. "2026/2027"
    nextTermStart: "",        // "YYYY-MM-DD"; leave "" to hide the countdown
    // CONFIRM these with the school before launch
    levels: ["Nursery", "Primary", "Secondary"],
    fees: ""                  // leave "" until the school provides fees
  },

  /* ---------- People ---------- */
  proprietor: {
    name: "",
    title: "Proprietor",
    message: "",              // welcome note; placeholder shown if empty
    photo: ""
  },

  /* ---------- Social links ---------- */
  social: {
    facebook: "",
    instagram: "",
    x: "",
    youtube: ""
  },

  /* ---------- Announcement bar ---------- */
  announcement: {
    enabled: false,
    text: ""
  },

  /* ---------- Brand colours ----------
     primary = logo sky blue
     navy    = ash grey from the uniform (key name kept so other files still work)
     gold    = burnt orange from the uniform (key name kept so other files still work)
     Adjust these values to tune the whole site. */
  theme: {
    primary: "#29ABE2",
    primaryDark: "#1B86B8",
    navy: "#3A4046",
    gold: "#CC5500",
    light: "#F4FAFE"
  },

  /* ---------- Navigation ---------- */
  nav: [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html" },
    { label: "Academics", href: "academics.html" },
    { label: "Admissions", href: "admissions.html" },
    { label: "Gallery", href: "gallery.html" },
    { label: "Contact", href: "contact.html" }
  ]
};

/* ==========================================================
   Helpers used by main.js and forms.js
   ========================================================== */
const hasValue = (v) => typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined;

const telLink = () => hasValue(SCHOOL.contact.phone) ? `tel:${SCHOOL.contact.phone.replace(/\s/g, "")}` : "";

const mailLink = () => hasValue(SCHOOL.contact.email) ? `mailto:${SCHOOL.contact.email}` : "";

const whatsappLink = (message = "") => {
  if (!hasValue(SCHOOL.contact.whatsapp)) return "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${SCHOOL.contact.whatsapp}${text}`;
};

const directionsLink = () => {
  const { lat, lng } = SCHOOL.location;
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const q = [SCHOOL.name, SCHOOL.contact.address, SCHOOL.contact.city].filter(hasValue).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
};

const yearsSinceFounded = () => new Date().getFullYear() - SCHOOL.founded;

/* Expose for other scripts */
window.SCHOOL = SCHOOL;
window.SchoolHelpers = { hasValue, telLink, mailLink, whatsappLink, directionsLink, yearsSinceFounded };