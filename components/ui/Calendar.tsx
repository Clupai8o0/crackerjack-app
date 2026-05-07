import { Pressable, View } from 'react-native';
import { T } from '@/lib/theme';
import Text from './Text';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

type CalendarProps = {
  year: number;
  month: number;
  selected?: Date[];
  marked?: Date[];
  onDayPress?: (date: Date) => void;
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({
  year,
  month,
  selected = [],
  marked = [],
  onDayPress,
}: CalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), inMonth: false });
    }
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: T.sp4 }}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="mono-eyebrow">{day}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: T.sp4 }}>
        {cells.map(({ date, inMonth }) => {
          const isSelected = selected.some((s) => isSameDay(s, date));
          const isMarked = !isSelected && marked.some((m) => isSameDay(m, date));
          const cellKey = date.toISOString().slice(0, 10);

          return (
            <Pressable
              key={cellKey}
              onPress={() => inMonth && onDayPress?.(date)}
              style={{
                width: '14.285714%',
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel={date.toLocaleDateString()}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: T.rPill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? T.accent : 'transparent',
                  borderWidth: isMarked ? 1.5 : 0,
                  borderColor: 'rgba(245,241,235,0.45)',
                  borderStyle: isMarked ? 'dashed' : 'solid',
                }}
              >
                <Text
                  variant="body-strong"
                  style={{
                    fontSize: 13,
                    color: isSelected ? T.inkDeep : inMonth ? T.ink : T.ink3,
                    opacity: inMonth ? 1 : 0.45,
                    fontFamily: isSelected ? T.sansSemiBold : T.sans,
                  }}
                >
                  {date.getDate().toString()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
