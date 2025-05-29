import React from 'react';
import { Alert as ReactstrapAlert } from 'reactstrap';

// Custom Alert component that always passes a timeout prop to the underlying reactstrap Alert
const CustomAlert = (props) => {
  // Ensure timeout is always set, defaulting to 500ms if not provided
  // Also ensure fade is set to true when timeout is provided
  const alertProps = {
    ...props,
    fade: true,
    timeout: {
      enter: props.timeout?.enter || 500,
      exit: props.timeout?.exit || 500
    }
  };
  
  return <ReactstrapAlert {...alertProps} />;
};

export default CustomAlert; 