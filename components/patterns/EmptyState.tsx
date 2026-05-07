import { View } from 'react-native';
import { Button, PhotoCard, Text } from '@/components/ui';
import { T } from '@/lib/theme';

type EmptyStateProps = {
  headline: string;
  headlineItalic?: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  imageUri?: string;
};

export default function EmptyState({
  headline,
  headlineItalic,
  body,
  ctaLabel,
  onCta,
  imageUri,
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: T.sp8,
        paddingHorizontal: T.sp7,
      }}
    >
      {imageUri ? (
        <PhotoCard uri={imageUri} size="footer" style={{ width: '100%' }} />
      ) : (
        <View
          style={{
            width: '100%',
            height: 170,
            borderRadius: T.rCard,
            backgroundColor: T.surface,
            borderWidth: 1,
            borderColor: T.line,
          }}
        />
      )}
      <View style={{ alignItems: 'center', gap: T.sp2 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Text variant="display-s">{headline} </Text>
          {headlineItalic ? <Text variant="display-italic-s">{headlineItalic}</Text> : null}
        </View>
        <Text variant="body" style={{ textAlign: 'center' }}>
          {body}
        </Text>
      </View>
      {ctaLabel && onCta ? <Button label={ctaLabel} onPress={onCta} /> : null}
    </View>
  );
}
