import { columnsMock } from "../mock/columns.data";
import type { Column } from "../types/column.types";

export const getColumns = async (): Promise<Column[]> => {
  return Promise.resolve(columnsMock);
};
