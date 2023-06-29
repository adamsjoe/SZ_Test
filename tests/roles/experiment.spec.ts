import { jobRoles } from '../../data/jobRoles';
import { getMaximumId } from '../../helpers/helpers';
import config from '../../playwright.config';
import { createRole } from '../../queries/roleQueries';

import { makeApiCall } from '../../apiRequest/apiRequest';

const { test, expect } = require('@playwright/test');
const endpoint = config.use?.baseURL ?? '';

// this is used in all the queries
const options = {
  headers: {
    'Content-Type': 'application/json'
  }
};

test('should allow a role to be created (Experimental Method)', async ({}) => {
  const roleName = 'superman';

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  // we can also find out what the largest Id is (this will vary depending on use)
  const largestId = await getMaximumId();

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  // call our new makiApiCall function and get the reply
  let apiResponse = await makeApiCall(body);

  expect.soft(apiResponse.actualStatus, `Verify status code is 200`).toBe(200);
  expect.soft(apiResponse.actualRespose.data.RoleCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
  expect.soft(apiResponse.actualRespose.data.RoleCreateOne.name, `Verify the name field has the correct roleName ${roleName}`).toBe(roleName);
  expect.soft(apiResponse.actualRespose.data.RoleCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
});
