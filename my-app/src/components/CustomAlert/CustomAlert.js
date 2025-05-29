import React from 'react';
import { Alert as ReactstrapAlert } from 'reactstrap';

// Custom Alert component that handles timeout prop correctly
const CustomAlert = ({ timeout = 0, fade = true, ...props }) => {
  const alertProps = {
    ...props,
    fade,
  };

  // Only add timeout if fade is true and timeout is greater than 0
  if (fade && timeout > 0) {
    alertProps.timeout = timeout;
  }

  return <ReactstrapAlert {...alertProps} />;
};

export default CustomAlert;