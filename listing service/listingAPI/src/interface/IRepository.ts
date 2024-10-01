import { ClientSession, ObjectId } from "mongoose";
import IQueryString from "./IQuerystring";

export default interface IRepository<T> {
  findAll(queryString?: IQueryString): Promise<T[]>;

  findById(id: string): Promise<T | null>;

  findBySlug(slug: string): Promise<T | null>;

  save(
    payload: Partial<T>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId>;

  update(
    id: string,
    payload: Partial<T | any>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId>;

  delete(id: string, options?: { session: ClientSession }): Promise<ObjectId>;
}
