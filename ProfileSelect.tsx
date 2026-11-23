import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ShieldCheck, UserCircle, Users } from 'lucide-react-native';
import { Leader, ADMIN_PIN } from '@/types';

const NAVY = '#002B5C';
const GOLD = '#E5A822';
const WHITE = '#FFFFFF';
const SOFT = '#F4F6F9';

interface Props {
  leaders: Leader[];
  onSelectLeader: (leader: Leader) => void;
  onSelectAdmin: () => void;
}

export default function ProfileSelect({ leaders, onSelectLeader, onSelectAdmin }: Props) {
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const tapDigit = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setPinError(false);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setPinModal(false);
        setPin('');
        onSelectAdmin();
      } else {
        setPinError(true);
        setTimeout(() => setPin(''), 400);
      }
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Users size={40} color={WHITE} strokeWidth={2} />
        </View>
        <Text style={styles.churchName}>God's Covering Family{'\n'}Cell Church Inc.</Text>
        <Text style={styles.title}>Select Your Profile</Text>
        <Text style={styles.subtitle}>Tap your name to begin</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Pressable style={({ pressed }) => [styles.adminButton, pressed && { transform: [{ scale: 0.98 }], backgroundColor: '#C88F15' }]} onPress={() => setPinModal(true)}>
          <ShieldCheck size={40} color={WHITE} strokeWidth={2} />
          <Text style={styles.adminText}>Admin / Media Team</Text>
        </Pressable>

        {leaders.map((leader) => (
          <Pressable key={leader.id} style={({ pressed }) => [styles.leaderButton, pressed && { transform: [{ scale: 0.98 }], backgroundColor: '#EAF1F9' }]} onPress={() => onSelectLeader(leader)}>
            <UserCircle size={44} color={NAVY} strokeWidth={2} />
            <Text style={styles.leaderName}>{leader.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={pinModal} transparent animationType="fade" onRequestClose={() => setPinModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Admin PIN</Text>
            <View style={styles.pinRow}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled, pinError && styles.pinDotError]} />
              ))}
            </View>
            {pinError ? <Text style={styles.pinErrorText}>Wrong PIN. Try again.</Text> : null}
            <View style={styles.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <Pressable key={d} style={styles.key} onPress={() => tapDigit(d)}>
                  <Text style={styles.keyText}>{d}</Text>
                </Pressable>
              ))}
              <Pressable style={[styles.key, styles.keyHidden]} disabled />
              <Pressable style={styles.key} onPress={() => tapDigit('0')}>
                <Text style={styles.keyText}>0</Text>
              </Pressable>
              <Pressable style={[styles.key, styles.keyClear]} onPress={() => { setPin(''); setPinError(false); }}>
                <Text style={[styles.keyText, { color: NAVY }]}>Clear</Text>
              </Pressable>
            </View>
            <Pressable style={styles.cancelButton} onPress={() => { setPinModal(false); setPin(''); setPinError(false); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOFT },
  header: { backgroundColor: NAVY, alignItems: 'center', paddingTop: 80, paddingBottom: 48, paddingHorizontal: 24, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerIcon: { backgroundColor: GOLD, width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  churchName: { color: GOLD, fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  title: { color: WHITE, fontSize: 36, fontWeight: '800', marginTop: 20 },
  subtitle: { color: '#B9C9DE', fontSize: 20, marginTop: 8 },
  list: { flex: 1 },
  leaderButton: { backgroundColor: WHITE, borderRadius: 24, padding: 26, flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 3, borderColor: '#DCE4EF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  leaderName: { color: NAVY, fontSize: 26, fontWeight: '700', flex: 1 },
  adminButton: { backgroundColor: GOLD, borderRadius: 24, padding: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  adminText: { color: WHITE, fontSize: 26, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,20,50,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: WHITE, borderRadius: 28, padding: 32, width: '100%', maxWidth: 420, alignItems: 'center' },
  modalTitle: { color: NAVY, fontSize: 28, fontWeight: '800', marginBottom: 24 },
  pinRow: { flexDirection: 'row', gap: 18, marginBottom: 12 },
  pinDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCE4EF', borderWidth: 2, borderColor: NAVY },
  pinDotFilled: { backgroundColor: GOLD },
  pinDotError: { backgroundColor: '#C43B3B', borderColor: '#C43B3B' },
  pinErrorText: { color: '#C43B3B', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 },
  key: { width: 92, height: 68, borderRadius: 16, backgroundColor: SOFT, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#DCE4EF' },
  keyHidden: { opacity: 0 },
  keyClear: { backgroundColor: '#EAF1F9' },
  keyText: { fontSize: 30, fontWeight: '800', color: NAVY },
  cancelButton: { marginTop: 24, padding: 12 },
  cancelText: { color: NAVY, fontSize: 20, fontWeight: '700' },
});
