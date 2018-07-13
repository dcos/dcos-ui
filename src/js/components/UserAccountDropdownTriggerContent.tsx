import * as React from "react";

interface Props {
  onClick: () => void;
  primaryContent: React.ReactElement<any> | string;
  secondaryContent?: React.ReactElement<any> | string;
}

export default function UserAccountDropdownTriggerContent({
  onClick,
  primaryContent,
  secondaryContent = null
}: Props) {
  // Promote secondary content to primary content in the event that secondary
  // is the only available content.
  let primary = primaryContent;
  let secondary = secondaryContent;

  if (!primary && secondary) {
    primary = secondary;
    secondary = null;
  } else if (secondary) {
    secondary = <div className="header-subtitle">{secondary}</div>;
  }

  return (
    <header className="header" onClick={onClick}>
      <a className="header-dropdown">
        <div className="header-content">
          <div className="header-image-wrapper">
            <div className="header-image" />
          </div>
          <div className="header-details">
            <span className="header-title">
              <span>{primary}</span>
            </span>
            {secondary}
          </div>
        </div>
      </a>
    </header>
  );
}
