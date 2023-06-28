import axios from 'axios';

import { skills } from '../../data/skills';
import { getMaximumSkillId } from '../../helpers/helpers';
import config from '../../playwright.config';
import { createSkill, deleteskill, updateSkill } from '../../queries/skillsQueries';

const { test, expect } = require('@playwright/test');
const endpoint = config.use?.baseURL ?? '';

// this is used in all the queries
const options = {
  headers: {
    'Content-Type': 'application/json'
  }
};

test('should allow a skill to be created', async ({}) => {
  const largestId = await getMaximumSkillId();

  const skillName = skills[0];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  let actualRespose: any, actualStatus: number; // the any is bad

  const body = {
    query: createSkill,
    variables: { name: skillName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      // verify:
      // status code is 200
      // verify the createdAt contains today's date, time is not used due to timezone difference
      // verify that the return has the skill we put in
      // verify the id is greater than the max id
      // soft assertions used to allow all the tests to run and reprt their answer

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify the name field has the correct skill name ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should NOT allow a skill to be created which is already existing', async ({}) => {
  const largestId = await getMaximumSkillId();

  const skillName = skills[1];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number, // the any is bad
    actualStatus2: number;

  const body = {
    query: createSkill,
    variables: { name: skillName }
  };

  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify the name field has the correct roleName ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // now try to create the same skill
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.errors[0].message, `Verify some form of error is displayed`).toContain('error');
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a skill to be deleted', async ({}) => {
  // we will create the skill, and then delete it
  const largestId = await getMaximumSkillId();

  const skillName = skills[2];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createSkill,
    variables: { name: skillName }
  };

  // create the  skill
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      actualId = actualRespose.data.SkillCreateOne.id;
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify the name field has the correct roleName ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const deleteBody = {
    query: deleteskill,
    variables: { id: actualId }
  };

  // delete the skill
  await axios
    .post(endpoint, deleteBody, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.SkillDeleteOne.affected, `Verify the affected count is 1`).toBe(1);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a deleted skill to be recreated', async ({}) => {
  // we will create the skill, and then delete it
  const largestId = await getMaximumSkillId();

  const skillName = skills[3];

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createSkill,
    variables: { name: skillName }
  };

  // create the  skill
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      actualId = actualRespose.data.SkillCreateOne.id;
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify the name field has the correct roleName ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const deleteBody = {
    query: deleteskill,
    variables: { id: actualId }
  };

  // delete the skill
  await axios
    .post(endpoint, deleteBody, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.data.SkillDeleteOne.affected, `Verify the affected count is 1`).toBe(1);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  // recreate the skill
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      actualId = actualRespose.data.SkillCreateOne.id;
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify recreated skill createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify recreated skill name field has the correct roleName ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify recreated skill new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should allow a skill to be updated', async ({}) => {
  // we will create the skill, and then update it
  const largestId = await getMaximumSkillId();

  const skillName = skills[4];
  const skillNameUpdated = skillName + ' updated';

  const dateTime = new Date();
  const today = dateTime.toISOString().split('T')[0];

  let actualRespose: any,
    actualRespose2: any,
    actualStatus: number,
    actualStatus2: number, // the any is bad
    actualId: number | undefined;

  const body = {
    query: createSkill,
    variables: { name: skillName }
  };

  // create the  skill
  await axios
    .post(endpoint, body, options)
    .then((response) => {
      actualRespose = response.data;
      actualStatus = response.status;

      expect.soft(actualStatus, `Verify status code is 200`).toBe(200);
      actualId = actualRespose.data.SkillCreateOne.id;
      expect.soft(actualRespose.data.SkillCreateOne.createdAt, `Verify createdAt contains today's date`).toContain(today);
      expect.soft(actualRespose.data.SkillCreateOne.name, `Verify the name field has the correct roleName ${skillName}`).toBe(skillName);
      expect.soft(actualRespose.data.SkillCreateOne.id, `Verify the new id is greater than ${largestId}`).toBeGreaterThan(largestId);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });

  const updateBody = {
    query: updateSkill,
    variables: { id: actualId, name: skillNameUpdated }
  };

  // update the skill
  await axios
    .post(endpoint, updateBody, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect
        .soft(actualRespose2.data.SkillUpdateOne.name, `Verify the skill name changed from ${skillName} to ${skillNameUpdated}`)
        .toBe(skillNameUpdated);
      expect
        .soft(actualRespose2.data.SkillUpdateOne.createdAt, `Verify that the createdAt and updatedAt fields are different`)
        .not.toBe(actualRespose2.data.SkillUpdateOne.updatedAt);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});

test('should NOT allow a skill to be updated which does not exist', async ({}) => {
  // we will try to update a skill with a large id number which does not exit
  const actualId = 999999;
  const skillNameUpdated = 'Nothing to see here';
  let actualRespose2: any, // the any is bad
    actualStatus2: number;

  const updateBody = {
    query: updateSkill,
    variables: { id: actualId, name: skillNameUpdated }
  };

  // update the skill
  await axios
    .post(endpoint, updateBody, options)
    .then((response) => {
      actualRespose2 = response.data;
      actualStatus2 = response.status;

      expect.soft(actualStatus2, `Verify status code is 200`).toBe(200);
      expect.soft(actualRespose2.SkillUpdateOne.name, `Verify that some form of errror is returned`).toContain('error');
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});
