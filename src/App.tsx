import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactLogo from "./components/ReactLogo";
import Counter from "./components/Counter";
import TourCard from "./components/TourCard";
import { capitalize, getLocale } from "./utils";
import API from "./api";
import { GuestType, Direction, IGuests, ISort, ITicket, ITour, ITourReservation, ITourReservationTicket, IToursAvailable, IToursAvailableEnhanced, ITourEnhanced } from "./types";

function getDefaultGuestsState(): IGuests {
  return ({
    adult: 1,
    child: 1,
    senior: 0,
    infant: 0,
  });
}

function getDefaulTourDataState(): IToursAvailableEnhanced {
  return ({
    tours: [],
    currency: {
      currency: "CAD",
      currencyOffset: 0,
      currencyFormatter: Intl.NumberFormat(),
    },
  });
}

function getDefaultSortDataState(): ISort<ITour> {
  return ({
    direction: "",
    compareFn: undefined,
  });
}

function App() {
  const initialized = useRef<boolean>(false);
  const [guests, setGuests] = useState<IGuests>(getDefaultGuestsState());
  const [tourData, setTourData] = useState<IToursAvailableEnhanced>(getDefaulTourDataState());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortData, setSortData] = useState<ISort<ITourEnhanced>>(getDefaultSortDataState());
  const [booking, setBooking] = useState<ITourReservation | undefined>();

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true; // avoid second call to tours query
    const getAvailableTours = async () => {
      const result = await API.getAvailableTours();
      setTourData(enhanceTourData(result) ?? getDefaulTourDataState());
      setIsLoading(false);
    };
    getAvailableTours();
  }, []);

  const bookTour = useCallback(async (id: string, tickets: ITourReservationTicket[]): Promise<void> => {
    const result = await API.reserveTour({
      tourId: id,
      tickets: tickets, 
    });
    
    if (result) {
      setBooking(result);
      setTimeout(() => setBooking(undefined), 4000);
    }
  }, []);

  const handleCounterChange = useCallback((id: string, val: number): void => {
    setGuests((g) => ({
      ...g,
      [id]: val,
    }));
  }, []);

  const { tours, currency } = tourData;
  const currencyFormatter = currency.currencyFormatter;
  const currencyOffset = currency.currencyOffset;
  const guestCount = guests.adult + guests.child + guests.senior + guests.infant;
  const applicableTours = useMemo(() => tours.filter(t1 => canTourAccommodateGuests(t1, guests, guestCount)).map(t2 => {
    const { ticketsToBook, price } = getCheapestMatchingTicketsToBook(t2, guests, currencyOffset);
    return ({...t2, ticketsToBook, price} as ITourEnhanced);
  }), [tours, guests, guestCount, currencyOffset]);
  
  useMemo(() => {
    if (sortData.compareFn) {
      applicableTours.sort(sortData.compareFn)
    }
  }, [sortData, applicableTours]);

  return (
    <div className="px-5 py-2">
      <ReactLogo className={`mb-2 ${isLoading ? 'animate-spin' : undefined}`} />
      <h1 className="font-bold text-2xl">Filters</h1>
      <div className="grid grid-cols-[auto_auto_20px_auto] max-w-60 mt-1 mb-5">
        {Object.entries(guests).map(([key, count]) => (
          <Counter
            key={key}
            label={capitalize(key)}
            value={count}
            onChange={(value: number) => handleCounterChange(key, value)}
          />
        ))}
      </div>
      <h1 className="font-bold text-2xl">Available Tours</h1>
      <div className="flex items-center mt-3 mb-6">
        <p>Sort By:</p>
        <select className="ml-2 px-1 py-0.5 border border-solid border-black" onChange={(evt) => setSortData(getNewSortData(evt.target.value as Direction))}>
          <option value="">--None--</option>
          <option value="asc">Lowest Price</option>
          <option value="desc">Highest Price</option>
        </select>
      </div>
      {!applicableTours.length
        ? <h1 className="text-xl">No Tours Available for Current Ticket Selection</h1>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-8">
            {Object.entries(applicableTours).map(([key, tour]) => {
              return (
                <TourCard
                  key={key}
                  imgSrc={tour.image}
                  name={tour.name}
                  description={tour.description}
                  price={currencyFormatter.format(tour.price)}
                  hasTickets={tour.ticketsToBook.length > 0}
                  onBooking={() => bookTour(tour.id, tour.ticketsToBook)}
                />
              );
            })}
          </div>
        }
      <div>
       {booking && <h1 className="text-3xl mt-8 animate-bounce">Tour Successfully Booked!</h1>}
      </div>
    </div>
  );
}

