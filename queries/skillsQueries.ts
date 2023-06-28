export const getAllSkillsIds = "query listSkills {Skills { id } }";

export const createSkill =
  "mutation createSkill($name: String!) { SkillCreateOne(name: $name) { id createdAt updatedAt name } }";

export const deleteskill =
  "mutation delOne($id: Int!) { SkillDeleteOne(id: $id) { affected } } ";

export const updateSkill =
  "mutation updateSkill($id: Int!, $name: String!){ SkillUpdateOne(id: $id, name: $name){ id name createdAt updatedAt } }";
