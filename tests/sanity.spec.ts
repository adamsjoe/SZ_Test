const { test, expect, request } = require('@playwright/test');

import { healthQuery } from '../queries/sanity';

//const healthyQuery = `{RoleFindOne(id: 1) {name}}`;

// eslint-disable-next-line unused-imports/no-unused-vars
test('Should return a 200 if the API is up', async ({ baseURL, request }) => {
  const response = await request.post(`${baseURL}`, {
    data: {
      query: healthQuery
    }
  });

  // all graphql queries return 200 (unless horribly wrong) so this is just a sanity
  expect(response.status(), `Expected Status to be 200 but was ${response.status()}`).toBe(200);
});
