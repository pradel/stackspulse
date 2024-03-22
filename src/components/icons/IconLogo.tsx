import * as React from "react";
import type { SVGProps } from "react";

export const IconLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={160}
    viewBox="0 0 160 160"
    fill="none"
    {...props}
  >
    <g fillOpacity={0.9} clipPath="url(#a)">
      <path
        fill="#F76B15"
        d="m145.216 160-33.939-51.426h48.802V89.26H0v19.473h48.803l-34.02 51.346H40.06l39.9-60.486 39.901 60.486h25.355V160Z"
      />
      <path
        fill="#fff"
        d="M112.151 50.79H160v19.632H0V50.79h47.849L14.228 0h25.355L79.88 61.282 120.338 0h25.355l-33.542 50.79Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h160v160H0z" />
      </clipPath>
    </defs>
  </svg>
);
