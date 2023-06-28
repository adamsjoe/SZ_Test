import config from "../playwright.config";
import axios from "axios";
import { getAllRoleIds } from "../queries/roleQueries";
import { getAllSkillsIds } from "../queries/skillsQueries";

const endpoint = config.use?.baseURL ?? "";

export function getNumberOfRoles(): Promise<any> {
  const query = "query listRoles {Roles { id } }";

  return axios
    .post(endpoint, { query })
    .then((response) => {
      return response.data.data.Roles.length;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

export function getMaximumId(): Promise<any> {
  const query = getAllRoleIds;

  let idArray = new Array();

  return axios
    .post(endpoint, { query })
    .then((response) => {
      for (let x = 0; x < response.data.data.Roles.length; x++) {
        idArray.push(response.data.data.Roles[x].id);
      }

      const max: number = Math.max(...idArray);

      return max;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

export function getMaximumSkillId(): Promise<any> {
  const query = getAllSkillsIds;

  let idArray = new Array();

  return axios
    .post(endpoint, { query })
    .then((response) => {
      for (let x = 0; x < response.data.data.Skills.length; x++) {
        idArray.push(response.data.data.Skills[x].id);
      }

      const max: number = Math.max(...idArray);

      return max;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

export function createRole(roleName): Promise<any> {
  const query = `mutation makeOne{ RoleCreateOne(name: "${roleName}") {id name createdAt updatedAt } }`;

  return axios
    .post(endpoint, { query })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
