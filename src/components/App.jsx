import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Title = styled.h1`
  color: ${(props) => props.color};
`;

function App({ color }) {
  return (
    <div>
      <Title color={color}>Test App</Title>
    </div>
  );
}

App.propTypes = {
  color: PropTypes.string,
};

App.defaultProps = {
  color: 'black',
};

export default App;
