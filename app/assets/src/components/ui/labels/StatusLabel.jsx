import cx from "classnames";
import PropTypes from "prop-types";
import React from "react";

import BasicPopup from "~/components/BasicPopup";

import cs from "./status_label.scss";

class StatusLabel extends React.Component {
  render() {
    const { status, type, className, tooltipText, inline } = this.props;
    const label = (
      <div
        className={cx(className, cs.statusLabel, inline && cs.inline, cs[type])}
      >
        {status}
      </div>
    );

    if (tooltipText) {
      return (
        <BasicPopup
          trigger={label}
          content={tooltipText}
          position="top center"
        />
      );
    }

    return label;
  }
}

StatusLabel.propTypes = {
  className: PropTypes.string,
  status: PropTypes.node,
  type: PropTypes.oneOf([
    "beta",
    "default",
    "error",
    "info",
    "success",
    "warning",
  ]),
  tooltipText: PropTypes.string,
  inline: PropTypes.bool,
};

StatusLabel.defaultProps = {
  type: "default",
};

export default StatusLabel;
