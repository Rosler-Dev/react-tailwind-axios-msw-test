import { http, HttpResponse, delay, PathParams } from 'msw';
import API from '../../api';
import { ITourReservation, IToursAvailable } from '../../../types';

const handlers = [
  http.get<PathParams<never>, undefined, IToursAvailable>(API.Routes.availableTours, getAvailableToursResolver),
  http.post<PathParams<never>, ITourReservation, ITourReservation>(API.Routes.reserveTour, reserveTourResolver),
];

async function getAvailableToursResolver() {
  return HttpResponse.json<IToursAvailable>({
    tours: [
      {
        id: "1001",
        description: "A tour of camel fight club. Come step into the wooden ring of champions! Two mammals enter, one mammal leaves.",
        image: "https://images.pexels.com/photos/628661/pexels-photo-628661.jpeg",
        name: "Camel Fight Club Tour",
        tickets: [
          {
            id: "001",
            name: "adult",
            pax: 3,
            price: 1000
          },
          {
            id: "002",
            name: "child",
            pax: 2,
            price: 500
          },
          {
            id: "003",
            name: "senior",
            pax: 2,
            price: 800
          },
          {
            id: "004",
            name: "infant",
            pax: 1,
            price: 0
          }
        ]
      },
      {
        id: "1002",
        description: "A friendly helicopter tour. If we are double-booked, we may just have to hang you off the bottom of the craft. Wheeeee!",
        image: "https://images.pexels.com/photos/126625/pexels-photo-126625.jpeg",
        name: "Helicopter Tour",
        tickets: [
          {
            id: "005",
            name: "adult",
            pax: 7,
            price: 10000
          },
          {
            id: "006",
            name: "child",
            pax: 2,
            price: 5000
          },
          {
            id: "007",
            name: "senior",
            pax: 3,
            price: 8000
          },
          {
            id: "008",
            name: "infant",
            pax: 0,
            price: 0
          }
        ]
      },
      {
        id: "1003",
        description: "You're on a boat! Pretty self explanatory.",
        image: "https://images.pexels.com/photos/1488017/pexels-photo-1488017.jpeg",
        name: "Gondola Tour",
        tickets: [
          {
            id: "009",
            name: "adult",
            pax: 1,
            price: 2500
          },
          {
            id: "010",
            name: "child",
            pax: 3,
            price: 1500
          },
          {
            id: "011",
            name: "senior",
            pax: 1,
            price: 1600
          },
          {
            id: "012",
            name: "infant",
            pax: 3,
            price: 0
          }
        ]
      },
      {
        id: "1004",
        description: "Enter the whiskey cellar of legend! Step right in, and you might just get more than you bargained for....",
        image: "https://images.pexels.com/photos/2581022/pexels-photo-2581022.jpeg",
        name: "Black Rose Whiskey Dungeon Tour",
        tickets: [
          {
            id: "013",
            name: "adult",
            pax: 2,
            price: 50
          },
          {
            id: "014",
            name: "child",
            pax: 1,
            price: 40
          },
          {
            id: "015",
            name: "senior",
            pax: 1,
            price: 40
          },
          {
            id: "016",
            name: "infant",
            pax: 1,
            price: 5
          }
        ]
      },
      {
        id: "1005",
        description: "Have you ever wanted to jump out of an airplane so that you can plummet to your DOOM!? Well, we've got you covered. We provide the parachutes, and you provide the insanity.",
        image: "https://images.pexels.com/photos/2162689/pexels-photo-2162689.jpeg",
        name: "Sky Diving Tour",
        tickets: [
          {
            id: "017",
            name: "adult",
            pax: 2,
            price: 1700
          },
          {
            id: "018",
            name: "child",
            pax: 1,
            price: 1300
          },
          {
            id: "019",
            name: "senior",
            pax: 1,
            price: 1300
          },
          {
            id: "020",
            name: "infant",
            pax: 1,
            price: 500
          }
        ]
      }
    ],
    currency: {
      currency: "CAD",
      currencyOffset: 100
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function reserveTourResolver(obj: any) {
  const data = await obj.request.clone().json();
  await delay(150);
  return HttpResponse.json<ITourReservation>(data);
}

export default handlers;