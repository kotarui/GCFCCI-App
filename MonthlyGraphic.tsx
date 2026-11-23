import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { WeekUpload } from '@/types';

const WHITE = '#FFFFFF';
const LIGHT_BG = '#F4F6F9';

interface Props {
  groupName?: string;
  day?: string;
  monthLabel?: string;
  time?: string;
  photos: WeekUpload[];
}

export function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isLandscapeBatchPhotos(photos: WeekUpload[]): boolean {
  if (!photos || photos.length === 0) return true;
  const landscapeCount = photos.filter(
    (p) => (p.width ?? 16) >= (p.height ?? 9)
  ).length;
  return landscapeCount >= photos.length / 2;
}

export default function MonthlyGraphic({ photos }: Props) {
  const isLandscape = isLandscapeBatchPhotos(photos);

  return (
    <View style={styles.container}>
      <View style={styles.collageGrid}>
        {photos.slice(0, 4).map((photo) => (
          <View
            key={photo.week}
            style={[
              styles.photoCard,
              isLandscape ? styles.landscapeCard : styles.portraitCard,
            ]}
          >
            <Image
              source={{ uri: photo.photoUri }}
              resizeMode="cover"
              style={styles.photo}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: WHITE,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collageGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 12,
  },
  photoCard: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: LIGHT_BG,
  },
  landscapeCard: {
    width: '47%',
    aspectRatio: 16 / 9,
  },
  portraitCard: {
    width: '22%',
    aspectRatio: 3 / 4,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
