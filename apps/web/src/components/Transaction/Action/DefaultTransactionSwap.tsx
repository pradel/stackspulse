import { useGetFtMetadata } from "@/hooks/api/useGetFtMetadata";
import { displayPrice } from "@/lib/currencies";
import { Text } from "@radix-ui/themes";

interface DefaultTransactionSwapProps {
  tokenX: string;
  tokenXAmount: string;
  tokenY: string;
  tokenYAmount: string;
}

export const DefaultTransactionSwap = ({
  tokenX,
  tokenXAmount,
  tokenY,
  tokenYAmount,
}: DefaultTransactionSwapProps) => {
  const { data: tokenXInfo } = useGetFtMetadata({
    principal: tokenX,
  });
  const { data: tokenYInfo } = useGetFtMetadata({
    principal: tokenY,
  });

  if (!tokenXInfo || !tokenYInfo) {
    return <Text color="gray">Loading Swap...</Text>;
  }
  return (
    <>
      <Text color="gray">Swap</Text>{" "}
      {displayPrice(tokenXAmount, tokenXInfo.decimals || 6)} {tokenXInfo.symbol}{" "}
      <Text color="gray">for</Text>{" "}
      {displayPrice(tokenYAmount, tokenYInfo.decimals || 6)} {tokenYInfo.symbol}
    </>
  );
};
