export const getAllRoleIds = "query listRoles {Roles { id } }";

export const createRole =
  "mutation makeRole($name: String!) { RoleCreateOne(name: $name) { id name createdAt updatedAt } }";

export const findRoleByName =
  "query findRoleByName($name: String!) { RoleFindOne(name: $name) { id name } }";

export const findRoleById =
  "query findRoleByName($id: Int!) { RoleFindOne(id: $id) { id name } }";

export const deleteRoleById =
  "mutation delOne($id: Int!) { RoleDeleteOne(id: $id) { affected } }";

export const updateRoleName =
  "mutation updateRoleName($id:Int!, $newName:String!) { RoleUpdateOne(id:$id, name: $newName) { name updatedAt } }";

export const addSkills =
  "mutation updateRoleWithSkill($roleId:Int!, $skills: [Asd]) {  RoleSkillsOverwrite(roleId: $roleId, skills: $skills) { id roleId skill { id name } skillId } }";
