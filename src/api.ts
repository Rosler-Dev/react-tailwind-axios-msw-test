import axios, { AxiosError, AxiosRequestConfig } from "axios"; 
import { ITourReservation, IToursAvailable } from "./types";
 
axios.defaults.baseURL = 'https://candidate-application.dolli.cloud/api/';

// using route functions to support potential parameters in the future
const API_ROUTES = {
  availableTours: () => `tour-avail`,
  reserveTour: () => `tour-reservation`,
};

class API {
  private static handleAxiosError(err: AxiosError) {
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

  private static async get<T>(route: string, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axios.get<T>(route, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
   
  private static async post<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axios.post<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async put<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axios.put<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async patch<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axios.patch<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async delete(route:string, config?: AxiosRequestConfig): Promise<boolean> {
    const result = await axios.delete<boolean>(route, config)
      .catch(API.handleAxiosError);
  
    return result?.data ?? false;
  }

  static async getAvailableTours(): Promise<IToursAvailable | undefined>  {
    const result = await API.get<IToursAvailable>(API_ROUTES.availableTours());
    return result;
  }

  static async reserveTour(tourReservation: ITourReservation): Promise<ITourReservation | undefined> {
    const result = await API.post<ITourReservation>(API_ROUTES.reserveTour(), tourReservation);
    return result;
  }
}

export default API;