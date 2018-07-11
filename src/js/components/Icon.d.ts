import * as React from "react";

interface IconProps {
  className?: string[] | object | string;
  color?: string;
  family?: string;
  id: string;
  size?: string;
}

export default class Icon extends React.Component<IconProps> {}
