import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '@/store';
import { ProfileSelect } from '@/ProfileSelect';
import { AdminDashboard } from '@/AdminDashboard';
import { LeaderDashboard } from '@/LeaderDashboard';

export default function IndexScreen() {
  const {
    ready,
    profile,
    setProfile,
    leaders,
    addLeader,
    updateLeader,
    deleteLeader,
    groups,
    uploads,
    addUpload,
    deleteUpload,
  } = useAppStore();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!profile) {
    return <ProfileSelect leaders={leaders} onSelect={setProfile} />;
  }

  if (profile.role === 'admin') {
    return (
      <AdminDashboard
        leaders={leaders}
        groups={groups}
        uploads={uploads}
        onAddLeader={addLeader}
        onUpdateLeader={updateLeader}
        onDeleteLeader={deleteLeader}
        onSwitchProfile={() => setProfile(null)}
      />
    );
  }

  const activeLeader = leaders.find((l) => l.id === profile.leaderId);
  if (!activeLeader) {
    return <ProfileSelect leaders={leaders} onSelect={setProfile} />;
  }

  return (
    <LeaderDashboard
      leader={activeLeader}
      groups={groups.filter((g) => g.leaderId === activeLeader.id)}
      uploads={uploads}
      onAddUpload={addUpload}
      onDeleteUpload={deleteUpload}
      onSwitchProfile={() => setProfile(null)}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
});
