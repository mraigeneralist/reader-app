import { useState } from 'react';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

import { text, type TextVariant } from '@/theme';

import { Txt } from './Txt';

type Props = {
  children: string;
  variant: TextVariant;
  numberOfLines?: number;
  /** Smallest font size to shrink to. */
  minSize?: number;
};

/** A line that ends inside a word: no trailing space or hyphen to break at. */
const breaksMidWord = (line: string) => !/[\s\-­]$/.test(line);

/**
 * Text that shrinks until no word is split across lines. Android breaks a word
 * that's wider than the line mid-way ("Self-improveme / nt"); a headline with a
 * long word should get smaller instead.
 */
export function FitText(props: Props) {
  // Remount per string so a new title starts at full size again.
  return <Fit key={props.children} {...props} />;
}

function Fit({ children, variant, numberOfLines, minSize = 18 }: Props) {
  const [size, setSize] = useState(text[variant].fontSize ?? 16);

  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const lines = e.nativeEvent.lines;
    if (size > minSize && lines.slice(0, -1).some((l) => breaksMidWord(l.text))) {
      setSize((s) => Math.max(minSize, s - 2));
    }
  };

  const base = text[variant];
  const scale = size / (base.fontSize ?? size);
  return (
    <Txt
      variant={variant}
      numberOfLines={numberOfLines}
      onTextLayout={onTextLayout}
      style={{ fontSize: size, lineHeight: base.lineHeight ? base.lineHeight * scale : undefined }}>
      {children}
    </Txt>
  );
}
