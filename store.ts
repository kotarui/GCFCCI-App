import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { CellGroup, Leader, Profile, WorkUpload, monthKeyFor } from '@/types';

const KEY_PROFILE = 'gbf_profile';
const KEY_LEADERS = 'gbf_leaders';
const KEY_GROUPS = 'gbf_groups';
const KEY_UPLOADS = 'gbf_uploads';

const SAMPLE_LEADERS: Leader[] = [
  { id: 'l1', name: 'Jefferson' },
  { id: 'l2', name: 'Leader Maria' },
  { id: 'l3', name: 'Leader Mark' },
  { id: 'l4', name: 'Leader Grace' },
];

const SAMPLE_GROUPS: CellGroup[] = [
  { id: 'g1', name: 'Faith Cell Group', leaderId: 'l1', day: 'Thursday', time: '5:00 PM' },
  { id: 'g2', name: 'Hope Cell Group', leaderId: 'l2', day: 'Saturday', time: '6:00 PM' },
  { id: 'g3', name: 'Grace Cell Group', leaderId: 'l3', day: 'Sunday', time: '3:00 PM' },
  { id: 'g4', name: 'Faith Cell Group', leaderId: 'l3', day: 'Tuesday', time: '7:00 PM' },
  { id: 'g5', name: 'Joy Cell Group', leaderId: 'l4', day: 'Friday', time: '6:30 PM' },
  { id: 'g6', name: 'Peace Cell Group', leaderId: 'l1', day: 'Sunday', time: '1:00 PM' },
];

const SAMPLE_MONTH_KEY = monthKeyFor(new Date());
const SAMPLE_UPLOADS: WorkUpload[] = [
  { id: 'u1', groupId: 'g1', monthKey: SAMPLE_MONTH_KEY, week: 1, photoUri: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Opening prayer & fellowship' },
  { id: 'u2', groupId: 'g1', monthKey: SAMPLE_MONTH_KEY, week: 2, photoUri: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Bible study discussion' },
  { id: 'u3', groupId: 'g2', monthKey: SAMPLE_MONTH_KEY, week: 1, photoUri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Weekly cell gathering' },
  { id: 'u4', groupId: 'g3', monthKey: SAMPLE_MONTH_KEY, week: 1, photoUri: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'Worship & sharing' },
  { id: 'u5', groupId: 'g5', monthKey: SAMPLE_MONTH_KEY, week: 1, photoUri: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800', caption: 'First week meetup' },
];

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function save(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useAppStore() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [groups, setGroups] = useState<CellGroup[]>([]);
  const [uploads, setUploads] = useState<WorkUpload[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, l, g, u] = await Promise.all([
        load<Profile | null>(KEY_PROFILE, null),
        load<Leader[]>(KEY_LEADERS, SAMPLE_LEADERS),
        load<CellGroup[]>(KEY_GROUPS, SAMPLE_GROUPS),
        load<WorkUpload[]>(KEY_UPLOADS, SAMPLE_UPLOADS),
      ]);
      setProfileState(p);
      setLeaders(l);
      setGroups(g);
      setUploads(u);
      setReady(true);
    })();
  }, []);

  const setProfile = useCallback(async (p: Profile | null) => {
    setProfileState(p);
    await save(KEY_PROFILE, p);
  }, []);

  // Magdagdag ng bagong leader + automatic cell group
  const addLeader = useCallback(async (name: string, groupName = 'New Cell Group', day = 'Sunday', time = '4:00 PM') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = `l_${Date.now()}`;
    const newLeader: Leader = { id: newId, name: trimmed };
    const nextLeaders = [...leaders, newLeader];
    setLeaders(nextLeaders);
    await save(KEY_LEADERS, nextLeaders);

    const newGroup: CellGroup = {
      id: `g_${Date.now()}`,
      name: groupName.trim() || `${trimmed}'s Cell Group`,
      leaderId: newId,
      day,
      time,
    };
    const nextGroups = [...groups, newGroup];
    setGroups(nextGroups);
    await save(KEY_GROUPS, nextGroups);
  }, [leaders, groups]);

  // Mag-edit ng pangalan ng leader
  const updateLeader = useCallback(async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const next = leaders.map((l) => (l.id === id ? { ...l, name: trimmed } : l));
    setLeaders(next);
    await save(KEY_LEADERS, next);
  }, [leaders]);

  // Magbura ng leader at ng cell group niya
  const deleteLeader = useCallback(async (id: string) => {
    const nextLeaders = leaders.filter((l) => l.id !== id);
    const nextGroups = groups.filter((g) => g.leaderId !== id);
    setLeaders(nextLeaders);
    setGroups(nextGroups);
    await Promise.all([
      save(KEY_LEADERS, nextLeaders),
      save(KEY_GROUPS, nextGroups),
    ]);
  }, [leaders, groups]);

  const addGroup = useCallback(async (group: Omit<CellGroup, 'id'>) => {
    const next = [...groups, { ...group, id: `g_${Date.now()}` }];
    setGroups(next);
    await save(KEY_GROUPS, next);
  }, [groups]);

  const addUpload = useCallback(async (upload: Omit<WorkUpload, 'id'>) => {
    const filtered = uploads.filter(
      (u) => !(u.groupId === upload.groupId && u.monthKey === upload.monthKey && u.week === upload.week)
    );
    const next = [...filtered, { ...upload, id: `u_${Date.now()}` }];
    setUploads(next);
    await save(KEY_UPLOADS, next);
  }, [uploads]);

  const deleteUpload = useCallback(async (id: string) => {
    const next = uploads.filter((u) => u.id !== id);
    setUploads(next);
    await save(KEY_UPLOADS, next);
  }, [uploads]);

  return {
    ready,
    profile,
    setProfile,
    leaders,
    addLeader,
    updateLeader,
    deleteLeader,
    groups,
    addGroup,
    uploads,
    addUpload,
    deleteUpload,
  };
}
