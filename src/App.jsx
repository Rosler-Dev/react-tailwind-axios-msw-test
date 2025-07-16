import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./App.scss";
import ReactLogo from "./assets/ReactLogo.jsx";
import Counter from "./components/Counter.jsx";
import TourCard from "./components/TourCard.jsx";
import { capitalize, getLocale } from "./utils.js";
import { Queries } from "./api.js";

function getDefaultGuestsState() {
  return ({
    adult: 1,
    child: 1,
    senior: 0,
    infant: 0,
  });
}

function getDefaulTourDataState() {
  return ({
    tours: [],
    currency: {},
  });
}

function getDefaultSortDataState() {
  return ({
    direction: "",
    compareFn: undefined,
  });
}

function App() {
  const initialized = useRef(false);
  const [guests, setGuests] = useState(getDefaultGuestsState());
  const [tourData, setTourData] = useState(getDefaulTourDataState());
  const [isLoading, setIsLoading] = useState(true);
  const [sortData, setSortData] = useState(getDefaultSortDataState());
  const [booking, setBooking] = useState();

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true; // avoid second call to tours query
    Queries.getAvailableTours()
      .then(data => {
        setTourData(enhanceTourData(data) ?? getDefaulTourDataState());
      }).finally(() => setIsLoading(false));
  }, []);

  const handleCounterChange = useCallback((id, val) => {
    setGuests({
      ...guests,
      [id]: val,
    });
  }, [guests]);

  const handleTourBooking = useCallback((result) => {
    setBooking(result);
    setTimeout(() => setBooking(undefined), 4000);
  }, []);

  const { tours, currency } = tourData;
  const currencyFormatter = currency.currencyFormatter;
  const currencyOffset = currency.currencyOffset;
  const guestCount = guests.adult + guests.child + guests.senior + guests.infant;
  const applicableTours = useMemo(() => tours.filter(t1 => canTourAccommodateGuests(t1, guests, guestCount)).map(t2 => {
    const { ticketsToBook, price } = getCheapestMatchingTicketsToBook(t2, guests, currencyOffset);
    return ({...t2, ticketsToBook, price});
  }), [tourData, guests]);
  
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
            id={key}
            label={capitalize(key)}
            value={count}
            onChange={handleCounterChange}
          />
        ))}
      </div>
      <h1 className="font-bold text-2xl">Available Tours</h1>
      <div className="flex items-center mt-3 mb-6">
        <p>Sort By:</p>
        <select className="ml-2 px-1 py-0.5 border border-solid border-black" onChange={(evt) => setSortData(getNewSortData(evt.target.value))}>
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
                  id={tour.id}
                  imgSrc={tour.image}
                  name={tour.name}
                  description={tour.description}
                  price={currencyFormatter.format(tour.price)}
                  tickets={tour.ticketsToBook}
                  onSuccess={handleTourBooking}
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

function enhanceTourData(tourData) {
  if (!tourData) {
    return;
  }
  tourData.tours.forEach(tour => {
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
      const name = t.name.toLowerCase();
      tour.ticketsSeatCountByName[name] += t.pax;
      tour.ticketsByName[name].push(t);
    };

    Object.values(tour.ticketsByName).forEach(tickets => {
      tickets.sort(lowestPriceCompareFn);
    });
  });

  tourData.currency.currencyOffset /= 100; // change offset to dollars
  tourData.currency.currencyFormatter = Intl.NumberFormat(getLocale(), { style: "currency", currency: tourData.currency.currency, currencyDisplay: "narrowSymbol" });

  return tourData;
}

function lowestPriceCompareFn(a, b) {
  return a.price - b.price;
};

function canTourAccommodateGuests(tour, guests, guestCount) {
  return guestCount >= tour.minPax && guestCount <= tour.maxPax && guestCount <= tour.seats && guests.adult <= tour.ticketsSeatCountByName.adult &&
         guests.child <= tour.ticketsSeatCountByName.child && guests.senior <= tour.ticketsSeatCountByName.senior && guests.infant <= tour.ticketsSeatCountByName.infant;
}

function getCheapestMatchingTicketsToBook(tour, guests, currencyOffset) {
  // assumes tour has enough tickets of the appropriate type, and that tickets are in sorted order by price, asc.
  // doing things this way because although the test data doesn't have this, there could be multiple tickets of the same name (ex: Adult) that have different prices (earlybird?).
  const ticketsToBook = [];
  let price = 0;

  Object.entries(tour.ticketsByName).forEach(([name, tickets]) => {
    const ticketData = _getCheapestTicketsData(tickets, guests[name]);
    ticketsToBook.push(...ticketData.tickets);
    price += ticketData.price;
  });

  price *= currencyOffset;

  return { ticketsToBook, price };
}

function _getCheapestTicketsData(tickets, count) {
  // assumes tickets are sorted order by price, asc.
  const ticketsData = {
    tickets: [],
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

function getNewSortData(direction) {
  const newSortData = { direction };

  if (direction === "asc" || direction === 'desc') {
    newSortData.compareFn = ((a, b) => {
      return direction === "asc" ? a.price - b.price : b.price - a.price;
    });
  }

  return newSortData;
}

export default App;
