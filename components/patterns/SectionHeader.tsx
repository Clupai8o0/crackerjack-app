import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { T } from '@/lib/theme';

type SectionHeaderProps = {
  title: string;
  titleItalic?: string;
  onSeeAll?: () => void;
};

export default function SectionHeader({ title, titleItalic, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Text variant="display-s">{title} </Text>
        {titleItalic ? <Text variant="display-italic-s">{titleItalic}</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text variant="caption" color={T.ink2}>
            See all
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
