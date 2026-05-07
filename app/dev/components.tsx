import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, SectionHeader } from '@/components/patterns';
import {
  Avatar,
  Button,
  Calendar,
  Glow,
  IconButton,
  Input,
  ListRow,
  PhotoCard,
  Pill,
  Text,
} from '@/components/ui';
import { T } from '@/lib/theme';

if (!__DEV__) {
  throw new Error('Dev route loaded in production build.');
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: T.sp4 }}>
      <Text variant="mono-eyebrow" color={T.ink3}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ComponentStories() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: T.sp7, gap: T.sp9, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Design" titleItalic="stories" />

        <Section title="TEXT — DISPLAY">
          <Text variant="display-l">Display Large</Text>
          <Text variant="display-italic-l">Display Italic L</Text>
          <Text variant="display-m">Display Medium</Text>
          <Text variant="display-italic-m">Display Italic M</Text>
          <Text variant="display-s">Display Small</Text>
          <Text variant="display-italic-s">Display Italic S</Text>
        </Section>

        <Section title="TEXT — UI">
          <Text variant="body">Body copy — 13.5 Inter 500</Text>
          <Text variant="body-strong">Body strong — 13.5 Inter 600</Text>
          <Text variant="label">Label — 15 Inter 600</Text>
          <Text variant="pill">Pill label — 12.5 Inter 600</Text>
          <Text variant="caption">Caption — 11 Inter 500</Text>
        </Section>

        <Section title="TEXT — MONO">
          <Text variant="mono-eyebrow">Mono eyebrow label</Text>
          <Text variant="mono-time">21:30 — 02:30 IST</Text>
          <Text variant="mono-unit">incl. GST</Text>
        </Section>

        <Section title="PILLS">
          <View style={{ flexDirection: 'row', gap: T.sp2, flexWrap: 'wrap' }}>
            <Pill label="Accent" flavor="accent" />
            <Pill label="Cream" flavor="cream" />
            <Pill label="Ghost" flavor="ghost" />
            <Pill label="Tinted" flavor="tinted" />
          </View>
          <View style={{ flexDirection: 'row', gap: T.sp2, flexWrap: 'wrap' }}>
            <Pill label="Large" size="lg" flavor="accent" />
            <Pill label="Medium" size="md" flavor="tinted" />
            <Pill label="Small" size="sm" flavor="ghost" />
          </View>
        </Section>

        <Section title="BUTTONS">
          <Button label="Primary CTA" onPress={() => {}} />
          <Button label="Loading state" onPress={() => {}} loading />
          <Button label="Disabled" onPress={() => {}} disabled />
        </Section>

        <Section title="ICON BUTTONS">
          <View style={{ flexDirection: 'row', gap: T.sp2 }}>
            <IconButton icon={<Text variant="body">←</Text>} context="surface" />
            <IconButton icon={<Text variant="body">↑</Text>} context="surface" />
            <IconButton icon={<Text variant="body">✕</Text>} context="photo" />
          </View>
        </Section>

        <Section title="AVATARS">
          <View style={{ flexDirection: 'row', gap: T.sp2, alignItems: 'center' }}>
            <Avatar size="sm" name="Arjun Singh" />
            <Avatar size="md" name="Priya Nair" />
            <Avatar size="lg" name="DJ Ankur" />
            <Avatar
              size="md"
              uri="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80"
            />
          </View>
        </Section>

        <Section title="INPUT">
          <Input placeholder="Type something…" />
          <Input placeholder="Error state" error />
        </Section>

        <Section title="LIST ROW">
          <ListRow title="Arjun Sharma" subtitle="DJ · Goa" avatarName="Arjun Sharma" />
          <ListRow
            title="Priya Nair"
            subtitle="Photographer · Mumbai"
            avatarUri="https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80"
          />
        </Section>

        <Section title="PHOTO CARD — HERO">
          <PhotoCard
            uri="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80"
            size="hero"
          >
            <View style={{ position: 'absolute', bottom: T.sp6, left: T.sp6, gap: T.sp2 }}>
              <Pill label="DJ" flavor="cream" size="sm" />
              <Text variant="tile-name">Arjun Sharma</Text>
              <Pill label="₹8,000 per event" flavor="accent" size="md" />
            </View>
          </PhotoCard>
        </Section>

        <Section title="PHOTO CARD — TILES">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PhotoCard
              uri="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80"
              size="tile"
              style={{ flex: 1 }}
            >
              <View style={{ position: 'absolute', bottom: T.sp4, left: T.sp4, gap: T.sp1 }}>
                <Pill label="DANCER" flavor="cream" size="sm" />
                <Text variant="tile-name">Sneha Roy</Text>
              </View>
            </PhotoCard>
            <PhotoCard
              uri="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80"
              size="tile"
              style={{ flex: 1 }}
            >
              <View style={{ position: 'absolute', bottom: T.sp4, left: T.sp4, gap: T.sp1 }}>
                <Pill label="PHOTOGRAPHER" flavor="cream" size="sm" />
                <Text variant="tile-name">Rahul Dev</Text>
              </View>
            </PhotoCard>
          </View>
        </Section>

        <Section title="CALENDAR">
          <Calendar
            year={new Date().getFullYear()}
            month={new Date().getMonth()}
            selected={[new Date()]}
            marked={[
              new Date(new Date().setDate(new Date().getDate() + 3)),
              new Date(new Date().setDate(new Date().getDate() + 7)),
            ]}
          />
        </Section>

        <Section title="GLOW">
          <View
            style={{
              height: 200,
              backgroundColor: T.surface,
              borderRadius: T.rCard,
              overflow: 'hidden',
            }}
          >
            <Glow size={200} style={{ top: 0, left: 0 }} />
          </View>
        </Section>

        <Section title="EMPTY STATE">
          <EmptyState
            headline="No artists"
            headlineItalic="yet"
            body="Be the first to join Crackerjack in your city."
            ctaLabel="Browse all cities"
            onCta={() => {}}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
