import { ReactElement } from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface ModalHeading {
  align: string;
  children: any;
  level?: HeadingLevel;
}

export default function ModalHeading(props: ModalHeading): ReactElement<any>;
