import config from '../playwright.config';
import axios, { AxiosRequestConfig } from 'axios';

const endpoint = config.use?.baseURL ?? '';

const options = {
  headers: {
    'Content-Type': 'application/json'
  }
};

let actualRespose: any, actualStatus: number; // the any is bad

export async function makeApiCall(body: { query: string; variables: { name: string } }) {
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  let returnObj = { actualRespose, actualStatus };
  return returnObj;
}
