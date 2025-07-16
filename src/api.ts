import axios, { AxiosError, AxiosRequestConfig } from "axios"; 
import { ITourReservation, IToursAvailable } from "./types";
 
axios.defaults.baseURL = 'https://candidate-application.dolli.cloud/api/';

function handleAxiosError(err: AxiosError) {
  if (err.response) {
    console.error(err.response.data);
    console.error(err.response.status);
    console.error(err.response.headers);
  } else if (err.request) {
    console.error(err.request);
  } else {
    console.error(err.config);
  }
}

async function query<T>(route: string, config?: AxiosRequestConfig): Promise<T | undefined> {
  const result = await axios.get<T>(route, config)
    .catch(handleAxiosError);

  return result?.data;
}
 
async function mutation<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
  const result = await axios.post<T>(route, data, config)
    .catch(handleAxiosError);

  return result?.data;
}

// using route functions to support potential parameters in the future
const QUERY_ROUTES = {
  availableTours: () => `tour-avail`,
};

export class Queries {
  static async getAvailableTours(): Promise<IToursAvailable | undefined>  {
    const result = await query<IToursAvailable>(QUERY_ROUTES.availableTours());
    return result;
  }
}

const MUTATION_ROUTES = {
  reserveTour: () => `tour-reservation`, 
};

export class Mutations {
  static async reserveTour(tourReservation: ITourReservation): Promise<ITourReservation | undefined> {
    const result = await mutation<ITourReservation>(MUTATION_ROUTES.reserveTour(), tourReservation);
    return result;
  }
}