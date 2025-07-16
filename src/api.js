import axios from "axios"; 
 
const BASE_API_URL = "https://candidate-application.dolli.cloud/api/";

function getApiUrl(route) {
  return `${BASE_API_URL}${route}`;
}

async function query(route) {
  try {
    const result = await axios.get(getApiUrl(route));
    return result;
  } catch (err) {
    console.log(err);
  }
}
 
async function mutation(route, data) {
  try {
    const result = await axios.post(getApiUrl(route), data);
    return result;
  } catch (err) {
    console.log(err);
  }
}

// using route functions to support potential parameters in the future
const QUERY_ROUTES = {
  availableTours: () => `tour-avail`,
};

export class Queries {
  static async getAvailableTours() {
    const result = await query(QUERY_ROUTES.availableTours());
    return result?.data;
  }
}

const MUTATION_ROUTES = {
  reserveTour: () => `tour-reservation`, 
};

export class Mutations {
  static async reserveTour(tours) {
    const result = await mutation(MUTATION_ROUTES.reserveTour(), tours);
    return result?.data;
  }
}