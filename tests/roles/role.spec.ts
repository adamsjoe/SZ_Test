import axios from 'axios';

import { jobRoles } from '../../data/jobRoles';
import { getMaximumId } from '../../helpers/helpers';
import config from '../../playwright.config';
import { addSkills, createRole, deleteRoleById, findRoleById, findRoleByName, updateRoleName } from '../../queries/roleQueries';
import { createSkill } from '../../queries/skillsQueries';

const { test, expect } = require('@playwright/test');
const endpoint = config.use?.baseURL ?? '';

// this is used in all the queries
const options = {
  headers: {
    'Content-Type': 'application/json'
  }
};

test('should allow a role to be created', async ({}) => {
  const roleName = jobRoles[0];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  // we can also find out what the largest Id is (this will vary depending on use)
  const largestId = await getMaximumId();

  let actualRespose: any, actualStatus: number; // the any is bad

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      // verify:
      // status code is 200
      // verify the createdAt contains today's date, time is not used due to timezone difference
      // verify that the return has the job title we put in
      // verify the id is greater than the max id
      // soft assertions used to allow all the tests to run and reprt their answer
      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.RoleCreateOne.name, `Verify the name field has the correct roleName ${roleName}`).toBe(roleName);
      expect.soft(actualRespose.data.RoleCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should NOT allow a role to be created if the role exists', async ({}) => {
  // for this test, we shall create a role and then try to create the same role again.

  const roleName = jobRoles[1];

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number, // the any is bad
    actualStatus2: number;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name, `Verify the new role name is ${roleName}`).toBe(roleName);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now create the same role, expect some form of error
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2, `Verify that some form of error message is displayed - keyed on the word 'Error'`).toContain('error'); // wording is not specified, but would expect the word 'error' at least
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should NOT allow a role to be created if there is no name', async ({}) => {
  const roleName = '';

  let actualRespose: any, actualStatus: number; // the any is bad

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose, `Verify that some form of error message is displayed - keyed on the word 'Error'`).toContain('error'); // wording is not specified, but would expect the word 'error' at least
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a role to be searched for by name', async ({}) => {
  const roleName = jobRoles[2];
  // for this test, we shall create a role and then try to search for it.

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  const findBody = {
    query: findRoleByName,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name).toBe(roleName);
      actualId = actualRespose.data.RoleCreateOne.id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now search for the role just created
  await axios
    .post(endpoint, findBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleFindOne.name, `Verify the search result contains the role name which was created`).toBe(roleName);
      expect.soft(actualRespose2.data.RoleFindOne.id, `Verify that the search result contains the role id which was created`).toBe(actualId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a role to be searched for by id', async ({}) => {
  // for this test, we shall create a role and then try to search for it.

  const roleName = jobRoles[3];

  let actualRespose: any, // the any is bad
    actualRespose2: any, // the any is bad
    actualStatus: number,
    actualStatus2: number,
    actualId: number | undefined = undefined;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name).toBe(roleName);
      actualId = actualRespose.data.RoleCreateOne.id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const findBody = {
    query: findRoleById,
    variables: { id: actualId }
  };
  // now search for the role just created
  await axios
    .post(endpoint, findBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleFindOne.id, `Verify that the search result contains the role id which was created`).toBe(actualId);
      expect.soft(actualRespose2.data.RoleFindOne.name, `Verify the search result contains the role name which was created`).toBe(roleName);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a role to be deleted by id', async ({}) => {
  const roleName = jobRoles[4];
  // for this test, we shall create a role and then try to delete it.

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name).toBe(roleName);
      actualId = actualRespose.data.RoleCreateOne.id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const deleteBody = {
    query: deleteRoleById,
    variables: { id: actualId }
  };

  // now search for the role just created
  await axios
    .post(endpoint, deleteBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleDeleteOne.affected, `Verify the affected count is 1`).toBe(1);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should not allow a role to be deleted by id which does not exist', async ({}) => {
  // we shall try to delete a non existing id, no need to create anything first

  let actualRespose2: any, actualStatus2: number; // the any is bad
  const actualId: number | undefined = 99999;

  const deleteBody = {
    query: deleteRoleById,
    variables: { id: actualId }
  };

  // now search for the role just created
  await axios
    .post(endpoint, deleteBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleDeleteOne.affected, `Verify the affected count is 0`).toBe(0);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a role to be updated', async ({}) => {
  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  const roleName = jobRoles[5];
  const updatedName = roleName + ' updated';
  // for this test, we shall create a role and then try to update it it.

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name).toBe(roleName);
      actualId = actualRespose.data.RoleCreateOne.id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now search for the role just created
  const updateBody = {
    query: updateRoleName,
    variables: { id: actualId, newName: updatedName }
  };

  await axios
    .post(endpoint, updateBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleUpdateOne.name, `Verify the search result contains the role name which was updated`).toBe(updatedName);
      expect.soft(actualRespose2.data.RoleUpdateOne.updatedAt, `Verify that the updatedAt contains today`).toContain(today);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should NOT allow a role to be updated with an empty name', async ({}) => {
  const roleName = jobRoles[5];
  const updatedName = '';
  // for this test, we shall create a role and then try to update it with an empty.

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleCreateOne.name).toBe(roleName);
      actualId = actualRespose.data.RoleCreateOne.id;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const updateBody = {
    query: updateRoleName,
    variables: { id: actualId, newName: updatedName }
  };

  // now the update
  await axios
    .post(endpoint, updateBody, options)
    .then((response2) => {
      actualRespose2 = response2.data;
      actualStatus2 = response2.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.RoleUpdateOne.name, `Verify the search result contains the role name which was updated`).toBe(updatedName);
      expect.soft(actualRespose, `Verify that some form of error message is displayed - keyed on the word 'Error'`).toContain('error'); // wording is not specified, but would expect the word 'error' at least
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow skills to be added to a role', async ({}) => {
  // this will be a long test, in reality most of the axios stuff should be abstracted away
  const roleName = jobRoles[6];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  // we can also find out what the largest Id is (this will vary depending on use)
  const largestId = await getMaximumId();

  let actualRespose: any, firstSkillAddResponse: any, secondSkillAddResponse: any, actualStatus: number, actualId: number | undefined;

  const skillIds: any[] = [];

  const body = {
    query: createRole,
    variables: { name: roleName }
  };

  // create a role - this role will have no skills, yet
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      actualId = actualRespose.data.RoleCreateOne.id;
      expect.soft(actualRespose.data.RoleCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.RoleCreateOne.name, `Verify the name field has the correct roleName ${roleName}`).toBe(roleName);
      expect.soft(actualRespose.data.RoleCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now to create a couple of skills
  const skillBody1 = {
    query: createSkill,
    variables: { name: 'Java' }
  };

  const skillBody2 = {
    query: createSkill,
    variables: { name: 'Kotlin' }
  };

  // first skill
  await axios
    .post(endpoint, skillBody1, options)
    .then((response) => {
      firstSkillAddResponse = response.data;
      actualStatus = response.status;

      console.log('first skill response ', firstSkillAddResponse);
      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      skillIds.push(firstSkillAddResponse.data.SkillCreateOne.id);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // second skill
  await axios
    .post(endpoint, skillBody2, options)
    .then((response) => {
      secondSkillAddResponse = response.data;
      actualStatus = response.status;
      console.log('second skill response ', secondSkillAddResponse);
      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      skillIds.push(secondSkillAddResponse.data.SkillCreateOne.id);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now we can add the skills to the role

  const weightVal = 0.5;

  const associateBody = {
    query: addSkills,
    variables: {
      roleId: actualId,
      skills: [
        { skillId: skillIds[0], weight: weightVal },
        { skillId: skillIds[1], weight: weightVal }
      ]
    }
  };

  await axios
    .post(endpoint, associateBody, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.RoleSkillsOverwrite.length).toBe(2);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});
