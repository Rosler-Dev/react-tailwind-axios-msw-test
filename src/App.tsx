import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Counter from "./components/Counter";
import TourCard from "./components/TourCard";
import { capitalize, getLocale } from "./utils";
import API from "./api/api";
import { GuestType, Direction, IGuests, ISort, ITicket, ITour, ITourReservationTicket, IToursAvailable, IToursAvailableEnhanced, ITourEnhanced } from "./types";
import BookingDialog from "./components/BookingDialog";

function getDefaultGuestsState(): IGuests {
  return ({
    adult: 1,
    child: 0,
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

function getDefaultSortDataState(): ISort<ITourEnhanced> {
  return getNewSortData("asc");
}

function App() {
  const initialized = useRef<boolean>(false);
  const [guests, setGuests] = useState<IGuests>(getDefaultGuestsState());
  const [tourData, setTourData] = useState<IToursAvailableEnhanced>(getDefaulTourDataState());
  const [sortData, setSortData] = useState<ISort<ITourEnhanced>>(getDefaultSortDataState());
  const [bookedTour, setBookedTour] = useState<ITourEnhanced | undefined>();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const guestCount = guests.adult + guests.child + guests.infant + guests.senior;

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true; // avoid second call to tours query
    const getAvailableTours = async () => {
      const result = await API.getAvailableTours();
      setTourData(enhanceTourData(result) ?? getDefaulTourDataState());
    };
    getAvailableTours();
  }, []);

  const bookTour = useCallback(async (tour: ITourEnhanced): Promise<void> => {
    const result = await API.reserveTour({
      tourId: tour.id,
      tickets: tour.ticketsToBook, 
    });
    
    if (result) {
      setBookedTour(tour);
      setBookingDialogOpen(true);
    }
  }, []);

  const handleCounterChange = useCallback((id: string, val: number): void => {
    setGuests((g) => ({
      ...g,
      [id]: val,
    }));
  }, []);

  const onBookingDialogClose = useCallback(() => {
    setBookingDialogOpen(false);
    setBookedTour(undefined);
  }, []);

  const { tours, currency } = tourData;
  const currencyFormatter = currency.currencyFormatter;
  const currencyOffset = currency.currencyOffset;
  const applicableTours = useMemo(() => tours.map(t2 => {
    const { ticketsToBook, price } = getCheapestMatchingTicketsToBook(t2, guests, currencyOffset);
    return ({...t2, ticketsToBook, price} as ITourEnhanced);
  }), [tours, guests, currencyOffset]);
  
  useMemo(() => {
    if (sortData.compareFn) {
      applicableTours.sort(sortData.compareFn)
    }
  }, [sortData, applicableTours]);

  return (
    <div className="px-5 py-2">
      <h1 className="font-bold text-2xl">Ticket Selection</h1>
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
                  hasSelection={guestCount > 0}
                  onBooking={() => bookTour(tour)}
                />
              );
            })}
          </div>
        }
      <BookingDialog isOpen={bookingDialogOpen} onClose={onBookingDialogClose} tour={bookedTour} />
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

      tour.ticketsSeatCountByName[t.name] += t.pax;
      tour.ticketsByName[t.name].push(t);
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

function canTourAccommodateGuests(tour: ITourEnhanced, guests: IGuests): boolean {
  return guests.adult <= tour.ticketsSeatCountByName.adult && guests.child <= tour.ticketsSeatCountByName.child &&
         guests.senior <= tour.ticketsSeatCountByName.senior && guests.infant <= tour.ticketsSeatCountByName.infant;
}

function getCheapestMatchingTicketsToBook(tour: ITourEnhanced, guests: IGuests, currencyOffset: number): {ticketsToBook: ITourReservationTicket[], price: number} {
  // assumes that tickets are in sorted order by price, asc.
  // although the test data doesn't have this, there could be multiple tickets of the same name (ex: Adult) that have different prices (earlybird?).
  const ticketsToBook: ITourReservationTicket[] = [];
  let price = 0;

  if (canTourAccommodateGuests(tour, guests)) {
    Object.entries(tour.ticketsByName).forEach(([name, tickets]: [string, ITicket[]]) => {
      const ticketData = _getCheapestTicketsData(tickets, guests[name as GuestType]);
      ticketsToBook.push(...ticketData.tickets);
      price += ticketData.price;
    });
  
    price *= currencyOffset;
  }

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
      if (a.ticketsToBook.length === 0 && b.ticketsToBook.length > 0) {
        return 1;
      } else if (b.ticketsToBook.length === 0 && a.ticketsToBook.length > 0) {
        return -1;
      }
      return direction === "asc" ? a.price - b.price : b.price - a.price;
    });
  }

  return newSortData;
}

export default App;
