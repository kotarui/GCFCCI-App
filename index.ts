export type Orientation = 'landscape' | 'portrait';

export interface Leader {
  id: string;
  name: string;
}

export interface CellGroup {
  id: string;
  name: string;
  leaderId: string;
  day: string;
  time: string;
}

export interface WeekUpload {
  groupId: string;
  monthKey: string;
  week: number;
  photoUri: string;
  width: number;
  height: number;
}

export type Profile = { role: 'leader'; leaderId: string } | { role: 'admin' };

export const WEEKS = [1, 2, 3, 4, 5];
export const ADMIN_PIN = '1234';

export function monthKeyFor(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export const CHURCH_NAME = "God's Covering Family Cell Church Inc.";
