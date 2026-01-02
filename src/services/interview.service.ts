import { interviewsMock } from "../mock/interviews.data";
import type { Interview } from "../types/interview.types";

export const getInterviews = async (): Promise<Interview[]> => {
  return Promise.resolve(interviewsMock);
};
