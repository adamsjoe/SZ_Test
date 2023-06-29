# Spotted Zebra SDET Test

## Contents

[Introduction](#introduction)

[Preamble](#preamble)

[Installation](#installation)

[Scripts](#scripts)

[Axios](#axios)

[Tests](#tests)

[Roles Tests](#roles-tests)

[Roles Test Data](#roles-test-data)

[Soft Assertions](#soft-assertions)

[Roles Tests Descriptions](#roles-test-descriptions)

[Skills Tests](#skills-tests)

[Skills Test Data](#skills-test-data)

[Skills Tests Description](#skills-tests-description)

[Test Report](#test-report)

[Improvements](#improvements)

## Introduction

This repo contains a very quick API test harness to check the GraphQL API endpoint provided.

## Preamble

This harness makes use of [Playwright](https://playwright.dev/) as it will run on both Mac and Windows and is quite easy to use. All tests were written using [Axios](https://axios-http.com/). One exception is the sanity check, which uses a Playwright supplied Request method (which I didn't like, so switched to Axois.)

## Installation

**Requirements:**

- NodeJS of at least version 18 is needed (this is enforced, so ensure that node is **_at least_** this version or the tests will not run.) To check the version of node use the command `node --version` at the command line.
- Yarn is recommended as a package manager, but it is not a hard requirement - npm will do if yarn is not present (and both commands will be provided.)

Once node is installed (and is at the correct version):

- `run npm install` (_or_ `yarn install`)

All required modules will be installed automatically.

Once the installation has been completed, run the sanity script by using the following command:
`npm runScript sanity`
or
`yarn run sanity`

If you are connected to the internet and the GraphQL endpoint is up, you will see a message saying 1 Passed.

### Scripts

A number of scripts have been setup (again both commands will be given):

| Script Command (NPM)   | Script Command (yarn) | Description                                                   |
| ---------------------- | --------------------- | ------------------------------------------------------------- |
| npm runScript allTests | yarn run allTests     | This command will run **all** tests, skills, roles and sanity |
| npm runScript roles    | yarn run roles        | This command will run **only** the roles tests                |
| npm runScript skills   | yarn run skills       | This command will run **only** the skills tests               |
| npm runScript sanity   | yarn run sanity       | This command will run the single sanity test **only**         |
| npm runScript report   | yarn run report       | This command will generate an HTML report                     |

## Axios

As mentioned, each test uses Axios to perform the request. At the moment, each file is laid out in, approximately, the same method (this could be improved on to reduce the amount of code reuse, but that is for the next iteration).

Each test has a constant endpoint defined

```typescript
const endpoint = config.use?.baseUrl ?? '';
```

This retrieves the baseUrl from the `playwright.config.ts` file and assigns it. We use the Null coalescing operator to ensure we always have a value (even if that vale is an empty string.)

We then have an options const:

```typescript
const options = {
  headers: {
    'Content-Type': 'application/json'
  }
};
```

Which is needed for Axios to send queries.

We then have the actual Axios post:

```typescript
const body = {
  query: createRole,
  variables: { name: roleName }
};

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
```

There is a body object, which houses our query (which is pulled from an export in a central file which increases maintainability) and any variables that query uses.

The body and options are then passed to the `.post` method and the results are stored in appropriate variables.

Each of the tests will use some form of the above query. As mentioned, an improvement could be to abstract this away and just pass in query and body and have this return the response object. This would cut down on code used and potentially improve readability.

## Tests

The approach taken was to concentrate on the two main entities, those being Roles and Skills. Each test has been configured to run in isolation from another test, if a test needs data it will create data. This approach has 2 main advantages:

- "Domino fails" are avoided
- The tests can be executed in parallel without fear of false fails.

### Roles Tests

#### Roles Test Data

Within the data folder, there is a file called `jobRoles.ts` which contains the test data to be used when creating roles.

The (very) simplified data is in the form of an array of job titles. The array is an export so that it can be brought into any file needed.

```typescript
export const jobRoles = [
  'QA Engineer',
  'UX Designer',
  'React Developer',
  'Java Developer',
  'Full Stack Developer',
  'iOS Developer',
  'Android Developer',
  'Full Stack Developer',
  'Junior Developer',
  'Batman'
];
```

This approach increases maintainability. Rather than having hard-coded test names, the data is located centrally and is easily updatable.

#### Soft Assertions

It will be noted that `expect.soft` is being used when verifying the endpoints. Soft assertions, unlike normal assertions, will continue to the next line when they fail. This method can be risky, it could leave systems in unknown states, however on this occasion it was deemed acceptable to use this as it will provide more information on the report.

### Roles Test Descriptions

The roles suite consists of the following tests:

- should allow a role to be created
- should NOT allow a role to be created if the role exists
- should NOT allow a role to be created if there is no name
- should allow a role to be searched for by name
- should allow a role to be searched for by id
- should allow a role to be deleted by id
- should not allow a role to be deleted by id which does not exist
- should allow a role to be updated
- should NOT allow a role to be updated with an empty name

#### **should allow a role to be created**

This test is a very basic test. We will attempt to create a new role from our list of predefined roles.

This test uses the `createRole` mutation:

```gql
mutation makeRole($name: String!) {
  RoleCreateOne(name: $name) {
    id
    name
    createdAt
    updatedAt
  }
}
```

Our role to be created is passed in via a GraphQL variable, which using Axios looks like:

```typescript
{
  name: roleName;
}
```

This test passed in the name (in this case "QA Engineer") and will check the following:

- that the status is 200 (OK) (All GraphQL queries should return a 200, even if erroring, this is more of a sanity.)
- That the createdAt field contains today's date. The time was not included in this test for 2 reasons:
  - That depending on the network, the time sent would never match the time created, there would always be milliseconds of difference
  - The time shown is out by 1 hour.
- That the id of the newly created role is larger than the largest id of role currently on the server. If the test execute in parallel, this avoids us getting false fails.

When this test runs, we get a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should NOT allow a role to be created if the role exists**

This test will try to create a role using the same `createRole` mutation (again picking from the list of roles) and then immediately attempts to create the same role.

There is nothing in the requirements document that says this is a valid scenario, but there is also nothing to say that having 2 roles with the same name **is** valid. The approach I have taken is that, for me, it is more sensible to have only the one role of a given name. Therefore, I'd expect some form of error on this test. As there is no details on this, I have just assumed the response will have "error".

However, at it turns out, the API allows this - so my test is marked as ![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+)`Fail`

**_Note:_** this is an example of something I'd raise to product to get clarification on.

#### **should NOT allow a role to be created if there is no name**

This test will try to create a new role with no role name. Again the specification does not say this is not allowed, but it seems logical.

The same `createRole` query is used, however this time our GraphQL variable will have an empty string as the name. Again, as in the previous test I have assumed some message with the word "error" will be returned. However, as before, the API allows an empty name to be a job role. My test, therefore, is marked as a ![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+)`Fail`

**_Note:_** this is an example of something I'd raise to product to get clarification on.

#### **should allow a role to be searched for by name**

This test will create a role and then attempt to search for it. Again we use this approach to keep each test isolated and not dependent on any other test for data.

The test will create a role using the now familiar `createRole` query, picking a name from jobRoles array. When the role is created, we also store the id of the created role. This will be used in verification when we search. We then use a new query, the `findRoleByName` query:

```gql
query findRoleByName($name: String!) {
  RoleFindOne(name: $name) {
    id
    name
  }
}
```

This query requires the name to be passed in (as a String) and then the following is verified:

- Verify status code is 200
- Verify the search result contains the role name which was created
- Verify that the search result contains the role id which was created

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should allow a role to be searched for by id**

This test is almost identical to the findRoleByName test. The difference is that this query uses the Id and not the role name.

```gql
findRoleByName($id: Int!) {
  RoleFindOne(id: $id) {
    id
    name
    }
}
```

As before, we create a role and store the id. This id is used when searching.

- Verify status code is 200
- Verify the search result contains the role name which was created
- Verify that the search result contains the role id which was created

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should allow a role to be deleted by id**

This test will attempt to delete a role by using the id. As before, to keep with the Test Isolation Principle, we shall create the role we are trying to delete. We then run the `deleteRoleById` mutuation:

```gql
mutation delOne($id: Int!) {
  RoleDeleteOne(id: $id) {
    affected
  }
}
```

We then:

- Verify status code is 200
- Verify the affected count is 1

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

**_Note:_** We could improve this test by searching for the id (or name) of the role we created and asserting that it was not found.

#### **should not allow a role to be deleted by id which does not exist**

This test is almost identical to the previous delete by id, however with this test we do not need to create data - instead we pass in a very large id (99999) - in a production test we should get the max id and use +1 (or another number) to ensure we never accidentally use a real id, but for this proof of concept, using 99999 is ok.

- Verify status code is 200
- Verify the affected count is 0

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should allow a role to be updated**

For this test we will again create a role, and then try to update the role name (by using the same role name with the word 'updated' appended to it.)

The format of this as the others. We create the role and then run an update query.

We then:

- Verify status code is 200
- Verify the search result contains the role name which was updated
- Verify that the updatedAt contains today

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should NOT allow a role to be updated with an empty name**

This is another test in which the behavior has not been defined. For me, using an empty name should throw some form of error - again I have just checked the response will contain the word error, however, the API seems to just return an update has been done, but not perform an update.

When run, this test is marked as a ![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+)`Fail`

**_Note:_** This is a very strange scenario. I would much rather see the API reject my attempt at updating with an empty name rather than just return the same data (but with an updatedAt changed.) Again, would be open to a discussion on this with a PO.

#### **should allow skills to be added to a role**

**This is a long test**

This test will create a role and then create two skills. It will then add the skills to the role and assert:

- Verify status code is 200
- Verify that the number of skills is 2.

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

**_Note:_** This test can be improved greatly, but I'd like some further clarification on what things like weight is. I'd also like to abstract some of the calls to make this test easier to read. We could also add some negative scenarios in this.

### Skills Tests

#### Skills Test Data

Within the data folder there is a file called `skills.ts` which contains the test data to be used when creating skills.

**_Note:_** In the data I have added \_JA to the skills. This is due to other users sometimes creating a skill which I would also use and then getting random failures.

### Skills Tests Description

#### **should allow a skill to be created**

This is a basic test to ensure that a skill can be created.

We use the `createSkill` mutation:

```gql
mutation createSkill($name: String!) {
  SkillCreateOne(name: $name) {
    id
    createdAt
    updatedAt
    name
  }
}
```

And then:

- Verify status code is 200
- Verify createdAt contains today's date
- Verify the name field has the correct skill name ${skillName}
- Verify the new id is greater than ${largestId}

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should NOT allow a skill to be created which is already existing**

Again, we create the skill and then try to recreate it. We should get some form of error.

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should allow a skill to be deleted**

- Verify status code is 200
- Verify the affected count is 1

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

**_Note:_** We could improve this test by searching for the id (or name) of the skill we created and asserting that it was not found.

#### **should allow a deleted skill to be recreated**

This test highlights one of the issues in the _Observation_ section.

When a skill is deleted, we are unable to recreate that skill. This seems wrong. I would expect this test to work (as it does in the Roles) - I have checked this manually and confirmed that we get a strange error (unhelpful error) when trying to recreate a skill we previously deleted.

When run, this test is marked as a ![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+)`Fail`

#### **should allow a skill to be updated**

As with the roles test we create a skill, then update that skill name with the word "Updated" at the end.

We then:

- Verify status code is 200
- Verify the skill name changed from ${skillName} to ${skillNameUpdated}
- Verify that the createdAt and updatedAt fields are different

**_Note:_** The last check is something different, we confirm that the time created and the time updated are different.

When run, this test is a ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) `Pass`

#### **should NOT allow a skill to be updated which does not exist**

We pass in a large skill id here (one which does not exist) and then try to update it.

Again this seems logical to me, and we look for the word "error" in the return, but the actual error is confusing.

When run, this test is marked as a ![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+)`Fail`

## Test Report

In the `sampleReport` directory you will see a basic HTML report showing what has passed and failed.

The sample report can also be opened by using [this link](/sampleReport/index.html)

I did consider adding in an allure test report which I am quite fond of, however this adds additional complexities (the need for a Java runtime chiefly) - so this lightweight report was used instead.

## Improvements

As mentioned above some of the tests are quite large. This repo could benefit from a slight refactor to aid readability.

It would also benefit from a chat with a PO to ensure that assumptions made are correct.

More additional testing could be done with negative scenarios (for example searching by id but passing in a String value. The aim here would be to ensure that informative error messages are being provided.)

## Observations

**Time** The times for createdAt and updatedAt are 1 hour out from GMT, so time validation couldn't be used. It may be a result of where the server is hosted or a misconfiguration. In a work situation, this would be raised to allow someone to investigate.

**deletedAt** Both the Role and the Skill entity have a field called `deletedAt` - but this field is never shown populated. When we perform a delete operation, and then search, the item we wanted to delete is gone and does not show. So we have this field that never is populated.

**Skill** When adding duplicate skills, the error message provided is not useful. Unlike Roles, which allows duplicate entries, Skills does not (which I agree with) however a nicer error message would be useful.

**Deleted Skills** When a skill is deleted, a new skill **cannot** be added with the same name. The error message is not helpful, so this is not useful in two ways.

**Updating a non-existing skill** If we try to update a non-existing skill, the skill is created. This is unexpected behavior.
