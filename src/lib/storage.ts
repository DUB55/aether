import { get, set, keys, del } from 'idb-keyval';
import { type Project } from '@/types';

const PROJECTS_KEY = 'aether_projects';

export async function saveProject(project: Project) {
  await set(`${PROJECTS_KEY}_${project.id}`, project);
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await get(`${PROJECTS_KEY}_${id}`);
}

export async function getAllProjects(): Promise<Project[]> {
  const allKeys = await keys();
  const projectKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith(PROJECTS_KEY));
  const projects = await Promise.all(projectKeys.map(key => get(key)));
  return projects.filter(Boolean).sort((a, b) => b.lastModified - a.lastModified);
}

export async function deleteProject(id: string) {
  await del(`${PROJECTS_KEY}_${id}`);
}

export const storage = {
  saveProject,
  getProject,
  getAllProjects,
  deleteProject
};
