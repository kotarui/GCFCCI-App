import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Pencil, Upload, X } from 'lucide-react-native';
import { CellGroup, WeekUpload, WEEKS, monthKeyFor } from '@/types';

const NAVY = '#002B5C';
const GOLD = '#E5A822';
const WHITE = '#FFFFFF';
const SOFT = '#F4F6F9';
const GREEN = '#1E8E4D';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  leaderId: string;
  groups: CellGroup[];
  allGroups: CellGroup[];
  uploads: WeekUpload[];
  onPickPhoto: (groupId: string, monthKey: string, week: number) => void;
  onClearWeek: (groupId: string, monthKey: string, week: number) => void;
  onSaveGroups: (groups: CellGroup[]) => void;
  onSwitchProfile: () => void;
}

export default function LeaderDashboard({ leaderId, groups, allGroups, uploads, onPickPhoto, onClearWeek, onSaveGroups, onSwitchProfile }: Props) {
  const [activeGroup, setActiveGroup] = useState<CellGroup | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [scheduleNote, setScheduleNote] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CellGroup | null>(null);

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const selectedMonthKey = monthKeyFor(viewDate);
  const currentMonthUploads = uploads.filter((u) => u.monthKey === selectedMonthKey);

  if (!activeGroup) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }} />
            <Pressable style={styles.switchButton} onPress={onSwitchProfile}>
              <Text style={styles.switchText}>Switch Profile</Text>
            </Pressable>
          </View>
          <Text style={styles.churchName}>God's Covering Family Cell Church Inc.</Text>
          <Text style={styles.title}>My Cell Groups</Text>
          <Text style={styles.subtitle}>Tap a group to upload this month's photo</Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.addButton} onPress={() => { setEditingGroup({ id: '', name: '', leaderId, day: 'Thursday', time: '5:00 PM' }); setEditorOpen(true); }}>
            <Text style={styles.addButtonText}>+ Add Cell Group</Text>
          </Pressable>
          {groups.map((g) => {
            const groupUploads = currentMonthUploads.filter((u) => u.groupId === g.id);
            return (
              <Pressable key={g.id} style={({ pressed }) => [styles.groupCard, pressed && { transform: [{ scale: 0.98 }], backgroundColor: '#EAF1F9' }]} onPress={() => setActiveGroup(g)}>
                <View style={styles.groupIcon}>
                  <CalendarDays size={34} color={WHITE} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupMeta}>Every {g.day} • {g.time}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <View style={[styles.badge, groupUploads.length >= 4 ? styles.badgeDone : styles.badgeTodo]}>
                    <Text style={[styles.badgeText, groupUploads.length >= 4 && { color: WHITE }]}>{groupUploads.length}/{WEEKS.length}</Text>
                  </View>
                  <Pressable style={styles.editButton} onPress={() => { setEditingGroup({ ...g }); setEditorOpen(true); }}>
                    <Pencil size={17} color={NAVY} strokeWidth={2.5} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
          {groups.length === 0 ? <Text style={styles.emptyText}>No cell groups assigned yet. Ask the media team.</Text> : null}
        </ScrollView>
        <GroupEditorModal
          visible={editorOpen}
          group={editingGroup}
          onClose={() => { setEditorOpen(false); setEditingGroup(null); }}
          onSave={(group) => {
            const nextGroup = group.id ? group : { ...group, id: `g${Date.now()}` };
            const nextGroups = group.id ? allGroups.map((g) => (g.id === group.id ? nextGroup : g)) : [...allGroups, nextGroup];
            onSaveGroups(nextGroups);
            setEditorOpen(false);
            setEditingGroup(null);
          }}
        />
      </View>
    );
  }

  const weeksThisMonth = WEEKS;
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable style={styles.backButton} onPress={() => setActiveGroup(null)}>
            <ArrowLeft size={26} color={WHITE} strokeWidth={2.5} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.switchButton} onPress={onSwitchProfile}>
            <Text style={styles.switchText}>Switch Profile</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{activeGroup.name}</Text>
        <Text style={styles.subtitle}>Every {activeGroup.day} • {activeGroup.time}</Text>
      </View>

      <View style={styles.monthSelector}>
        <Pressable style={styles.monthArrow} onPress={() => setMonthOffset((m) => m - 1)}>
          <ChevronLeft size={30} color={NAVY} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable style={styles.monthArrow} onPress={() => setMonthOffset((m) => Math.min(0, m + 1))} disabled={monthOffset >= 0}>
          <ChevronRight size={30} color={monthOffset >= 0 ? '#B9C9DE' : NAVY} strokeWidth={2.5} />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.scheduleToggle, scheduleNote && styles.scheduleToggleActive, pressed && { opacity: 0.85 }]}
        onPress={() => setScheduleNote(scheduleNote ? null : `Schedule changed for ${monthLabel} — please check with your leader for the new day/time.`)}
      >
        <Clock size={26} color={scheduleNote ? WHITE : NAVY} strokeWidth={2.5} />
        <Text style={[styles.scheduleToggleText, scheduleNote && { color: WHITE }]}>Schedule Changed?</Text>
      </Pressable>
      {scheduleNote ? (
        <View style={styles.scheduleNote}>
          <Text style={styles.scheduleNoteText}>{scheduleNote}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {weeksThisMonth.map((week) => {
          const upload = currentMonthUploads.find((u) => u.groupId === activeGroup.id && u.week === week);
          return (
            <Pressable key={week} style={({ pressed }) => [styles.weekCard, upload && styles.weekCardDone, pressed && { transform: [{ scale: 0.98 }] }]} onPress={() => onPickPhoto(activeGroup.id, selectedMonthKey, week)}>
              {upload ? (
                <Image source={{ uri: upload.photoUri }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Upload size={34} color={NAVY} strokeWidth={2} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.weekTitle}>Week {week}</Text>
                <Text style={styles.weekMeta}>{upload ? 'Photo uploaded' : 'Tap to add photo'}</Text>
              </View>
              {upload ? (
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={40} color={GREEN} strokeWidth={2.5} />
                  <Pressable onPress={() => onClearWeek(activeGroup.id, selectedMonthKey, week)} hitSlop={12}>
                    <Text style={styles.clearText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.uploadChip}>
                  <Upload size={22} color={WHITE} strokeWidth={2.5} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

    </View>
  );
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM', '7:30 PM'];

function GroupEditorModal({ visible, group, onClose, onSave }: { visible: boolean; group: CellGroup | null; onClose: () => void; onSave: (group: CellGroup) => void }) {
  const [draft, setDraft] = useState<CellGroup | null>(group);

  useEffect(() => {
    setDraft(group);
  }, [group]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{draft?.id ? 'Edit Cell Group' : 'Add Cell Group'}</Text>
              <Pressable onPress={onClose} hitSlop={10}><X size={28} color={NAVY} strokeWidth={2.5} /></Pressable>
            </View>
            <Text style={styles.fieldLabel}>Cell Group Name</Text>
            <TextInput style={styles.input} value={draft?.name ?? ''} onChangeText={(name) => setDraft((current) => current ? { ...current, name } : current)} placeholder="e.g. Espoir Cell Group" placeholderTextColor="#8A97AB" />
            <Text style={styles.fieldLabel}>Regular Day</Text>
            <View style={styles.chipRow}>
              {DAYS.map((day) => <Pressable key={day} style={[styles.chip, draft?.day === day && styles.chipActive]} onPress={() => setDraft((current) => current ? { ...current, day } : current)}><Text style={[styles.chipText, draft?.day === day && styles.chipTextActive]}>{day}</Text></Pressable>)}
            </View>
            <Text style={styles.fieldLabel}>Regular Time</Text>
            <View style={styles.chipRow}>
              {TIMES.map((time) => <Pressable key={time} style={[styles.chip, draft?.time === time && styles.chipActive]} onPress={() => setDraft((current) => current ? { ...current, time } : current)}><Text style={[styles.chipText, draft?.time === time && styles.chipTextActive]}>{time}</Text></Pressable>)}
            </View>
            <Pressable style={styles.modalSaveButton} onPress={() => { if (draft?.name.trim()) onSave(draft); }}>
              <Text style={styles.modalSaveText}>{draft?.id ? 'Save Changes' : 'Add Cell Group'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOFT },
  header: { backgroundColor: NAVY, paddingTop: 64, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  switchButton: { backgroundColor: GOLD, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  switchText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: WHITE, fontSize: 18, fontWeight: '700' },
  churchName: { color: GOLD, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  title: { color: WHITE, fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#B9C9DE', fontSize: 18, marginTop: 4 },
  list: { flex: 1 },
  addButton: { backgroundColor: NAVY, borderRadius: 22, padding: 20, alignItems: 'center' },
  addButtonText: { color: WHITE, fontSize: 21, fontWeight: '800' },
  groupCard: { backgroundColor: WHITE, borderRadius: 24, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 18, borderWidth: 3, borderColor: '#DCE4EF' },
  groupIcon: { backgroundColor: NAVY, width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  groupName: { color: NAVY, fontSize: 24, fontWeight: '800' },
  groupMeta: { color: '#5A6B84', fontSize: 17, marginTop: 4, fontWeight: '600' },
  badge: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  badgeDone: { backgroundColor: GREEN },
  badgeTodo: { backgroundColor: '#EAF1F9' },
  badgeText: { color: NAVY, fontSize: 17, fontWeight: '800' },
  editButton: { backgroundColor: '#EAF1F9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  editButtonText: { color: NAVY, fontSize: 14, fontWeight: '800' },
  emptyText: { color: NAVY, fontSize: 20, textAlign: 'center', marginTop: 40, fontWeight: '600' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginHorizontal: 20, backgroundColor: WHITE, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 3, borderColor: '#DCE4EF' },
  monthArrow: { padding: 8 },
  monthLabel: { color: NAVY, fontSize: 24, fontWeight: '800' },
  scheduleToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 14, backgroundColor: WHITE, borderRadius: 20, paddingVertical: 14, borderWidth: 3, borderColor: GOLD },
  scheduleToggleActive: { backgroundColor: GOLD },
  scheduleToggleText: { color: NAVY, fontSize: 19, fontWeight: '800' },
  scheduleNote: { marginHorizontal: 20, marginTop: 10, backgroundColor: '#FFF6E3', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: GOLD },
  scheduleNoteText: { color: NAVY, fontSize: 16, fontWeight: '600', lineHeight: 22 },
  weekCard: { backgroundColor: WHITE, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18, borderWidth: 3, borderColor: '#DCE4EF' },
  weekCardDone: { borderColor: GREEN, backgroundColor: '#F0FAF4' },
  thumb: { width: 84, height: 84, borderRadius: 18 },
  thumbEmpty: { backgroundColor: '#EAF1F9', alignItems: 'center', justifyContent: 'center' },
  weekTitle: { color: NAVY, fontSize: 26, fontWeight: '800' },
  weekMeta: { color: '#5A6B84', fontSize: 17, marginTop: 4, fontWeight: '600' },
  uploadChip: { backgroundColor: GOLD, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#C43B3B', fontSize: 14, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,20,50,0.6)', justifyContent: 'flex-end' },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: WHITE, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, gap: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: NAVY, fontSize: 26, fontWeight: '800' },
  fieldLabel: { color: NAVY, fontSize: 17, fontWeight: '800', marginTop: 8 },
  input: { backgroundColor: SOFT, borderRadius: 16, borderWidth: 3, borderColor: '#DCE4EF', padding: 16, fontSize: 19, color: NAVY, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: SOFT, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderColor: '#DCE4EF' },
  chipActive: { backgroundColor: NAVY, borderColor: NAVY },
  chipText: { color: NAVY, fontSize: 16, fontWeight: '700' },
  chipTextActive: { color: WHITE },
  modalSaveButton: { backgroundColor: GOLD, borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 16 },
  modalSaveText: { color: WHITE, fontSize: 20, fontWeight: '800' },
});