function enhanceTourData(tourData?: IToursAvailable): IToursAvailableEnhanced | undefined {
  if (!tourData) {
    return;
  }
  const tourDataEnhanced = {...tourData} as IToursAvailableEnhanced;
  tourDataEnhanced.tours.forEach(tour => {
    tour.ticketsSeatCountByName = {
      adult: 0,
      child: 0,
      senior: 0,
      infant: 0,
    };

    tour.ticketsByName = {
      adult: [],
      child: [],
      senior: [],
      infant: [],
    }
  
    for (const t of tour.tickets) {
      if (t.pax <= 0) {
        continue;
      }
      const name = t.name.toLowerCase() as GuestType;
      tour.ticketsSeatCountByName[name] += t.pax;
      tour.ticketsByName[name].push(t);
    }

    Object.values(tour.ticketsByName).forEach(tickets => {
      tickets.sort(lowestPriceCompareFn);
    });
  });

  tourDataEnhanced.currency.currencyOffset /= 100; // change offset to dollars
  tourDataEnhanced.currency.currencyFormatter = Intl.NumberFormat(getLocale(), { style: "currency", currency: tourDataEnhanced.currency.currency, currencyDisplay: "narrowSymbol" });

  return tourDataEnhanced;
}

function lowestPriceCompareFn(a: ITicket, b: ITicket): number {
  return a.price - b.price;
}

function canTourAccommodateGuests(tour: ITourEnhanced, guests: IGuests, guestCount: number): boolean {
  return guestCount >= tour.minPax && guestCount <= tour.maxPax && guestCount <= tour.seats && guests.adult <= tour.ticketsSeatCountByName.adult &&
         guests.child <= tour.ticketsSeatCountByName.child && guests.senior <= tour.ticketsSeatCountByName.senior && guests.infant <= tour.ticketsSeatCountByName.infant;
}

function getCheapestMatchingTicketsToBook(tour: ITourEnhanced, guests: IGuests, currencyOffset: number): {ticketsToBook: ITourReservationTicket[], price: number} {
  // assumes tour has enough tickets of the appropriate type, and that tickets are in sorted order by price, asc.
  // doing things this way because although the test data doesn't have this, there could be multiple tickets of the same name (ex: Adult) that have different prices (earlybird?).
  const ticketsToBook: ITourReservationTicket[] = [];
  let price = 0;

  Object.entries(tour.ticketsByName).forEach(([name, tickets]: [string, ITicket[]]) => {
    const ticketData = _getCheapestTicketsData(tickets, guests[name as GuestType]);
    ticketsToBook.push(...ticketData.tickets);
    price += ticketData.price;
  });

  price *= currencyOffset;

  return { ticketsToBook, price };
}

function _getCheapestTicketsData(tickets: ITicket[], count: number): {tickets: ITourReservationTicket[], price: number} {
  // assumes tickets are sorted order by price, asc.
  const ticketsData = {
    tickets: [] as ITourReservationTicket[],
    price: 0,
  };

  let remaining = count;
  for (const ticket of tickets) {
    if (remaining <= 0) {
      break;
    }

    const ticketCount = Math.min(remaining, ticket.pax);

    ticketsData.tickets.push({
      id: ticket.id,
      count: ticketCount,
    });

    ticketsData.price += (ticket.price * ticketCount);
    remaining -= ticket.pax;
  }

  return ticketsData;
}

function getNewSortData(direction: Direction) {
  const newSortData = { direction } as ISort<ITourEnhanced>;

  if (direction === "asc" || direction === 'desc') {
    newSortData.compareFn = ((a: ITourEnhanced, b: ITourEnhanced) => {
      return direction === "asc" ? a.price - b.price : b.price - a.price;
    });
  }

  return newSortData;
}

export default App;
