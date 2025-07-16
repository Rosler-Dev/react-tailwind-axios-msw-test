import axios, { AxiosError, AxiosRequestConfig } from "axios"; 
import { ITourReservation, IToursAvailable } from "../types";
 
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3002/api/',
});

const getFullRoute = (route: string): string => {
  return `${axiosInstance.defaults.baseURL}${route}`;
};

class API {
  static Routes = {
    availableTours: getFullRoute('tour-avail'),
    reserveTour: getFullRoute('tour-reservation'),
  };

  // using route generator functions to support potential parameters in the future
  private static RouteMappers = {
    availableTours: () => `tour-avail`,
    reserveTour: () => `tour-reservation`,
  };

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
    const result = await axiosInstance.get<T>(route, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
   
  private static async post<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axiosInstance.post<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async put<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axiosInstance.put<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async patch<T>(route:string, data: object, config?: AxiosRequestConfig): Promise<T | undefined> {
    const result = await axiosInstance.patch<T>(route, data, config)
      .catch(API.handleAxiosError);
  
    return result?.data;
  }
  
  private static async delete(route:string, config?: AxiosRequestConfig): Promise<boolean> {
    const result = await axiosInstance.delete<boolean>(route, config)
      .catch(API.handleAxiosError);
  
    return result?.data ?? false;
  }

  static async getAvailableTours(): Promise<IToursAvailable | undefined>  {
    const result = await API.get<IToursAvailable>(API.RouteMappers.availableTours());
    return result;
  }

  static async reserveTour(tourReservation: ITourReservation): Promise<ITourReservation | undefined> {
    const result = await API.post<ITourReservation>(API.RouteMappers.reserveTour(), tourReservation);
    return result;
  }
}

export default API;