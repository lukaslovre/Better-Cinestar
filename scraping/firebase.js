var admin = require("firebase-admin");

var serviceAccount = require("./bettercinestar-firebase-adminsdk-ocrbf-c64da3ff38.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadMoviesToFirestore(movies) {
  await deleteCollection("Movies", 100);

  const moviesCollection = db.collection("Movies");

  try {
    await Promise.all(
      movies.map((movie) => {
        return moviesCollection.doc(movie.id).set(movie);
      })
    );
    console.log("All movies uploaded successfully");
  } catch (error) {
    console.error("Error uploading movies: ", error);
  }
}

async function uploadPerformancesToFirestore(performances) {
  await deleteCollection("Performances", 100);

  const performancesCollection = db.collection("Performances");

  try {
    await Promise.all(
      performances.map((performance) => {
        return performancesCollection.doc(performance.id).set(performance);
      })
    );
    console.log("All performances uploaded successfully");
  } catch (error) {
    console.error("Error uploading performances: ", error);
  }
}

async function deleteCollection(collectionName, batchSize) {
  const collectionRef = db.collection(collectionName);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

module.exports = { uploadMoviesToFirestore, uploadPerformancesToFirestore };

// example movie and performance objects
//
// MOVIE:
// {
//     id: '02610000012FEPADHG',
//     filmNumber: 5451,
//     filmEDI: '',
//     countries: [ 'SAD' ],
//     productionYear: '2023',
//     name: 'Samo ne ti',
//     title: 'Samo ne ti',
//     ticketTitle: 'Samo ne ti',
//     originalTitle: 'Anyone but you ',
//     lengthInMinutes: 103,
//     synopsis: 'U komediji Samo ne ti, Bea (Sydney Sweeney) i Ben (Glen Powell) izgledaju kao savršen par, ali nakon nevjerojatnog prvog spoja dogodi se nešto što njihovu vatrenu privlačnost pretvori u ledenu - sve dok se neočekivano ne nađu zajedno na vjenčanju u Australiji. Stoga čine ono što bi učinile bilo koje dvije zrele odrasle osobe - pretvaraju se da su par.',
//     imageUrl: 'https://contentservice.cineorder.shop/contents/img?q=68HqXD6MGH9SmgAAFEPAHTb',
//     genres: [ 'Komedija' ],
//     nationwideStart: '2023-12-28',
//     ageRating: '15',
//     ageRatingInformation: { name: '15', acceptanceMethod: 'none' },
//     director: 'Will Gluck',
//     duration: '1h 44m',
//     letterboxdUrl: 'https://letterboxd.com/film/anyone-but-you/',
//     letterboxdRating: '3.2',
//     imdbUrl: 'http://www.imdb.com/title/tt26047818/maindetails',
//     imdbRating: 6.7,
//     englishCategories: [ 'Romance', 'Comedy' ],
//     englishSynopsis: "After an amazing first date, Bea and Ben's fiery attraction turns ice cold — until they find themselves unexpectedly reunited at a destination wedding in Australia. So they do what any two mature adults would do: pretend to be a couple.",
//     trailerLink: 'https://www.youtube.com/watch?v=gbjdSlTHFts',
//     englishDirectors: [
//       {
//         name: 'Will Gluck',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/facxxJZFpnoufJIY4jU9mC7RGKx.jpg',
//         lbUrl: 'https://letterboxd.com/director/will-gluck/'
//       }
//     ],
//     posterUrl: 'https://a.ltrbxd.com/resized/film-poster/9/6/6/9/9/0/966990-anyone-but-you-0-230-0-345-crop.jpg?v=62514c5b09',
//     actors: [
//       {
//         name: 'Sydney Sweeney',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/wrPmsC9YATcnyAxvXEdGshccbqU.jpg',
//         lbUrl: 'https://letterboxd.com/actor/sydney-sweeney/'
//       },
//       {
//         name: 'Glen Powell',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/lRbbndkwOXyvep9Y7kHiwbh9Ji5.jpg',
//         lbUrl: 'https://letterboxd.com/actor/glen-powell/'
//       },
//       {
//         name: 'Alexandra Shipp',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/4GOxIqnQXK5iGINdFDBlIQYa519.jpg',
//         lbUrl: 'https://letterboxd.com/actor/alexandra-shipp/'
//       },
//       {
//         name: 'Michelle Hurd',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/cdFf791CMSWvCNH1wksf32oPT2e.jpg',
//         lbUrl: 'https://letterboxd.com/actor/michelle-hurd/'
//       },
//       {
//         name: 'Bryan Brown',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/x0NqVqpJSET0oVdJxbbwwd7hrFA.jpg',
//         lbUrl: 'https://letterboxd.com/actor/bryan-brown/'
//       },
//       {
//         name: 'Darren Barnet',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/z3hQP19QgHsKZ4j0sXNzrhScDMO.jpg',
//         lbUrl: 'https://letterboxd.com/actor/darren-barnet/'
//       },
//       {
//         name: 'Hadley Robinson',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/rZ7O1iAb8JAdaUk4D6yKrNG4WbH.jpg',
//         lbUrl: 'https://letterboxd.com/actor/hadley-robinson/'
//       },
//       {
//         name: 'Dermot Mulroney',
//         portraitUrl: 'https://image.tmdb.org/t/p/w138_and_h175_face/5gJszOF45KMPB5tmAbKdK0qgQBx.jpg',
//         lbUrl: 'https://letterboxd.com/actor/dermot-mulroney/'
//       }
//     ],
//     durationMins: 104
//   }
//
// PERFORMANCE:
//   {
//     id: '63676000023KBHTNGF',
//     name: 'Samo ne ti',
//     title: 'Samo ne ti',
//     ticketTitle: 'Samo ne ti',
//     displayTitle: 'Samo ne ti',
//     performanceDateTime: '2024-02-06T19:45:00+01:00',
//     cinemaDate: '2024-02-06',
//     auditoriumName: 'BC 2',
//     auditoriumNumber: 2,
//     auditoriumId: '11000000015OCPXCOG',
//     auditorium: { id: '11000000015OCPXCOG', name: 'BC 2', number: 2 },
//     releaseTypeName: 'TITL',
//     releaseTypeNumber: 30,
//     is3D: false,
//     filmId: '02610000012FEPADHG',
//     filmTitle: 'Samo ne ti',
//     filmReleaseId: '15400000572FEPADHG',
//     weekfilmSortOrderPrio: 409,
//     access: { reservationsOnly: false, salesOnly: true, viewOnly: false },
//     useAssignedSeating: true,
//     filmReleaseCode: '',
//     limitations: { purchaseUntil: '2024-02-06T19:55:00+01:00' },
//     performanceTime: '19:45',
//     performanceFeatures: [ '2D', 'TITL' ],
//     cinemaOid: '10000000014OCPXCOG'
//   }
