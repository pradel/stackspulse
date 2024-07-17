import JsTimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useMemo } from "react";

JsTimeAgo.addDefaultLocale(en);

const jsTimeAgo = new JsTimeAgo("en-US");

export const TimeAgo = ({ date }: { date: Date }) => {
  const text = useMemo(() => jsTimeAgo.format(date, "mini"), [date]);
  return text;
};
