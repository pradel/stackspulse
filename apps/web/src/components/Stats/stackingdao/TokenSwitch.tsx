"use client";

import type { StackingDAOToken } from "@/lib/api";
import { stackingDAOTokens } from "@/lib/stackingdao";
import { SegmentedControl } from "@radix-ui/themes";

interface TokenSwitchProps<T extends StackingDAOToken> {
  tokens: readonly T[];
  value: T;
  onValueChange: (token: T) => void;
}

export const TokenSwitch = <T extends StackingDAOToken>({
  tokens,
  value,
  onValueChange,
}: TokenSwitchProps<T>) => {
  return (
    <SegmentedControl.Root
      size="1"
      value={value}
      // SAFETY: the items below only carry values from `tokens`.
      onValueChange={(token) => onValueChange(token as T)}
    >
      {tokens.map((token) => (
        <SegmentedControl.Item key={token} value={token}>
          {stackingDAOTokens[token].name}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  );
};
