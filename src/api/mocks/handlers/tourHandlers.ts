import { http, HttpResponse, delay } from 'msw';
import API from '../../api';

const handlers = [
  http.get(API.Routes.availableTours, getAvailableToursResolver),
  http.post(API.Routes.reserveTour, reserveTourResolver),
];

async function getAvailableToursResolver() {
  // return new HttpResponse(null, { status: 404 });

  return HttpResponse.json({
    tours: [
      {
        id: "1001",
        description: "A tour of the local camel farm.",
        image: "https://images.pexels.com/photos/628661/pexels-photo-628661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        maxPax: 8,
        minPax: 0,
        name: "Camel Farm Tour",
        seats: 3,
        tickets: [
          {
            id: "001",
            name: "Adult",
            pax: 1,
            price: 1000
          },
          {
            id: "002",
            name: "Child",
            pax: 1,
            price: 500
          },
          {
            id: "003",
            name: "Senior",
            pax: 1,
            price: 800
          },
          {
            id: "004",
            name: "Infant",
            pax: 1,
            price: 0
          }
        ]
      },
      {
        id: "1002",
        description: "A tour of the local helicopter farm.",
        image: "https://images.pexels.com/photos/126625/pexels-photo-126625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        maxPax: 6,
        minPax: 2,
        name: "Helicopter tour",
        seats: 6,
        tickets: [
          {
            id: "005",
            name: "Adult",
            pax: 1,
            price: 10000
          },
          {
            id: "006",
            name: "Child",
            pax: 1,
            price: 5000
          },
          {
            id: "007",
            name: "Senior",
            pax: 1,
            price: 8000
          },
          {
            id: "008",
            name: "Infant",
            pax: 0,
            price: 0
          }
        ]
      },
      {
        id: "1003",
        description: "You're on a boat!",
        image: "https://images.pexels.com/photos/1488017/pexels-photo-1488017.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        maxPax: 4,
        minPax: 1,
        name: "Gondola Tour",
        seats: 6,
        tickets: [
          {
            id: "009",
            name: "Adult",
            pax: 1,
            price: 2500
          },
          {
            id: "010",
            name: "Child",
            pax: 1,
            price: 1500
          },
          {
            id: "011",
            name: "Senior",
            pax: 1,
            price: 1600
          },
          {
            id: "012",
            name: "Infant",
            pax: 0,
            price: 0
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

async function reserveTourResolver(request: any) {
  // return HttpResponse.json(request.clone());

  return HttpResponse.json({
    tourId: "1001",
    tickets: [
      {
        id: "001",
        count: 1
      },
      {
        id: "002",
        count: 1
      }
    ]
  })
}

export default handlers;