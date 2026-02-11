///////
// Backend/API types
///////

interface Person {
  id?: number | null;
  name?: string | null;
  character?: string | null;
  job?: string | null;
  department?: string | null;
  profile_path?: string | null;
  profile_url?: string | null;
  profile_image_url?: string | null;
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
  ageRating?: string;
  ageRatingInformation?: AgeRatingInformation;
  countries?: string[];
  director?: string;
  filmEDI?: string;
  filmNumber?: number;
  genres?: string[];
  imageUrl?: string;
  lengthInMinutes?: number;
  name?: string;
  nationwideStart?: string; // Date string YYYY-MM-DD
  originalTitle?: string;
  productionYear?: string;
  synopsis?: string;
  ticketTitle?: string;
  title?: string;

  tmdb_movie_id?: number | null;
  tmdb_url?: string | null;
  tmdb_rating?: number | null;
  tmdb_vote_count?: number | null;
  tmdb_synopsis?: string | null;
  tmdb_genres?: { id?: number; name?: string }[] | null;
  tmdb_runtime?: number | null;
  tmdb_poster_path?: string | null;
  tmdb_poster_url?: string | null;
  tmdb_cast?: Person[] | null;
  tmdb_directors?: Person[] | null;
  tmdb_trailer_url?: string | null;

  performances?: MoviePerformance[]; // Added based on API response
  availableDates?: string[]; // Added based on API response (Date strings YYYY-MM-DD)
}

interface MoviePerformance {
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
  id: string;
  is3D?: boolean;
  limitations?: Limitations;
  name?: string;
  performanceDateTime: string; // ISO 8601 date-time string
  performanceFeatures?: string[];
  performanceTime: string; // Time string HH:MM
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

interface SeatingArea {
  id: number;
  name: string;
  useAssignedSeating: boolean;
  acceptanceMethod: string;
}

interface Seat {
  x: number;
  y: number;
  sg: number;
  stat: number;
  sar: number; // Seating Area Reference? (Matches id in seatingAreas)
}

interface SeatingLayout {
  height: number;
  width: number;
  seatingAreas: SeatingArea[];
  maxX: number;
  maxY: number;
  seats: Seat[];
}

///////
// Frontend types
///////
type LabelValue<T> = {
  label: string;
  value: T;
};

interface MovieFilters {
  cinemaOids: string[];
  selectedDate: string;
  sortBy: string;
}

interface PerformanceFilters {
  videoFeatures: string[];
  audioFeatures: string[];
  roomFeatures: string[];
  timeFrom: string; // HH:mm
  timeTo: string; // HH:mm
}
