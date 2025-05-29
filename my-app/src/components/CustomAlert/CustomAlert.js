import React from 'react';
import { Alert as ReactstrapAlert } from 'reactstrap';

// Custom Alert component that handles timeout prop correctly
const CustomAlert = ({ timeout, fade = true, ...props }) => {
  // Set default timeout values
  const alertProps = {
    ...props,
    fade,
  };

  // Only add timeout if fade is true
  if (fade) {
    alertProps.timeout = timeout || 150; // Default timeout
  }

  return <ReactstrapAlert {...alertProps} />;
};

export default CustomAlert;