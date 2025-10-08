export interface ITour {
  id: string;
  description: string;
  image: string;
  name: string;
  tickets: ITicket[];
}

export interface ITourEnhanced extends ITour {
  ticketsToBook: ITourReservationTicket[];
  ticketsSeatCountByName: IGuests;
  ticketsByName: IGuestsTickets;
  price: number;
}

export interface IToursAvailable {
  tours: ITour[];
  currency: ICurrency;
}

export interface IToursAvailableEnhanced {
  tours: ITourEnhanced[];
  currency: ICurrencyEnhanced;
}

export interface ITicket {
  id: string;
  name: GuestType;
  pax: number;
  price: number;
}

export interface ICurrency {
  currency: string;
  currencyOffset: number;
}

export interface ICurrencyEnhanced extends ICurrency {
  currencyFormatter: Intl.NumberFormat;
}

export interface ITourReservation {
  tourId: string;
  tickets: ITourReservationTicket[];
}

export interface ITourReservationTicket {
  id: string;
  count: number;
}

export interface ISort<T> {
  direction: Direction;
  compareFn?: (a: T, b: T) => number;
}

export interface IGuests {
  adult: number;
  child: number;
  senior: number;
  infant: number;
}

export interface IGuestsTickets {
  adult: ITicket[];
  child: ITicket[];
  senior: ITicket[];
  infant: ITicket[];
}

export type Direction = "asc" | "desc" | "" | undefined;

export type GuestType = "adult" | "child" | "senior" | "infant";
