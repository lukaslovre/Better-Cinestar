///////
// Backend/API types
///////

interface Movie {
  actors?: any;
  ageRating?: string;
  ageRatingInformation?: any;
  countries?: any;
  director?: string;
  duration?: string;
  durationMins?: number;
  englishCategories?: any;
  englishDirectors?: any;
  englishSynopsis?: string;
  filmEDI?: string;
  filmNumber?: number;
  genres?: any;
  id?: string;
  imageUrl?: string;
  imdbRating?: number;
  imdbUrl?: string;
  lengthInMinutes?: number;
  letterboxdRating?: string;
  letterboxdUrl?: string;
  name?: string;
  nationwideStart?: string;
  originalTitle?: string;
  posterUrl?: string;
  productionYear?: string;
  synopsis?: string;
  ticketTitle?: string;
  title?: string;
  trailerLink?: string;
}

interface Performance {
  access?: any;
  auditorium?: any;
  auditoriumId?: string;
  auditoriumName?: string;
  auditoriumNumber?: number;
  cinemaDate?: string;
  cinemaOid?: string;
  displayTitle?: string;
  filmId?: string;
  filmReleaseCode?: string;
  filmReleaseId?: string;
  filmTitle?: string;
  id?: string;
  is3D?: boolean;
  limitations?: any;
  name?: string;
  performanceDateTime?: string;
  performanceFeatures?: any;
  performanceTime?: string;
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
  date?: any; // Assuming JSON maps to any, adjust if needed
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
