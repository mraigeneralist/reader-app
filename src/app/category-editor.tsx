import { router, useLocalSearchParams } from 'expo-router';
import { Check as CheckIcon, Folder } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Icon, IconTile, Surface, Txt } from '@/components';
import { Input } from '@/components/Input';
import { RouteSheet } from '@/components/RouteSheet';
import { setBookCategory } from '@/db/books';
import { createCategory, deleteCategory, getCategory, updateCategory, useCategories } from '@/db/categories';
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES, canonicalIcon, iconFor } from '@/features/categories/icons';
import { border, categoryColors, colors, radius, shadow, themed } from '@/theme';

/** Screens 10–11 · New / Edit category. Pass `assign` to put a book in the new category. */
export default function CategoryEditor() {
  const { id, assign } = useLocalSearchParams<{ id?: string; assign?: string }>();
  const existing = id ? getCategory(id) : undefined;
  const count = useCategories().find((c) => c.id === id)?.bookCount ?? 0;
  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState<string>(existing?.color ?? categoryColors[0]);
  const [icon, setIcon] = useState(canonicalIcon(existing?.icon) ?? CATEGORY_ICON_NAMES[0]);

  const valid = name.trim().length > 0;

  const save = async () => {
    const input = { name: name.trim(), color, icon };
    if (existing) await updateCategory(existing.id, input);
    else {
      const newId = await createCategory(input);
      if (assign) await setBookCategory(assign, newId);
    }
    router.back();
  };

  // Read the fields up front: the React Compiler evaluates what a callback
  // depends on during render, so `existing!.id` would crash on the New sheet.
  const existingId = existing?.id;
  const existingName = existing?.name ?? '';
  const remove = () => {
    if (!existingId) return;
    Alert.alert(
      `Delete “${existingName}”?`,
      `Its ${count} ${count === 1 ? 'book moves' : 'books move'} to Unsorted. No files are deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(existingId);
            router.dismissTo('/categories');
          },
        },
      ],
    );
  };

  return (
    <RouteSheet>
      <Txt variant="sheetTitle">{existing ? 'Edit Category' : 'New Category'}</Txt>
      <View style={styles.field}>
        <Txt variant="label">Name</Txt>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Poetry"
          autoFocus={!existing}
          maxLength={40}
          returnKeyType="done"
          leading={<Icon icon={Folder} size={22} />}
        />
      </View>
      <View style={styles.group}>
        <Txt variant="label">Colour</Txt>
        <View style={styles.swatches}>
          {categoryColors.map((c) => (
            <Surface
              key={c}
              shadow={shadow.sm}
              selected={c === color}
              onPress={() => setColor(c)}
              accessibilityLabel={`Colour ${c}`}
              style={[styles.swatch, { backgroundColor: c }]}>
              {c === color && <Icon icon={CheckIcon} size={20} />}
            </Surface>
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <Txt variant="label">Icon</Txt>
        <View style={styles.icons}>
          {CATEGORY_ICON_NAMES.map((n) => (
            <Surface
              key={n}
              shadow={0}
              onPress={() => setIcon(n)}
              accessibilityLabel={`Icon ${CATEGORY_ICONS[n].name}`}
              style={[styles.iconRing, n === icon && styles.iconRingOn]}>
              <IconTile icon={iconFor(n)} color={n === icon ? color : colors.white} size={40} iconSize={22} />
            </Surface>
          ))}
        </View>
      </View>
      {existing ? (
        <>
          <Button block disabled={!valid} onPress={save}>
            Save changes
          </Button>
          <Button tone="pink" block onPress={remove}>
            Delete category
          </Button>
          <Txt variant="captionRegular">
            Its {count} {count === 1 ? 'book moves' : 'books move'} to Unsorted. No files are deleted.
          </Txt>
        </>
      ) : (
        <View style={styles.row}>
          <Button tone="paper" block style={styles.flex} onPress={() => router.back()}>
            Cancel
          </Button>
          <Button block style={styles.flex} disabled={!valid} onPress={save}>
            Create
          </Button>
        </View>
      )}
    </RouteSheet>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    field: { gap: 8 },
    group: { gap: 10 },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    swatch: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: border.width,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    // CSS outline with offset: a transparent ring that turns black when selected.
    iconRing: { padding: 3, borderRadius: radius.md + 6, borderWidth: 3, borderColor: 'transparent' },
    iconRingOn: { borderColor: colors.black },
    row: { flexDirection: 'row', gap: 12 },
    flex: { flex: 1 },
  }),
);
