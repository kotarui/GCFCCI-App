import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Users, Plus, Edit2, Trash2, X, Check, LogOut } from 'lucide-react-native';
import { CellGroup, Leader, WorkUpload, monthKeyFor } from '@/types';

interface Props {
  leaders: Leader[];
  groups: CellGroup[];
  uploads: WorkUpload[];
  onAddLeader: (name: string, groupName?: string, day?: string, time?: string) => Promise<void>;
  onUpdateLeader: (id: string, newName: string) => Promise<void>;
  onDeleteLeader: (id: string) => Promise<void>;
  onSwitchProfile: () => void;
}

export function AdminDashboard({
  leaders,
  groups,
  uploads,
  onAddLeader,
  onUpdateLeader,
  onDeleteLeader,
  onSwitchProfile,
}: Props) {
  const [manageOpen, setManageOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const currentMonth = monthKeyFor(new Date());

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAddLeader(newName, newGroupName || `${newName.trim()}'s Cell Group`);
    setNewName('');
    setNewGroupName('');
  };

  const startEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setEditName(leader.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await onUpdateLeader(editingId, editName);
    setEditingId(null);
    setEditName('');
  };

  const confirmDelete = (leader: Leader) => {
    Alert.alert(
      'Delete Leader',
      `Sigurado ka bang tatanggalin si ${leader.name}? Mabubura rin ang cell group niya.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteLeader(leader.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Monthly Update Tracker</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.manageBtn} onPress={() => setManageOpen(true)}>
            <Users size={16} color="#FFFFFF" />
            <Text style={styles.manageBtnText}>Leaders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={onSwitchProfile}>
            <LogOut size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{leaders.length}</Text>
            <Text style={styles.statLabel}>Total Leaders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Cell Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {uploads.filter((u) => u.monthKey === currentMonth).length}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Leaders & Cell Groups</Text>
        {leaders.map((leader) => {
          const leaderGroups = groups.filter((g) => g.leaderId === leader.id);
          const leaderUploads = uploads.filter(
            (u) =>
              u.monthKey === currentMonth &&
              leaderGroups.some((g) => g.id === u.groupId)
          );

          return (
            <View key={leader.id} style={styles.leaderCard}>
              <View style={styles.leaderTop}>
                <Text style={styles.leaderName}>{leader.name}</Text>
                <Text style={styles.uploadBadge}>{leaderUploads.length} uploads</Text>
              </View>
              {leaderGroups.length === 0 ? (
                <Text style={styles.emptyGroup}>Walang naka-assign na cell group</Text>
              ) : (
                leaderGroups.map((g) => (
                  <Text key={g.id} style={styles.groupItem}>
                    • {g.name} ({g.day} • {g.time})
                  </Text>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Modal para mag-Add / Edit / Delete ng Leaders */}
      <Modal visible={manageOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Leaders</Text>
              <TouchableOpacity onPress={() => setManageOpen(false)}>
                <X size={22} color="#334155" />
              </TouchableOpacity>
            </View>

            <View style={styles.addBox}>
              <TextInput
                style={styles.input}
                placeholder="Pangalan ng bagong leader..."
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.input}
                placeholder="Cell group name (optional)..."
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add Leader</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {leaders.map((leader) => (
                <View key={leader.id} style={styles.listRow}>
                  {editingId === leader.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        value={editName}
                        onChangeText={setEditName}
                        autoFocus
                      />
                      <TouchableOpacity style={styles.iconBtnSave} onPress={saveEdit}>
                        <Check size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtnCancel}
                        onPress={() => setEditingId(null)}
                      >
                        <X size={18} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.listName}>{leader.name}</Text>
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => startEdit(leader)}
                        >
                          <Edit2 size={16} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => confirmDelete(leader)}
                        >
                          <Trash2 size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  content: { padding: 20, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  leaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  leaderName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  uploadBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  groupItem: { fontSize: 13, color: '#475569', marginTop: 2 },
  emptyGroup: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  addBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  modalList: { maxHeight: 340 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8 },
  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtnSave: { padding: 10, backgroundColor: '#16A34A', borderRadius: 8 },
  iconBtnCancel: { padding: 10, backgroundColor: '#E2E8F0', borderRadius: 8 },
});
