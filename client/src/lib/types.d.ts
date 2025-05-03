///////
// Backend/API types
///////

interface Person {
  name?: string;
  portraitUrl?: string;
  lbUrl?: string;
}

interface AgeRatingInformation {
  name?: string;
  acceptanceMethod?: string;
  displayName?: string;
  imageUrl?: string;
}

interface Access {
  reservationsOnly?: boolean;
  salesOnly?: boolean;
  viewOnly?: boolean;
}

interface AuditoriumDetails {
  id?: string;
  name?: string;
  number?: number;
  type?: string;
}

interface Limitations {
  purchaseUntil?: string; // ISO 8601 date-time string
}

interface Movie {
  id: string;
  actors?: Person[];
  ageRating?: string;
  ageRatingInformation?: AgeRatingInformation;
  countries?: string[];
  director?: string;
  duration?: string;
  durationMins?: number;
  englishCategories?: string[];
  englishDirectors?: Person[];
  englishSynopsis?: string;
  filmEDI?: string;
  filmNumber?: number;
  genres?: string[];
  imageUrl?: string;
  imdbRating?: number;
  imdbUrl?: string;
  lengthInMinutes?: number;
  letterboxdRating?: string;
  letterboxdUrl?: string;
  name?: string;
  nationwideStart?: string; // Date string YYYY-MM-DD
  originalTitle?: string;
  posterUrl?: string;
  productionYear?: string;
  synopsis?: string;
  ticketTitle?: string;
  title?: string;
  trailerLink?: string;
  performances?: Performance[]; // Added based on API response
  availableDates?: string[]; // Added based on API response (Date strings YYYY-MM-DD)
}

interface Performance {
  access?: Access;
  auditorium?: AuditoriumDetails;
  auditoriumId?: string;
  auditoriumName?: string;
  auditoriumNumber?: number;
  cinemaDate?: string; // Date string YYYY-MM-DD
  cinemaOid?: string;
  displayTitle?: string;
  filmId?: string;
  filmReleaseCode?: string;
  filmReleaseId?: string;
  filmTitle?: string;
  id?: string;
  is3D?: boolean;
  limitations?: Limitations;
  name?: string;
  performanceDateTime?: string; // ISO 8601 date-time string
  performanceFeatures?: string[];
  performanceTime?: string; // Time string HH:MM
  releaseTypeName?: string;
  releaseTypeNumber?: number;
  ticketTitle?: string;
  title?: string;
  useAssignedSeating?: boolean;
  weekfilmSortOrderPrio?: number;
}

interface PerformanceDates {
  cinemaOid?: string;
  filmId?: string;
  date?: any; // Assuming JSON maps to any, adjust if needed - Consider string[] if it's like availableDates
}

interface Analytics {
  uniqueVisitors?: string;
  userAgent?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  createdAt?: Date; // Added because timestamps: true
}

///////
// Frontend types
///////
type CardDesign = 'v1' | 'v2';

type LabelValue<T> = {
  label: string;
  value: T;
};
